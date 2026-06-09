import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FormDto,
  FormFieldDto,
  FormSectionDto,
  ResponseDto,
  ResponseFieldValueDto,
} from "../types/shared";
import {
  fieldType,
  FieldType,
  validateFormFieldValue,
  type FormFieldLike,
  type FieldValidationMessage,
  getFieldValidationMessage,
  FormCondition,
  FormConditionBooleanOperator,
  optionsSource,
  FormConditionPredicate,
  selectionMode,
  dateDefaultValue,
  timeDefaultValue,
  timePrecision,
} from "formula-gear";
import { getResponseById, useGetForm } from "../api";
import { useConnectedFormOptions } from "./useConnectedFormOptions";
import { checkUserAccessForResponse } from "../utils/utils";
import { NOT_A_SECTION_ID } from "../utils/sections/consts";
import { useNavigate } from "react-router-dom";
import { IPath } from "../types/enums/global.enums";
import { isDifferent } from "../utils/responses";
import { FieldTypeIds } from "../utils/interfaces";
import { StatusCodes } from "http-status-codes";
import { TextComparator } from "../pages/FormEditor/schemas/conditions/conditionField/comparators/TextComparator";
import { NumberComparator } from "../pages/FormEditor/schemas/conditions/conditionField/comparators/NumberComparator";
import { DateComparator } from "../pages/FormEditor/schemas/conditions/conditionField/comparators/DateComparator";
import { OptionsComparator } from "../pages/FormEditor/schemas/conditions/conditionField/comparators/OptionsComparator";
import { CheckboxComparator } from "../pages/FormEditor/schemas/conditions/conditionField/comparators/CheckboxComparator";
import { getOptionResponseRawValue } from "../utils/optionResponseValue";
import { saveResponseDraft, clearResponseDraft } from "../pages/FormEditor/utils/draftPersistence";

export type FieldExtra = {
  options?: {
    items?: any[];
  };
  selectionMode?: "multiple" | "single";
  value?: any;
  validationRegex?: string;
  linkedFormId?: number;
  connectedFieldId?: string;
  parentFieldId?: string;
  parentDependencies?: any[];
  locationFormat?: "utm" | "wkt";
  min?: number;
  max?: number;
  numberType?: "integer" | "decimal";
  initialNumberValue?: number;
  defaultValue?: any;
  conditions?: any[];
  sectionDescription?: string;
  timePrecision?: "seconds" | "minutes";
  dateType?: "datetime" | "date";
  linkedOptionsFieldId?: string;
  source?: number;
};

export interface FormFieldWithSectionDto extends FormFieldDto {
  sectionId: string;
  sectionName: string;
  sectionOrder: number;
  sectionDescription?: string;
  extra?: FieldExtra;
}

interface SectionsMap {
  [sectionId: string]: {
    name?: string;
    description?: string;
    fields: FormFieldWithSectionDto[];
    order: number;
    id?: string;
  };
}

export type FieldValidationError = {
  messages: FieldValidationMessage[];
  pathMessages: Record<string, FieldValidationMessage[]>;
};

const getFieldExtra = (field: FormFieldDto): FieldExtra => {
  return ((field.extra ?? {}) as FieldExtra) || {};
};

const getFieldType = (field: FormFieldDto): FieldType => {
  return field.fieldType as FieldType;
};

const getOptionIds = (extra: FieldExtra): string[] => {
  return extra.options?.items?.map((item) => item.id).filter(Boolean) ?? [];
};

const flattenFields = (form: FormDto): FormFieldWithSectionDto[] => {
  return (form.sections ?? [])
    .slice()
    .sort((a: FormSectionDto, b: FormSectionDto) => a.index - b.index)
    .flatMap((section: FormSectionDto) =>
      (section.fields ?? [])
        .slice()
        .sort((a: FormFieldDto, b: FormFieldDto) => a.index - b.index)
        .map(
          (field: FormFieldDto): FormFieldWithSectionDto => ({
            ...field,
            sectionId: section.id,
            sectionName: section.name,
            sectionOrder: section.index,
            sectionDescription: getFieldExtra(field).sectionDescription,
            extra: getFieldExtra(field),
          }),
        ),
    );
};

