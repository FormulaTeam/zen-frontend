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

type LinkFlags = { link: boolean; linkTxt: boolean };
type LocationFlags = { x: boolean; y: boolean };
type FieldValidity = boolean | LinkFlags | LocationFlags;

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

const setIssueValidity = (
  validMap: Map<string, FieldValidity>,
  fieldsById: Map<string, FormField>,
  issuePath: (string | number)[],
) => {
  const fieldId = issuePath?.[0];
  if (typeof fieldId !== "string") return;

  const field = fieldsById.get(fieldId);

  if (!field) {
    validMap.set(fieldId, false);
    return;
  }

  if (field.typeId === FieldTypeIds.link) {
    const current = validMap.get(fieldId);
    const flags: LinkFlags =
      current && typeof current === "object" && "link" in current && "linkTxt" in current
        ? (current as LinkFlags)
        : { link: true, linkTxt: true };

    const part = issuePath?.[1];
    if (part === "link") flags.link = false;
    else if (part === "linkTxt") flags.linkTxt = false;
    else {
      flags.link = false;
      flags.linkTxt = false;
    }

    validMap.set(fieldId, { ...flags });
    return;
  }

  if (field.typeId === FieldTypeIds.location) {
    const current = validMap.get(fieldId);
    const flags: LocationFlags =
      current && typeof current === "object" && "x" in current && "y" in current
        ? (current as LocationFlags)
        : { x: true, y: true };

    const part = issuePath?.[1];
    if (part === "x") flags.x = false;
    else if (part === "y") flags.y = false;
    else {
      flags.x = false;
      flags.y = false;
    }

    validMap.set(fieldId, { ...flags });
    return;
  }

  validMap.set(fieldId, false);
};

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
  const [interactedFields, setInteractedFields] = useState<Set<string>>(new Set());

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

  /** Load form + response */
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (formId) {
        const f = await getFormById(Number(formId));
        if (!cancelled && f) setForm(f);
      }

      if (responseId && formId) {
        const filter: SearchResponsesFilter = {
          form_id: Number(formId),
          searchFilters: [{ searchText: Number(responseId), searchField: "id" }],
        };

        const res: any = await searchResponses(filter);
        const first = res?.responses?.[0];

        if (!cancelled && first) {
          if (copyMode) setResponse({ ...first, id: null });
          else setResponse(first);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [formId, responseId, copyMode]);

  /** Init state once we have form (+ response if editing) */
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

      let defaultValue = field?.value;
      if (field.typeId === FieldTypeIds.number && field?.initialNumberValue !== undefined) {
        defaultValue = field.initialNumberValue;
      } else if (field.typeId === FieldTypeIds.checkbox && field?.defaultValue !== undefined) {
        defaultValue = field.defaultValue;
      }

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

    if (viewMode) setFormTitle("צפייה בתגובה - " + form.name);
    else if (responseId) setFormTitle((copyMode ? "יצירת תגובה - " : "עריכת תגובה - ") + form.name);
    else setFormTitle("יצירת תגובה - " + form.name);

    setLoading(false);
  }, [form, response, responseId, viewMode, copyMode, roles, user, isSuperAdmin, navigate]);

  /** Current row (used for visibility + validation) */
  const rowObject = useMemo(() => rowFromValuesMap(formFieldsValuesMap), [formFieldsValuesMap]);

  /** Visible fields (pure memo) */
  const visibleFormFields = useMemo(() => {
    const visible = formFields.filter((f) => evaluateVisibility(f, rowObject, formFields));

    console.log(
      "====== visible fields",
      visible.map((f) => ({ id: String(f.uniqueId), name: f.displayName, typeId: f.typeId })),
    );

    return visible;
  }, [formFields, rowObject]);

  /** Clear hidden fields (values + validity) */
  useEffect(() => {
    if (!formFields.length) return;

    const visibleIds = new Set(visibleFormFields.map((f) => String(f.uniqueId)));

    setFormFieldsValuesMap((prev) => {
      const next = new Map(prev);
      const changed = formFields.some((f) => {
        const id = String(f.uniqueId);
        if (visibleIds.has(id)) return false;

        const current = next.get(id);
        if (current !== undefined && current !== null && current !== "" && current !== false) {
          next.set(id, f.typeId === FieldTypeIds.checkbox ? false : "");
          return true;
        }
        return false;
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
        if (JSON.stringify(current) !== JSON.stringify(reset)) {
          next.set(id, reset);
          return true;
        }
        return false;
      });

      return changed ? next : prev;
    });
  }, [formFields, visibleFormFields]);

  /** Optional UX: sanitize dependent options */
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
            if (dep) {
              dep.childOptionIndices.forEach((childIdx) => {
                const opt = childField.options?.[childIdx];
                if (opt) allowed.add(opt);
              });
            }
          }
        });

        const childId = String(childField.uniqueId);
        const current = nextValues.get(childId);

        if (allowed.size > 0) {
          if (current) {
            const currentArr = Array.isArray(current) ? current : [current];
            const filtered = currentArr.filter((v) => allowed.has(v));

            if (filtered.length !== currentArr.length) {
              nextValues.set(childId, childField.multiSelect ? filtered : filtered[0] ?? "");
            }
          }
        } else if (parentValues.length > 0) {
          nextValues.set(childId, childField.multiSelect ? [] : "");
        }
      });
    },
    [formFields],
  );

  /** Change handler */
  const onChangeHandler = useCallback(
    (value: any, uniqueId: string) => {
      console.log("====== onChange", { uniqueId, value });

      setFormFieldsValuesMap((prev) => {
        const next = new Map(prev);
        const prevValue = prev.get(uniqueId);

        if (isDifferent(prevValue, value)) setHasUnsavedChanges?.(true);

        next.set(uniqueId, value);
        applyDependentOptionsCleanup(next, uniqueId, value);

        return next;
      });

      setInteractedFields((prev) => {
        const next = new Set(prev);
        next.add(uniqueId);
        return next;
      });
    },
    [applyDependentOptionsCleanup, setHasUnsavedChanges],
  );

  /**
   * Validate visible fields using your dynamic Zod schema builder.
   */
  const validateRequiredFields = useCallback(async (): Promise<boolean> => {
    if (!form) return false;

    const row = rowFromValuesMap(formFieldsValuesMap);

    console.log("====== validate start", {
      formId: form.id,
      visibleCount: visibleFormFields.length,
      rowKeys: Object.keys(row),
    });

    const { schema, visibleFields } = await buildDynamicRowSchema(
      form,
      row,
      async (id: number) => getFormById(id),
      [form.id],
    );

    console.log("====== schema built", {
      visibleFields: visibleFields.map((f) => ({
        id: String(f.uniqueId),
        name: f.displayName,
        typeId: f.typeId,
      })),
    });

    const byId = new Map<string, FormField>();
    visibleFields.forEach((f) => byId.set(String(f.uniqueId), f));

    const nextValid = new Map(formFieldsValidMap);
    visibleFields.forEach((f) => nextValid.set(String(f.uniqueId), initFieldValidity(f)));

    const result = await schema.safeParseAsync(row);

    if (result.success) {
      console.log("====== validate success ✅");
      setFormFieldsValidMap(nextValid);
      return true;
    }

    console.log("====== validate fail ❌", {
      issues: result.error.issues.map((i) => ({ path: i.path, message: i.message })),
    });

    const visibleIds = new Set(visibleFields.map((f) => String(f.uniqueId)));

    result.error.issues.forEach((issue) => {
      const top = issue.path?.[0];
      if (typeof top === "string" && visibleIds.has(top)) {
        setIssueValidity(nextValid, byId, issue.path as any);
      }
    });

    setFormFieldsValidMap(nextValid);

    setInteractedFields((prev) => {
      const next = new Set(prev);
      visibleFields.forEach((f) => next.add(String(f.uniqueId)));
      return next;
    });

    return false;
  }, [form, formFieldsValuesMap, formFieldsValidMap, visibleFormFields.length]);

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
    interactedFields,

    onChangeHandler,
    validateRequiredFields,

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
