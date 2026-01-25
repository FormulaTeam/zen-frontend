import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ConditionUtils,
  FieldTypeIds,
  Form,
  FormField,
  ResponseFieldValue,
  ResponseForm,
  Role,
  SearchResponsesFilter,
} from "../utils/interfaces";

import { getFormById, searchResponses } from "../api";
import { useConnectedFormOptions } from "./useConnectedFormOptions";
import { checkUserAccessForResponse } from "../utils/utils";
import { NOT_A_SECTION_ID } from "../utils/sections/consts";
import { IPath } from "../types/enums/global.enums";
import { isDifferent } from "../utils/responses";

import { buildDynamicRowSchema, ResponseRow } from "../validation/buildDynamicRowSchema";

interface SectionsMap {
  [sectionId: string]: {
    name?: string;
    description?: string;
    fields: FormField[];
    order: number;
    id?: string;
  };
}

/**
 * Validity Types
 * - Simple fields: true OR { valid:false, message }
 * - Link/location: keep per-part booleans + per-part messages
 */
type LinkValidity = { link: boolean; linkTxt: boolean; linkMsg?: string; linkTxtMsg?: string };
type LocationValidity = { x: boolean; y: boolean; xMsg?: string; yMsg?: string };
type Invalid = { valid: false; message: string };
export type FieldValidity = true | Invalid | LinkValidity | LocationValidity;

const initFieldValidity = (field: FormField): FieldValidity => {
  if (field.typeId === FieldTypeIds.link) return { link: true, linkTxt: true };
  if (field.typeId === FieldTypeIds.location) return { x: true, y: true };
  return true;
};

const rowFromValuesMap = (m: Map<string, unknown>): ResponseRow => {
  const row: ResponseRow = {};
  m.forEach((v, k) => {
    row[String(k)] = v;
  });
  return row;
};

const evaluateVisibility = (field: FormField, row: ResponseRow, allFields: FormField[]) => {
  if (!field.conditions?.length) return true;
  const conditionsRoot = { groups: field.conditions, affectedTargets: [] as any[] };
  try {
    return ConditionUtils.evaluateConditionsRoot(conditionsRoot, row, allFields);
  } catch {
    return true;
  }
};

const isLinkValidity = (v: FieldValidity | undefined): v is LinkValidity =>
  !!v && typeof v === "object" && "link" in v && "linkTxt" in v;

const isLocationValidity = (v: FieldValidity | undefined): v is LocationValidity =>
  !!v && typeof v === "object" && "x" in v && "y" in v;

const setIssueValidity = (
  validMap: Map<string, FieldValidity>,
  fieldsById: Map<string, FormField>,
  issuePath: (string | number)[],
  message: string,
) => {
  const fieldId = issuePath?.[0];
  if (typeof fieldId !== "string") return;

  const field = fieldsById.get(fieldId);
  if (!field) {
    validMap.set(fieldId, { valid: false, message });
    return;
  }

  // Link field: expect paths like [fieldId, "link"] or [fieldId, "linkTxt"]
  if (field.typeId === FieldTypeIds.link) {
    const current = validMap.get(fieldId);
    const next: LinkValidity = isLinkValidity(current)
      ? { ...current }
      : { link: true, linkTxt: true };

    const part = issuePath?.[1];
    if (part === "link") {
      next.link = false;
      next.linkMsg = message;
    } else if (part === "linkTxt") {
      next.linkTxt = false;
      next.linkTxtMsg = message;
    } else {
      next.link = false;
      next.linkTxt = false;
      next.linkMsg = message;
      next.linkTxtMsg = message;
    }

    validMap.set(fieldId, next);
    return;
  }

  // Location field: expect paths like [fieldId, "x"] or [fieldId, "y"]
  if (field.typeId === FieldTypeIds.location) {
    const current = validMap.get(fieldId);
    const next: LocationValidity = isLocationValidity(current)
      ? { ...current }
      : { x: true, y: true };

    const part = issuePath?.[1];
    if (part === "x") {
      next.x = false;
      next.xMsg = message;
    } else if (part === "y") {
      next.y = false;
      next.yMsg = message;
    } else {
      next.x = false;
      next.y = false;
      next.xMsg = message;
      next.yMsg = message;
    }

    validMap.set(fieldId, next);
    return;
  }

  // Simple field
  validMap.set(fieldId, { valid: false, message });
};