const getDefaultOptionsValue = (field: FormFieldWithSectionDto) => {
  const extra = getFieldExtra(field);
  const defaultValue = extra.defaultValue;

  if (defaultValue === undefined) {
    return extra.value;
  }

  const isMultiple = extra.selectionMode === selectionMode.Multiple;

  if (isMultiple) {
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  }

  return Array.isArray(defaultValue) ? (defaultValue[0] ?? "") : defaultValue;
};

const getDefaultFieldValue = (field: FormFieldWithSectionDto) => {
  const extra = getFieldExtra(field);
  const currentFieldType = getFieldType(field);

  if (currentFieldType === fieldType.Options) {
    return getDefaultOptionsValue(field);
  }

  if (currentFieldType === fieldType.Date) {
    if (
      extra.defaultValue === dateDefaultValue.CurrentDate ||
      extra.defaultValue === dateDefaultValue.CurrentDateTime
    ) {
      return new Date().toISOString();
    }
  }

  if (currentFieldType === fieldType.Time) {
    if (extra.defaultValue === timeDefaultValue.CurrentTime) {
      const now = new Date();
      return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}${extra.timePrecision === timePrecision.Seconds ? `:${String(now.getSeconds()).padStart(2, "0")}` : ""}`;
    }
  }

  if (currentFieldType === fieldType.Number && extra.defaultValue !== undefined) {
    return extra.defaultValue;
  }

  if (currentFieldType === fieldType.Boolean) {
    return extra.defaultValue !== undefined ? extra.defaultValue : false;
  }

  return extra.value;
};

const toValidatorField = (
  field: FormFieldDto,
  fieldOptions?: Record<string, any[]>,
  submittedValue?: any
): FormFieldLike => {
  if (field.fieldType === FieldTypeIds.options) {
    const extra = (field.extra ?? {}) as FieldExtra;
    const isMultiSelect = extra?.selectionMode === selectionMode.Multiple;

    let items: { id: string; text: string }[] = [];

    if (extra?.source === optionsSource.FormFieldResponses) {
      if (fieldOptions?.[field.id]) {
        items = fieldOptions[field.id].map((opt: any) => ({
          id: String(opt.value),
          text: String(opt.value),
        }));
      }

      if (submittedValue != null) {
        const vals = Array.isArray(submittedValue) ? submittedValue : [submittedValue];
        vals.forEach((val: any) => {
          const strVal = String(val);
          if (!items.find((i) => i.id === strVal)) {
            items.push({ id: strVal, text: strVal });
          }
        });
      }
    } else if (Array.isArray((field as any).options)) {
      items = (field as any).options.map((item: any) => ({
        id: String(item.id),
        text: String(item.text || item.id),
      }));
    } else if (extra?.options?.items) {
      items = extra.options.items.map((item: any) => ({
        id: String(item.id),
        text: String(item.text || item.id),
      }));
    } else if (Array.isArray(extra?.options)) {
      items = extra.options.map((opt: any) => ({
        id: String(opt),
        text: String(opt),
      }));
    }

    return {
      typeId: field.fieldType,
      required: field.isRequired,
      extra: {
        source: extra.source,
        selectionMode: extra.selectionMode ?? selectionMode.Single,
        options: {
          items,
        },
        parentFieldId: extra.parentFieldId,
        parentDependencies: extra.parentDependencies,
      },
    } as unknown as FormFieldLike;
  }

  return {
    typeId: field.fieldType,
    required: field.isRequired,
    extra: field.extra,
  } as unknown as FormFieldLike;
};

const toFieldValidationError = (
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): FieldValidationError => {
  const pathMessages: Record<string, FieldValidationMessage[]> = {};

  const messages = issues.map((issue) => getFieldValidationMessage(issue.message));

  issues.forEach((issue, index) => {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_root";

    if (!pathMessages[key]) {
      pathMessages[key] = [];
    }

    pathMessages[key].push(messages[index]);
  });

  return {
    messages,
    pathMessages,
  };
};
const evaluatePredicate = (
  predicate: FormConditionPredicate,
  dataObject: Record<string, unknown>,
): boolean => {
  const field = predicate.field;
  if (!field) return false;

  const rawFieldValue = dataObject[field.id];
  const targetValue = field.targetValue;
  const typeId = field.typeId;
  const comparator = field.comparator;

  const fieldValue: unknown[] | string = Array.isArray(rawFieldValue)
    ? rawFieldValue
    : rawFieldValue === undefined || rawFieldValue === null
      ? ""
      : String(rawFieldValue);

  const isArrayField = Array.isArray(fieldValue);
  const isEmptyValue = fieldValue === "" || (isArrayField && fieldValue.length === 0);

  if (typeId === FieldTypeIds.number) {
    const numericFieldValue = Number(rawFieldValue);
    const numericTargetValue = Number(targetValue);

    switch (comparator) {
      case NumberComparator.EMPTY: return isEmptyValue;
      case NumberComparator.NOT_EMPTY: return !isEmptyValue;
      case NumberComparator.EQUAL: return !isEmptyValue && numericFieldValue === numericTargetValue;
      case NumberComparator.NOT_EQUAL: return !isEmptyValue && numericFieldValue !== numericTargetValue;
      case NumberComparator.LARGER: return !isEmptyValue && numericFieldValue > numericTargetValue;
      case NumberComparator.SMALLER: return !isEmptyValue && numericFieldValue < numericTargetValue;
      case NumberComparator.LARGER_OR_EQUAL: return !isEmptyValue && numericFieldValue >= numericTargetValue;
      case NumberComparator.SMALLER_OR_EQUAL: return !isEmptyValue && numericFieldValue <= numericTargetValue;
      default: return false;
    }
  }

  if (typeId === FieldTypeIds.date) {
    const dateFieldValue = new Date(String(rawFieldValue)).getTime();
    const dateTargetValue = new Date(String(targetValue)).getTime();

    switch (comparator) {
      case DateComparator.EQUAL: return dateFieldValue === dateTargetValue;
      case DateComparator.NOT_EQUAL: return dateFieldValue !== dateTargetValue;
      case DateComparator.BEFORE: return dateFieldValue < dateTargetValue;
      case DateComparator.AFTER: return dateFieldValue > dateTargetValue;
      case DateComparator.BEFORE_OR_EQUAL: return dateFieldValue <= dateTargetValue;
      case DateComparator.AFTER_OR_EQUAL: return dateFieldValue >= dateTargetValue;
      case DateComparator.EMPTY: return isEmptyValue;
      case DateComparator.NOT_EMPTY: return !isEmptyValue;
      default: return false;
    }
  }

  if (typeId === FieldTypeIds.options) {
    const hasIntersection = (sourceArray: unknown[], targetArray: unknown[]) =>
      sourceArray.some((sourceItem) => targetArray.includes(sourceItem));

    const isArrayTarget = Array.isArray(targetValue);
    const fieldValuesArray = isArrayField ? fieldValue : [fieldValue].filter(Boolean);
    const targetValuesArray = isArrayTarget
      ? (targetValue as unknown[])
      : [targetValue].filter(Boolean);

    switch (comparator) {
      case OptionsComparator.ONLY:
        if (fieldValuesArray.length !== targetValuesArray.length) return false;
        return fieldValuesArray.every((fieldValueItem) => targetValuesArray.includes(fieldValueItem));
      case OptionsComparator.OTHER_THAN: return !hasIntersection(fieldValuesArray, targetValuesArray);
      case OptionsComparator.INCLUDES: return hasIntersection(fieldValuesArray, targetValuesArray);
      case OptionsComparator.NOT_INCLUDES: return !hasIntersection(fieldValuesArray, targetValuesArray);
      case OptionsComparator.NONE: return isEmptyValue;
      case OptionsComparator.ANY: return !isEmptyValue;
      default: return false;
    }
  }

  if (typeId === FieldTypeIds.checkbox) {
    const isChecked = rawFieldValue === true || rawFieldValue === "true";
    const isTargetChecked = targetValue === true || targetValue === "true";

    switch (comparator) {
      case CheckboxComparator.EQUAL: return isChecked === isTargetChecked;
      default: return false;
    }
  }

  const stringFieldValue = String(fieldValue);
  const stringTargetValue = String(targetValue);

  switch (comparator) {
    case TextComparator.EQUAL: return stringFieldValue === stringTargetValue;
    case TextComparator.NOT_EQUAL: return stringFieldValue !== stringTargetValue;
    case TextComparator.CONTAINS: return stringFieldValue.includes(stringTargetValue);
    case TextComparator.NOT_CONTAINS: return !stringFieldValue.includes(stringTargetValue);
    case TextComparator.EMPTY: return isEmptyValue;
    case TextComparator.NOT_EMPTY: return !isEmptyValue;
    default: return false;
  }
};

const evaluateFormCondition = (
  condition: FormCondition,
  dataObject: Record<string, unknown>,
): boolean => {
  if (!condition.groups || condition.groups.length === 0) return true;

  const nonEmptyGroups = condition.groups.filter(
    (group) => group.predicates && group.predicates.length > 0,
  );

  if (nonEmptyGroups.length === 0) return true;

  let finalResult: boolean | null = null;

  for (const [groupIndex, group] of nonEmptyGroups.entries()) {
    let currentGroupResult: boolean | null = null;

    for (const [predicateIndex, predicate] of group.predicates.entries()) {
      const currentPredicateResult = evaluatePredicate(predicate, dataObject);

      if (currentGroupResult === null) {
        currentGroupResult = currentPredicateResult;
      } else {
        const isOrOperator = predicate.operator === FormConditionBooleanOperator.OR;
        currentGroupResult = isOrOperator
          ? currentGroupResult || currentPredicateResult
          : currentGroupResult && currentPredicateResult;
      }
    }

    const resolvedGroupResult = currentGroupResult ?? true;

    if (finalResult === null) {
      finalResult = resolvedGroupResult;
    } else {
      const isOrOperator = group.operator === FormConditionBooleanOperator.OR;
      finalResult = isOrOperator
        ? finalResult || resolvedGroupResult
        : finalResult && resolvedGroupResult;
    }
  }

  return finalResult ?? true;
};

type UseResponseStateInitialResponse = ResponseDto | null | undefined;

export const useResponseState = (
  formId: string | undefined,
  responseId: string | undefined,
  viewMode: boolean,
  copyMode: boolean,
  roles?: Parameters<typeof checkUserAccessForResponse>[0],
  user?: any,
  isSuperAdmin?: boolean,
  setHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void,
  hasUnsavedChanges?: boolean,
  initialResponse?: UseResponseStateInitialResponse,
) => {
  const [form, setForm] = useState<FormDto | null>(null);
  const formTitle = form?.name || "";
  const [formFields, setFormFields] = useState<FormFieldWithSectionDto[]>([]);
  const [formFieldsByIdMap, setFormFieldsByIdsMap] = useState<Map<string, FormFieldWithSectionDto>>(
    new Map(),
  );
  const [formFieldsValuesMap, setFormFieldsValuesMap] = useState<Map<string, any>>(new Map());
  const [formFieldsValidMap, setFormFieldsValidMap] = useState<
    Map<string, FieldValidationError | null>
  >(new Map());
  const [formFieldsTouchedMap, setFormFieldsTouchedMap] = useState<Map<string, boolean>>(new Map());
  const [response, setResponse] = useState<ResponseDto | null>(initialResponse ?? null);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const initializedStateKeyRef = useRef<string | null>(null);
  const formFieldsValuesMapRef = useRef<Map<string, any>>(new Map());

  const [lastModeKey, setLastModeKey] = useState<string>(`${responseId}:${viewMode}`);
  const currentModeKey = `${responseId}:${viewMode}`;

  if (currentModeKey !== lastModeKey) {
    setLastModeKey(currentModeKey);
    setLoading(true);
    initializedStateKeyRef.current = null;
  }

  const navigate = useNavigate();

  const { fieldOptions, isLoading: loadingConnections } = useConnectedFormOptions({
    formFields,
  });

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  useEffect(() => {
    formFieldsValuesMapRef.current = formFieldsValuesMap;
  }, [formFieldsValuesMap]);

  const { data: formFromQuery, isError: isFormError, error: formError } = useGetForm({
    formId,
    includePermissions: true,
  });

  useEffect(() => {
    if (isFormError && formError) {
      const status = (formError as any).response?.status;
      if (status === StatusCodes.NOT_FOUND || status === StatusCodes.FORBIDDEN) {
        navigate(IPath.ERROR, { replace: true });
      }
    }
  }, [isFormError, formError, navigate]);

  useEffect(() => {
    if (initialResponse !== undefined) {
      setResponse(initialResponse ?? null);
    }
  }, [initialResponse]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        if (formFromQuery && isMounted) {
          setForm(formFromQuery);
        }

        if (initialResponse !== undefined) {
          if (isMounted) {
            if (initialResponse && copyMode) {
              setResponse({
                ...initialResponse,
                id: null as unknown as ResponseDto["id"],
              });
            } else {
              setResponse(initialResponse ?? null);
            }
          }
        } else if (responseId && formId) {
          try {
            const found = await getResponseById(Number(formId), responseId);

            if (isMounted && found) {
              if (copyMode) {
                setResponse({
                  ...found,
                  id: null as unknown as ResponseDto["id"],
                });
              } else {
                setResponse(found);
              }
            }
          } catch (error: any) {
            const status = error.response?.status;
            if (status === StatusCodes.NOT_FOUND || status === StatusCodes.FORBIDDEN) {
              navigate(IPath.ERROR, { replace: true });
            }
          }
        } else if (isMounted) {
          setResponse(null);
        }
      } finally {
        // keep loading true until initialization below completes
      }
    };

    void loadData();

    return () => {
      isMounted = false;
    };
  }, [formFromQuery, responseId, copyMode, formId, initialResponse, navigate, viewMode]);

  useEffect(() => {
    if (!form) return;

    if (roles && roles.length > 0) {
      const hasPermissions = checkUserAccessForResponse(
        roles,
        viewMode,
        response as any,
        form as any,
        user,
        isSuperAdmin,
      );

      if (!hasPermissions) {
        navigate(IPath.ERROR, { replace: true });
        return;
      }
    }

    const effectiveResponseId = response?.id ?? responseId;
    const stateKey = `${form.id}:${effectiveResponseId ?? "new"}:${copyMode ? "copy" : "regular"}:${viewMode ? "view" : "edit"}`;

    if (!effectiveResponseId && initializedStateKeyRef.current === stateKey) {
      setLoading(false);
      return;
    }

    if ((responseId || initialResponse) && !response) {
      return;
    }

    const nextFormFields = flattenFields(form);
    const nextFieldsByIdMap = new Map<string, FormFieldWithSectionDto>();
    const nextValuesMap = new Map<string, any>();
    const nextValidMap = new Map<string, FieldValidationError | null>();
    const nextTouchedMap = new Map<string, boolean>();

    nextFormFields.forEach((field) => {
      const currentFieldId = String(field.id);
      const defaultFieldValue = getDefaultFieldValue(field);

      nextFieldsByIdMap.set(currentFieldId, field);
      nextValuesMap.set(currentFieldId, defaultFieldValue);
      nextValidMap.set(currentFieldId, null);
      nextTouchedMap.set(currentFieldId, false);
    });

    if (effectiveResponseId) {
      const fieldValuesArray = (response?.fieldValues ?? []) as ResponseFieldValueDto[];
      const fieldDefsMap = new Map<string, FormFieldWithSectionDto>();

      nextFormFields.forEach((field) => {
        fieldDefsMap.set(String(field.id), field);
      });

      fieldValuesArray.forEach((responseFieldValue) => {
        const currentFieldId = String(responseFieldValue.fieldId);
        const fieldDef = fieldDefsMap.get(currentFieldId);
        let value: any = responseFieldValue?.value;

        if (fieldDef) {
          const extra = getFieldExtra(fieldDef);
          const currentFieldType = getFieldType(fieldDef);

          switch (currentFieldType) {
            case fieldType.Boolean:
              if (typeof value === "string") {
                value = value === "true";
              } else if (value === null || value === undefined) {
                value = false;
              }
              break;

            case fieldType.Options:
              value = getOptionResponseRawValue(value);

              if (extra.selectionMode === selectionMode.Multiple && value && !Array.isArray(value)) {
                value = [value];
              } else if (extra.selectionMode !== selectionMode.Multiple && Array.isArray(value)) {
                value = value[0] ?? "";
              }
              break;

            case fieldType.List:
              if (value && !Array.isArray(value)) {
                value = [value];
              }
              break;

            default:
              break;
          }
        }

        nextValuesMap.set(currentFieldId, value);
      });
    }

    initializedStateKeyRef.current = stateKey;
    formFieldsValuesMapRef.current = nextValuesMap;

    setFormFields(nextFormFields);
    setFormFieldsByIdsMap(nextFieldsByIdMap);
    setFormFieldsValuesMap(nextValuesMap);
    setFormFieldsValidMap(nextValidMap);
    setFormFieldsTouchedMap(nextTouchedMap);
    setLoading(false);
  }, [
    form,
    response,
    responseId,
    initialResponse,
    viewMode,
    copyMode,
    roles,
    user,
    isSuperAdmin,
    navigate,
  ]);

  const evaluateFieldVisibility = (
    field: FormFieldWithSectionDto,
    fields: FormFieldWithSectionDto[],
    valuesMap: Map<string, any>,
  ): boolean => {
    const formConditions: FormCondition[] = (form?.conditions as FormCondition[]) ?? [];

    const affectingFieldConditions = formConditions.filter((condition: FormCondition) =>
      condition.dependantComponents?.field?.includes(String(field.id)),
    );

    const affectingSectionConditions = field.sectionId
      ? formConditions.filter((condition: FormCondition) =>
        condition.dependantComponents?.section?.includes(String(field.sectionId)),
      )
      : [];

    if (affectingFieldConditions.length === 0 && affectingSectionConditions.length === 0) {
      return true;
    }

    const dataObject: Record<string, unknown> = {};
    valuesMap.forEach((value, currentFieldId) => {
      dataObject[currentFieldId] = value;
    });

    if (affectingSectionConditions.length > 0) {
      const isSectionVisible = affectingSectionConditions.some((condition: FormCondition) => {
        try {
          return evaluateFormCondition(condition, dataObject);
        } catch (error) {
          console.error("Error evaluating form condition:", condition.name, error);
          return false;
        }
      });

      if (!isSectionVisible) {
        return false;
      }
    }

    if (affectingFieldConditions.length > 0) {
      const isFieldVisible = affectingFieldConditions.some((condition: FormCondition) => {
        try {
          return evaluateFormCondition(condition, dataObject);
        } catch (error) {
          console.error("Error evaluating form condition:", condition.name, error);
          return false;
        }
      });

      if (!isFieldVisible) {
        return false;
      }
    }

    return true;
  };

  const visibleFormFields = useMemo(() => {
    return formFields.filter((field) =>
      evaluateFieldVisibility(field, formFields, formFieldsValuesMap),
    );
  }, [formFields, formFieldsValuesMap, form]);

  const hiddenFieldIds = useMemo(() => {
    const visibleIds = new Set(visibleFormFields.map((field) => String(field.id)));
    return formFields
      .filter((field) => !visibleIds.has(String(field.id)))
      .map((field) => String(field.id));
  }, [formFields, visibleFormFields]);

  // Auto-save response draft logic
  useEffect(() => {
    if (viewMode) return;

    if (hasUnsavedChanges && formFieldsValuesMap.size > 0) {
      saveResponseDraft(formId, responseId, formFieldsValuesMap);
    }
  }, [formFieldsValuesMap, hasUnsavedChanges, viewMode, formId, responseId]);


  useEffect(() => {
    if (formFields.length === 0) return;

    const visibleIds = new Set(visibleFormFields.map((field) => String(field.id)));

    setFormFieldsValuesMap((prev) => {
      let changed = false;
      const next = new Map(prev);

      formFields.forEach((field) => {
        const currentFieldId = String(field.id);

        if (visibleIds.has(currentFieldId)) return;

        const currentValue = next.get(currentFieldId);
        const currentFieldType = getFieldType(field);
        const emptyValue =
          currentFieldType === fieldType.Boolean
            ? false
            : currentFieldType === fieldType.File
              ? { files: [] }
              : "";

        if (currentValue !== undefined && isDifferent(currentValue, emptyValue)) {
          next.set(currentFieldId, emptyValue);
          changed = true;
        }
      });

      if (changed) {
        formFieldsValuesMapRef.current = next;
      }

      return changed ? next : prev;
    });

    setFormFieldsValidMap((prev) => {
      let changed = false;
      const next = new Map(prev);

      formFields.forEach((field) => {
        const currentFieldId = String(field.id);

        if (visibleIds.has(currentFieldId)) return;

        if (next.get(currentFieldId) !== null) {
          next.set(currentFieldId, null);
          changed = true;
        }
      });

      return changed ? next : prev;
    });

    setFormFieldsTouchedMap((prev) => {
      let changed = false;
      const next = new Map(prev);

      formFields.forEach((field) => {
        const currentFieldId = String(field.id);

        if (visibleIds.has(currentFieldId)) return;

        if (next.get(currentFieldId)) {
          next.set(currentFieldId, false);
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [formFields, visibleFormFields]);

  const validateSingleField = (
    fieldId: string,
    valuesMapOverride?: Map<string, any>,
    markTouched = true,
  ) => {
    const normalizedFieldId = String(fieldId);
    const field = formFieldsByIdMap.get(normalizedFieldId);

    if (!field) return true;

    const visibleFieldIds = new Set(
      visibleFormFields.map((visibleField) => String(visibleField.id)),
    );

    if (!visibleFieldIds.has(normalizedFieldId)) {
      setFormFieldsValidMap((prev) => {
        const next = new Map(prev);
        next.set(normalizedFieldId, null);
        return next;
      });

      if (markTouched) {
        setFormFieldsTouchedMap((prev) => {
          const next = new Map(prev);
          next.set(normalizedFieldId, true);
          return next;
        });
      }

      return true;
    }

    const valuesMap = valuesMapOverride ?? formFieldsValuesMapRef.current;
    const rawValue = valuesMap.get(normalizedFieldId);
    const result = validateFormFieldValue(toValidatorField(field, fieldOptions, rawValue), rawValue);

    if (markTouched) {
      setFormFieldsTouchedMap((prev) => {
        const next = new Map(prev);
        next.set(normalizedFieldId, true);
        return next;
      });
    }

    if (result.success) {
      setFormFieldsValidMap((prev) => {
        const next = new Map(prev);
        next.set(normalizedFieldId, null);
        return next;
      });

      return true;
    }

    setFormFieldsValidMap((prev) => {
      const next = new Map(prev);
      next.set(normalizedFieldId, toFieldValidationError(result.error.issues));
      return next;
    });

    return false;
  };

  const onBlurHandler = (fieldId: string) => {
    validateSingleField(fieldId);
  };

  const onChangeHandler = (value: any, fieldId: string, _inputValueValid?: any) => {
    const normalizedFieldId = String(fieldId);

    setFormFieldsValuesMap((prevFormFieldsValuesMap) => {
      const newFormFieldsValuesMap = new Map(prevFormFieldsValuesMap);
      const prevValue = prevFormFieldsValuesMap.get(normalizedFieldId);

      if (isDifferent(prevValue, value)) {
        setHasUnsavedChanges?.(true);
      }

      newFormFieldsValuesMap.set(normalizedFieldId, value);

      if (formFields.length > 0) {
        const childFields = formFields.filter(
          (field) => String(getFieldExtra(field).parentFieldId) === normalizedFieldId,
        );

        if (childFields.length > 0) {
          childFields.forEach((childField) => {
            const childExtra = getFieldExtra(childField);

            if (getFieldType(childField) !== fieldType.Options || !childExtra.parentDependencies) {
              return;
            }

            const childFieldId = String(childField.id);
            const currentChildValue = newFormFieldsValuesMap.get(childFieldId);

            const parentField = formFields.find(
              (field) => String(field.id) === String(childExtra.parentFieldId),
            );

            if (!parentField) return;

            const parentExtra = getFieldExtra(parentField);
            const parentOptions = getOptionIds(parentExtra);
            const childOptions = getOptionIds(childExtra);

            if (parentOptions.length === 0 || childOptions.length === 0) return;

            const parentValues = Array.isArray(value) ? value : [value];
            const allowedOptions = new Set<string>();

            parentValues.forEach((parentValue) => {
              const parentOptionIndex = parentOptions.indexOf(String(parentValue));

              if (parentOptionIndex === -1) return;

              const dependency = childExtra.parentDependencies?.find(
                (dep: any) => dep.parentOptionIndex === parentOptionIndex,
              );

              dependency?.childOptionIndices.forEach((childOptionIndex: number) => {
                const childOptionId = childOptions[childOptionIndex];

                if (childOptionId) {
                  allowedOptions.add(childOptionId);
                }
              });
            });

            if (allowedOptions.size > 0) {
              if (currentChildValue) {
                const childValues = Array.isArray(currentChildValue)
                  ? currentChildValue
                  : [currentChildValue];

                const validValues = childValues.filter((val) => allowedOptions.has(val));

                if (validValues.length !== childValues.length) {
                  const newValue = childExtra.selectionMode === selectionMode.Multiple
                    ? validValues
                    : validValues.length > 0
                      ? validValues[0]
                      : "";

                  newFormFieldsValuesMap.set(childFieldId, newValue);

                  setFormFieldsValidMap((prev) => {
                    const next = new Map(prev);
                    next.set(childFieldId, null);
                    return next;
                  });

                  setFormFieldsTouchedMap((prev) => {
                    const next = new Map(prev);
                    next.set(childFieldId, false);
                    return next;
                  });
                }
              }
            } else if (parentValues.length > 0) {
              const emptyValue = childExtra.selectionMode === selectionMode.Multiple ? [] : "";
              newFormFieldsValuesMap.set(childFieldId, emptyValue);

              setFormFieldsValidMap((prev) => {
                const next = new Map(prev);
                next.set(childFieldId, null);
                return next;
              });

              setFormFieldsTouchedMap((prev) => {
                const next = new Map(prev);
                next.set(childFieldId, false);
                return next;
              });
            }
          });
        }
      }

      formFieldsValuesMapRef.current = newFormFieldsValuesMap;
      return newFormFieldsValuesMap;
    });

    setFormFieldsValidMap((prev) => {
      if (!formFieldsTouchedMap.get(normalizedFieldId)) {
        return prev;
      }

      const next = new Map(prev);
      next.set(normalizedFieldId, null);
      return next;
    });
  };

  const validateAllFieldsBeforeSubmit = () => {
    let isValidForm = true;
    const nextValidMap = new Map<string, FieldValidationError | null>();
    const nextParsedValuesMap = new Map(formFieldsValuesMapRef.current);
    const nextTouchedMap = new Map(formFieldsTouchedMap);
    const visibleFieldIds = new Set(visibleFormFields.map((field) => String(field.id)));

    formFields.forEach((field) => {
      const currentFieldId = String(field.id);

      if (!visibleFieldIds.has(currentFieldId)) {
        nextValidMap.set(currentFieldId, null);
        nextTouchedMap.set(currentFieldId, false);
        return;
      }

      nextTouchedMap.set(currentFieldId, true);

      const rawValue = nextParsedValuesMap.get(currentFieldId);
      const result = validateFormFieldValue(toValidatorField(field, fieldOptions, rawValue), rawValue);

      if (result.success) {
        nextParsedValuesMap.set(currentFieldId, result.data);
        nextValidMap.set(currentFieldId, null);
        return;
      }

      isValidForm = false;
      nextValidMap.set(currentFieldId, toFieldValidationError(result.error.issues));
    });

    setFormFieldsTouchedMap(nextTouchedMap);
    setFormFieldsValidMap(nextValidMap);

    return {
      isValid: isValidForm,
      parsedValuesMap: nextParsedValuesMap,
      rawValuesMap: new Map(formFieldsValuesMapRef.current),
      validationMap: nextValidMap,
    };
  };

  const responsSections: SectionsMap = useMemo(() => {
    return visibleFormFields.reduce((acc: SectionsMap, field: FormFieldWithSectionDto) => {
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
    setFormFieldsTouchedMap,
    onChangeHandler,
    onBlurHandler,
    validateAllFieldsBeforeSubmit,
    loading,
    form,
    response,
    fieldOptions,
    loadingConnections,
    responsSections,
    collapsedSections,
    toggleSectionCollapse,
    hiddenFieldIds,
    setFormFieldsValuesMap
  };
};
