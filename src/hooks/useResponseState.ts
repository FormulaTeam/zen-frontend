import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
export type LinkValidity = {
  link: boolean;
  linkTxt: boolean;
  linkMsg?: string;
  linkTxtMsg?: string;
};
export type LocationValidity = { x: boolean; y: boolean; xMsg?: string; yMsg?: string };
type Invalid = { valid: false; message: string };
export type FieldValidity = true | Invalid | LinkValidity | LocationValidity;

// Helpers
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

  // Link field: paths like [fieldId, "link"] or [fieldId, "linkTxt"]
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

  // Location field: paths like [fieldId, "x"] or [fieldId, "y"]
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
  const navigate = useNavigate();

  const [formTitle, setFormTitle] = useState("");
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [formFieldsByIdMap, setFormFieldsByIdsMap] = useState<
    Map<string, FormField & ResponseFieldValue>
  >(new Map());

  const [formFieldsValuesMap, setFormFieldsValuesMap] = useState<Map<string, any>>(new Map());
  const [formFieldsValidMap, setFormFieldsValidMap] = useState<Map<string, FieldValidity>>(
    new Map(),
  );
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  const [form, setForm] = useState<Form | null>(null);
  const [response, setResponse] = useState<ResponseForm | null>(null);
  const [loading, setLoading] = useState(true);

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const { fieldOptions, isLoading: loadingConnections } = useConnectedFormOptions({
    formFields: form?.fields || [],
  });

  // Always-current refs (avoid stale async reads)
  const valuesRef = useRef(formFieldsValuesMap);
  const validRef = useRef(formFieldsValidMap);
  const touchedRef = useRef(touchedFields);

  useEffect(() => void (valuesRef.current = formFieldsValuesMap), [formFieldsValuesMap]);
  useEffect(() => void (validRef.current = formFieldsValidMap), [formFieldsValidMap]);
  useEffect(() => void (touchedRef.current = touchedFields), [touchedFields]);

  // Prevent async validation races (older results overwriting newer ones)
  const validationSeqRef = useRef(0);

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Load form + response
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

    return () => controller.abort();
  }, [formId, responseId, copyMode]);

  // Initialize state once form is ready
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
      const id = String(field?.uniqueId || field?.uniqId);
      byId.set(id, field);

      const defaultValue =
        field.typeId === FieldTypeIds.file
          ? field?.value && typeof field.value === "object"
            ? field.value
            : { files: [] }
          : field.typeId === FieldTypeIds.number && field?.initialNumberValue !== undefined
          ? field.initialNumberValue
          : field.typeId === FieldTypeIds.checkbox && field?.defaultValue !== undefined
          ? field.defaultValue
          : field?.value;

      values.set(id, defaultValue);
      valid.set(id, initFieldValidity(field));
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
        ? `צפייה בתגובה - ${form.name}`
        : responseId
        ? `${copyMode ? "יצירת תגובה - " : "עריכת תגובה - "}${form.name}`
        : `יצירת תגובה - ${form.name}`,
    );

    setLoading(false);
  }, [form, response, responseId, viewMode, copyMode, roles, user, isSuperAdmin, navigate]);

  // Visibility
  const rowObject = useMemo(() => rowFromValuesMap(formFieldsValuesMap), [formFieldsValuesMap]);

  const visibleFormFields = useMemo(
    () => formFields.filter((f) => evaluateVisibility(f, rowObject, formFields)),
    [formFields, rowObject],
  );

  // Clear hidden field values/validity/touched
  useEffect(() => {
    if (!formFields.length) return;

    const visibleIds = new Set(visibleFormFields.map((f) => String(f.uniqueId)));

    setFormFieldsValuesMap((prev) => {
      const next = new Map(prev);
      let changed = false;

      formFields.forEach((f) => {
        const id = String(f.uniqueId);
        if (visibleIds.has(id)) return;

        const current = next.get(id);
        const shouldClear =
          current !== undefined && current !== null && current !== "" && current !== false;
        if (!shouldClear) return;

        if (f.typeId === FieldTypeIds.checkbox) next.set(id, false);
        else if (f.typeId === FieldTypeIds.file) next.set(id, { files: [] });
        else next.set(id, "");
        changed = true;
      });

      if (changed) valuesRef.current = next;
      return changed ? next : prev;
    });

    setFormFieldsValidMap((prev) => {
      const next = new Map(prev);
      let changed = false;

      formFields.forEach((f) => {
        const id = String(f.uniqueId);
        if (visibleIds.has(id)) return;

        const reset = initFieldValidity(f);
        const current = next.get(id);
        if (JSON.stringify(current) === JSON.stringify(reset)) return;

        next.set(id, reset);
        changed = true;
      });

      if (changed) validRef.current = next;
      return changed ? next : prev;
    });

    setTouchedFields((prev) => {
      const keys = Object.keys(prev);
      const toRemove = keys.filter((id) => !visibleIds.has(id));
      if (!toRemove.length) return prev;

      const next = { ...prev };
      toRemove.forEach((id) => delete next[id]);
      return next;
    });
  }, [formFields, visibleFormFields]);

  // Dependent options cleanup
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
          if (parentIndex === -1) return;

          const dep = childField.parentDependencies!.find(
            (d) => d.parentOptionIndex === parentIndex,
          );
          dep?.childOptionIndices.forEach((childIdx) => {
            const opt = childField.options?.[childIdx];
            if (opt) allowed.add(opt);
          });
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

  // Validation
  const runValidation = useCallback(
    async (valuesOverride?: Map<string, any>) => {
      if (!form) return null;

      const row = rowFromValuesMap(valuesOverride ?? valuesRef.current);

      const { schema, visibleFields } = await buildDynamicRowSchema(
        form,
        row,
        async (id: number) => getFormById(id),
        [form.id],
      );

      const byId = new Map<string, FormField>();
      visibleFields.forEach((f) => byId.set(String(f.uniqueId), f));

      const baseValid = new Map(validRef.current);
      visibleFields.forEach((f) => baseValid.set(String(f.uniqueId), initFieldValidity(f)));

      const result = await schema.safeParseAsync(row);
      return { result, visibleFields, byId, baseValid };
    },
    [form],
  );

  const revalidateFieldIfTouched = useCallback(
    async (uniqueId: string, valuesSnapshot?: Map<string, any>) => {
      const id = String(uniqueId);
      if (!touchedRef.current?.[id]) return;

      const seq = ++validationSeqRef.current;

      const out = await runValidation(valuesSnapshot);
      if (!out) return;

      if (seq !== validationSeqRef.current) return; // ignore stale results

      const { result, visibleFields, byId } = out;
      const field = visibleFields.find((f) => String(f.uniqueId) === id);
      if (!field) return;

      const nextValid = new Map(validRef.current);
      nextValid.set(id, initFieldValidity(field));

      if (!result.success) {
        result.error.issues
          .filter((issue) => String(issue.path?.[0]) === id)
          .forEach((issue) => setIssueValidity(nextValid, byId, issue.path as any, issue.message));
      }

      validRef.current = nextValid;
      setFormFieldsValidMap(nextValid);
    },
    [runValidation],
  );

  const validateVisibleFields = useCallback(async (): Promise<boolean> => {
    const seq = ++validationSeqRef.current;

    const out = await runValidation();
    if (!out) return false;

    if (seq !== validationSeqRef.current) return false; // ignore stale results

    const { result, visibleFields, byId, baseValid } = out;

    if (result.success) {
      validRef.current = baseValid;
      setFormFieldsValidMap(baseValid);
      setTouchedFields((prev) => markAllTouched(visibleFields, prev));
      return true;
    }

    result.error.issues.forEach((issue) => {
      setIssueValidity(baseValid, byId, issue.path as any, issue.message);
    });

    validRef.current = baseValid;
    setFormFieldsValidMap(baseValid);
    setTouchedFields((prev) => markAllTouched(visibleFields, prev));
    return false;
  }, [runValidation]);

  const onBlurField = useCallback(
    async (uniqueId: string, part?: "x" | "y" | "link" | "linkTxt") => {
      const id = String(uniqueId);

      setTouchedFields((prev) => {
        if (prev[id]) return prev;
        return { ...prev, [id]: true };
      });

      const seq = ++validationSeqRef.current;

      const out = await runValidation();
      if (!out) return;

      if (seq !== validationSeqRef.current) return; // ignore stale results

      const { result, visibleFields, byId } = out;

      const nextValid = new Map(validRef.current);

      const field = visibleFields.find((f) => String(f.uniqueId) === id);
      if (field) {
        const reset = initFieldValidity(field);
        const current = nextValid.get(id);

        // If a sub-part is provided, reset only that part's message/flag
        if (part && current && typeof current === "object" && reset && typeof reset === "object") {
          const merged: any = { ...current };

          if (part === "x" || part === "y") {
            merged[part] = (reset as any)[part];
            merged[`${part}Msg`] = undefined;
          } else if (part === "link" || part === "linkTxt") {
            merged[part] = (reset as any)[part];
            merged[`${part}Msg`] = undefined;
          } else {
            Object.assign(merged, reset);
          }

          nextValid.set(id, merged);
        } else {
          nextValid.set(id, reset);
        }
      }

      if (!result.success) {
        result.error.issues
          .filter((issue) => {
            if (String(issue.path?.[0]) !== id) return false;
            if (part) return String(issue.path?.[1]) === part;
            return true;
          })
          .forEach((issue) => setIssueValidity(nextValid, byId, issue.path as any, issue.message));
      }

      validRef.current = nextValid;
      setFormFieldsValidMap(nextValid);
    },
    [runValidation],
  );

  // Change handler
  const onChangeHandler = useCallback(
    (value: any, uniqueId: string, _inputValid?: any) => {
      let snapshot: Map<string, any> | null = null;

      setFormFieldsValuesMap((prev) => {
        const next = new Map(prev);
        const prevValue = prev.get(uniqueId);

        if (isDifferent(prevValue, value)) setHasUnsavedChanges?.(true);

        next.set(uniqueId, value);
        applyDependentOptionsCleanup(next, uniqueId, value);

        valuesRef.current = next;
        snapshot = next;

        return next;
      });

      if (snapshot) void revalidateFieldIfTouched(uniqueId, snapshot);
      else void revalidateFieldIfTouched(uniqueId);
    },
    [applyDependentOptionsCleanup, setHasUnsavedChanges, revalidateFieldIfTouched],
  );

  // Sections
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