const markAllTouched = (fields: FormField[], prev: Record<string, boolean>) =>
  fields.reduce<Record<string, boolean>>(
    (acc, f) => {
      acc[String(f.uniqueId)] = true;
      return acc;
    },
    { ...prev },
  );

export const useResponseState = (
  formId: string | undefined,
  responseId: string | undefined,
  viewMode: boolean,
  copyMode: boolean,
  roles?: Role[],
  user?: any,
  isSuperAdmin?: boolean,
  setHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void,
) => {
  const [formTitle, setFormTitle] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formFieldsByIdMap, setFormFieldsByIdsMap] = useState<
    Map<string, FormField & ResponseFieldValue>
  >(new Map());

  const [formFieldsValuesMap, setFormFieldsValuesMap] = useState<Map<string, any>>(new Map());
  const [formFieldsValidMap, setFormFieldsValidMap] = useState<Map<string, FieldValidity>>(
    new Map(),
  );

  // replaces Set with plain object map
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState<Form | null>(null);
  const [response, setResponse] = useState<ResponseForm | null>(null);
  const [loading, setLoading] = useState(true);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const navigate = useNavigate();

  const { fieldOptions, isLoading: loadingConnections } = useConnectedFormOptions({
    formFields: form?.fields || [],
  });

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Load form + response (no "let cancelled")
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      if (formId) {
        const f = await getFormById(Number(formId));
        if (!controller.signal.aborted && f) setForm(f);
      }

      if (responseId && formId) {
        const filter: SearchResponsesFilter = {
          form_id: Number(formId),
          searchFilters: [{ searchText: Number(responseId), searchField: "id" }],
        };

        const res: any = await searchResponses(filter);
        const first = res?.responses?.[0];

        if (!controller.signal.aborted && first) {
          setResponse(copyMode ? { ...first, id: null } : first);
        }
      }
    })();

    return () => {
      controller.abort();
    };
  }, [formId, responseId, copyMode]);

  // Init state once we have form (+ response if editing)
  useEffect(() => {
    if (!form) return;

    if (roles?.length) {
      const ok = checkUserAccessForResponse(roles, viewMode, response, form, user, isSuperAdmin);
      if (!ok) {
        navigate(IPath.ERROR, { replace: true });
        return;
      }
    }

    const fields = form.fields ?? [];
    setFormFields(fields);

    const byId = new Map<string, FormField & ResponseFieldValue>();
    const values = new Map<string, any>();
    const valid = new Map<string, FieldValidity>();

    fields.forEach((field: any) => {
      const uniqueId = String(field?.uniqueId || field?.uniqId);
      byId.set(uniqueId, field);

      const defaultValue =
        field.typeId === FieldTypeIds.number && field?.initialNumberValue !== undefined
          ? field.initialNumberValue
          : field.typeId === FieldTypeIds.checkbox && field?.defaultValue !== undefined
          ? field.defaultValue
          : field?.value;

      values.set(uniqueId, defaultValue);
      valid.set(uniqueId, initFieldValidity(field));
    });

    if (responseId && response) {
      response.data?.forEach((rf: any) => {
        values.set(String(rf.uniqueId), rf?.value);
      });
    }

    setFormFieldsByIdsMap(byId);
    setFormFieldsValuesMap(values);
    setFormFieldsValidMap(valid);
    setTouchedFields({});

    setFormTitle(
      viewMode
        ? "צפייה בתגובה - " + form.name
        : responseId
        ? (copyMode ? "יצירת תגובה - " : "עריכת תגובה - ") + form.name
        : "יצירת תגובה - " + form.name,
    );

    setLoading(false);
  }, [form, response, responseId, viewMode, copyMode, roles, user, isSuperAdmin, navigate]);

  // Current row
  const rowObject = useMemo(() => rowFromValuesMap(formFieldsValuesMap), [formFieldsValuesMap]);

  // Visible fields
  const visibleFormFields = useMemo(() => {
    return formFields.filter((f) => evaluateVisibility(f, rowObject, formFields));
  }, [formFields, rowObject]);

  useEffect(() => {
    if (!formFields.length) return;

    const visibleIds = new Set(visibleFormFields.map((f) => String(f.uniqueId)));

    setFormFieldsValuesMap((prev) => {
      const next = new Map(prev);

      const changed = formFields.some((f) => {
        const id = String(f.uniqueId);
        if (visibleIds.has(id)) return false;

        const current = next.get(id);
        const shouldClear =
          current !== undefined && current !== null && current !== "" && current !== false;
        if (!shouldClear) return false;

        next.set(id, f.typeId === FieldTypeIds.checkbox ? false : "");
        return true;
      });

      return changed ? next : prev;
    });

    setFormFieldsValidMap((prev) => {
      const next = new Map(prev);

      const changed = formFields.some((f) => {
        const id = String(f.uniqueId);
        if (visibleIds.has(id)) return false;

        const reset = initFieldValidity(f);
        const current = next.get(id);

        // shallow-ish compare (good enough for our shapes)
        const same = JSON.stringify(current) === JSON.stringify(reset);
        if (same) return false;

        next.set(id, reset);
        return true;
      });

      return changed ? next : prev;
    });

    setTouchedFields((prev) => {
      const keys = Object.keys(prev);
      const changed = keys.some((id) => !visibleIds.has(id));
      if (!changed) return prev;

      const next = { ...prev };
      keys.forEach((id) => {
        if (!visibleIds.has(id)) delete next[id];
      });
      return next;
    });
  }, [formFields, visibleFormFields]);

  const applyDependentOptionsCleanup = useCallback(
    (nextValues: Map<string, any>, parentUniqueId: string, parentValue: any) => {
      if (!formFields.length) return;

      const childFields = formFields.filter(
        (f) => String(f.parentFieldId) === String(parentUniqueId),
      );
      if (!childFields.length) return;

      const parentField = formFields.find((f) => String(f.uniqueId) === String(parentUniqueId));
      if (!parentField?.options?.length) return;

      const parentValues = Array.isArray(parentValue) ? parentValue : [parentValue];

      childFields.forEach((childField) => {
        if (childField.typeId !== FieldTypeIds.options || !childField.parentDependencies?.length)
          return;

        const allowed = new Set<string>();

        parentValues.forEach((pv) => {
          const parentIndex = parentField.options!.indexOf(pv);
          if (parentIndex !== -1) {
            const dep = childField.parentDependencies!.find(
              (d) => d.parentOptionIndex === parentIndex,
            );
            dep?.childOptionIndices.forEach((childIdx) => {
              const opt = childField.options?.[childIdx];
              if (opt) allowed.add(opt);
            });
          }
        });

        const childId = String(childField.uniqueId);
        const current = nextValues.get(childId);

        if (allowed.size > 0 && current) {
          const currentArr = Array.isArray(current) ? current : [current];
          const filtered = currentArr.filter((v) => allowed.has(v));
          if (filtered.length !== currentArr.length) {
            nextValues.set(childId, childField.multiSelect ? filtered : filtered[0] ?? "");
          }
        } else if (parentValues.length > 0) {
          nextValues.set(childId, childField.multiSelect ? [] : "");
        }
      });
    },
    [formFields],
  );

  // Change handler: ONLY updates values.
  // (Validation and "show error" happen on blur via onBlurField)
  const onChangeHandler = useCallback(
    (value: any, uniqueId: string) => {
      setFormFieldsValuesMap((prev) => {
        const next = new Map(prev);
        const prevValue = prev.get(uniqueId);

        if (isDifferent(prevValue, value)) setHasUnsavedChanges?.(true);

        next.set(uniqueId, value);
        applyDependentOptionsCleanup(next, uniqueId, value);

        return next;
      });
    },
    [applyDependentOptionsCleanup, setHasUnsavedChanges],
  );

  // Shared validation runner
  const runValidation = useCallback(async () => {
    if (!form) return null;

    const row = rowFromValuesMap(formFieldsValuesMap);

    const { schema, visibleFields } = await buildDynamicRowSchema(
      form,
      row,
      async (id: number) => getFormById(id),
      [form.id],
    );

    const byId = new Map<string, FormField>();
    visibleFields.forEach((f) => byId.set(String(f.uniqueId), f));

    const baseValid = new Map(formFieldsValidMap);
    visibleFields.forEach((f) => baseValid.set(String(f.uniqueId), initFieldValidity(f)));

    const result = await schema.safeParseAsync(row);

    return { result, visibleFields, byId, baseValid };
  }, [form, formFieldsValuesMap, formFieldsValidMap]);

  /**
   * Validate ALL visible fields (used on Save).
   * Returns true if valid.
   */
  const validateVisibleFields = useCallback(async (): Promise<boolean> => {
    const out = await runValidation();
    if (!out) return false;

    const { result, visibleFields, byId, baseValid } = out;

    if (result.success) {
      setFormFieldsValidMap(baseValid);
      setTouchedFields((prev) => markAllTouched(visibleFields, prev));
      return true;
    }

    result.error.issues.forEach((issue) => {
      setIssueValidity(baseValid, byId, issue.path as any, issue.message);
    });

    setFormFieldsValidMap(baseValid);
    setTouchedFields((prev) => markAllTouched(visibleFields, prev));
    return false;
  }, [runValidation]);

  /**
   * Validate ONE field on blur.
   * - Marks the field as touched
   * - Validates the row
   * - Updates validity ONLY for that field (including link/location subparts)
   */
  const onBlurField = useCallback(
    async (uniqueId: string) => {
      const id = String(uniqueId);
      setTouchedFields((prev) => ({ ...prev, [id]: true }));

      const out = await runValidation();
      if (!out) return;

      const { result, visibleFields, byId } = out;

      // keep other fields as-is; reset + apply issues only for this field
      const nextValid = new Map(formFieldsValidMap);
      const field = visibleFields.find((f) => String(f.uniqueId) === id);
      if (field) nextValid.set(id, initFieldValidity(field));

      if (!result.success) {
        result.error.issues
          .filter((issue) => String(issue.path?.[0]) === id)
          .forEach((issue) => {
            setIssueValidity(nextValid, byId, issue.path as any, issue.message);
          });
      }

      setFormFieldsValidMap(nextValid);
    },
    [runValidation, formFieldsValidMap],
  );

  const responsSections: SectionsMap = useMemo(() => {
    return visibleFormFields.reduce((acc: SectionsMap, field: FormField) => {
      const sectionId = field.sectionId || NOT_A_SECTION_ID;

      if (!acc[sectionId]) {
        acc[sectionId] = {
          name: field.sectionName || undefined,
          description: field.sectionDescription || undefined,
          fields: [],
          order: field.sectionOrder,
          id: field.sectionId,
        };
      }

      acc[sectionId].fields.push(field);
      return acc;
    }, {});
  }, [visibleFormFields]);

  return {
    formTitle,
    formFields: visibleFormFields,
    formFieldsByIdMap,
    formFieldsValuesMap,
    formFieldsValidMap,

    touchedFields,

    onChangeHandler,
    onBlurField,
    validateVisibleFields,

    loading,
    form,
    response,

    fieldOptions,
    loadingConnections,

    responsSections,
    collapsedSections,
    toggleSectionCollapse,
  };
};
