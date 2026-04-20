import { useEffect, useMemo, useRef, useState } from "react";
import type {
  FormDto,
  FormFieldDto,
  FormSectionDto,
  ResponseDto,
  ResponseFieldValueDto,
} from "../types/shared";
import { fieldType, FieldType, validateFormFieldValue, type FormFieldLike } from "formula-gear";
import { getFormById, getResponseById } from "../api";
import { useConnectedFormOptions } from "./useConnectedFormOptions";
import { checkUserAccessForResponse } from "../utils/utils";
import { NOT_A_SECTION_ID } from "../utils/sections/consts";
import { useNavigate } from "react-router-dom";
import { IPath } from "../types/enums/global.enums";
import { isDifferent } from "../utils/responses";
import { ConditionUtils } from "../utils/interfaces";

type FieldExtra = {
  options?: any[];
  multiSelect?: boolean;
  value?: any;
  validationRegex?: string;
  linkedFormId?: number;
  parentFieldId?: string;
  parentDependencies?: any[];
  locationFormat?: string;
  min?: number;
  max?: number;
  numberFormat?: string;
  initialNumberValue?: number;
  defaultValue?: boolean;
  conditions?: any[];
  sectionDescription?: string;
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
  messages: string[];
  pathMessages: Record<string, string[]>;
};

const getFieldExtra = (field: FormFieldDto): FieldExtra => {
  return ((field.extra ?? {}) as FieldExtra) || {};
};

const getFieldType = (field: FormFieldDto): FieldType => {
  return field.fieldType as FieldType;
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

const getDefaultFieldValue = (field: FormFieldWithSectionDto) => {
  const extra = getFieldExtra(field);
  const currentFieldType = getFieldType(field);

  if (currentFieldType === fieldType.Number && extra.defaultValue !== undefined) {
    return extra.defaultValue;
  }

  if (currentFieldType === fieldType.Boolean) {
    return extra.defaultValue !== undefined ? extra.defaultValue : false;
  }

  return extra.value;
};

const toValidatorField = (field: FormFieldDto): FormFieldLike => ({
  typeId: field.fieldType,
  required: field.isRequired,
  extra: field.extra,
});

const toFieldValidationError = (
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
) => {
  const pathMessages: Record<string, string[]> = {};

  issues.forEach((issue) => {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_root";

    if (!pathMessages[key]) {
      pathMessages[key] = [];
    }

    pathMessages[key].push(issue.message);
  });

  return {
    messages: issues.map((issue) => issue.message),
    pathMessages,
  };
};

export const useResponseState = (
  formId: string | undefined,
  responseId: string | undefined,
  viewMode: boolean,
  copyMode: boolean,
  roles?: Parameters<typeof checkUserAccessForResponse>[0],
  user?: any,
  isSuperAdmin?: boolean,
  setHasUnsavedChanges?: (hasUnsavedChanges: boolean) => void,
) => {
  const [formTitle, setFormTitle] = useState("");
  const [formFields, setFormFields] = useState<FormFieldWithSectionDto[]>([]);
  const [formFieldsByIdMap, setFormFieldsByIdsMap] = useState<Map<string, FormFieldWithSectionDto>>(
    new Map(),
  );
  const [formFieldsValuesMap, setFormFieldsValuesMap] = useState<Map<string, any>>(new Map());
  const [formFieldsValidMap, setFormFieldsValidMap] = useState<
    Map<string, FieldValidationError | null>
  >(new Map());
  const [formFieldsTouchedMap, setFormFieldsTouchedMap] = useState<Map<string, boolean>>(new Map());
  const [form, setForm] = useState<FormDto | null>(null);
  const [response, setResponse] = useState<ResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const initializedStateKeyRef = useRef<string | null>(null);
  const formFieldsValuesMapRef = useRef<Map<string, any>>(new Map());

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

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);

      try {
        if (formId) {
          const fetchedForm = await getFormById(Number(formId));
          if (isMounted && fetchedForm) {
            setForm(fetchedForm as FormDto);
          }
        }

        if (responseId && formId) {
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
  }, [formId, responseId, copyMode]);

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

    const stateKey = `${form.id}:${responseId ?? "new"}:${copyMode ? "copy" : "regular"}:${viewMode ? "view" : "edit"}`;

    if (!responseId && initializedStateKeyRef.current === stateKey) {
      setLoading(false);
      return;
    }

    if (responseId && !response) {
      return;
    }

    const nextFormFields = flattenFields(form);
    const nextFieldsByIdMap = new Map<string, FormFieldWithSectionDto>();
    const nextValuesMap = new Map<string, any>();
    const nextValidMap = new Map<string, FieldValidationError | null>();
    const nextTouchedMap = new Map<string, boolean>();

    nextFormFields.forEach((field) => {
      const currentFieldId = String(field.id);

      nextFieldsByIdMap.set(currentFieldId, field);
      nextValuesMap.set(currentFieldId, getDefaultFieldValue(field));
      nextValidMap.set(currentFieldId, null);
      nextTouchedMap.set(currentFieldId, false);
    });

    if (responseId) {
      setFormTitle((copyMode ? "יצירת תגובה - " : "עריכת תגובה - ") + form.name);

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
              if (extra.multiSelect && value && !Array.isArray(value)) {
                value = [value];
              } else if (!extra.multiSelect && Array.isArray(value)) {
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
    } else {
      setFormTitle("יצירת תגובה - " + form.name);
    }

    if (viewMode) {
      setFormTitle("צפייה בתגובה - " + form.name);
    }

    initializedStateKeyRef.current = stateKey;
    formFieldsValuesMapRef.current = nextValuesMap;

    setFormFields(nextFormFields);
    setFormFieldsByIdsMap(nextFieldsByIdMap);
    setFormFieldsValuesMap(nextValuesMap);
    setFormFieldsValidMap(nextValidMap);
    setFormFieldsTouchedMap(nextTouchedMap);
    setLoading(false);
  }, [form, response, responseId, viewMode, copyMode, roles, user, isSuperAdmin, navigate]);

  const evaluateFieldVisibility = (
    field: FormFieldWithSectionDto,
    fields: FormFieldWithSectionDto[],
    valuesMap: Map<string, any>,
  ): boolean => {
    const extra = getFieldExtra(field);

    if (!extra.conditions || extra.conditions.length === 0) {
      return true;
    }

    const dataObject: Record<string, any> = {};
    valuesMap.forEach((value, currentFieldId) => {
      dataObject[currentFieldId] = value;
    });

    const conditionsRoot = {
      groups: extra.conditions,
      affectedTargets: [],
    };

    try {
      return ConditionUtils.evaluateConditionsRoot(conditionsRoot, dataObject, fields as any);
    } catch (error) {
      console.error("Error evaluating conditions for field:", field.displayName, error);
      return true;
    }
  };

  const visibleFormFields = useMemo(() => {
    return formFields.filter((field) =>
      evaluateFieldVisibility(field, formFields, formFieldsValuesMap),
    );
  }, [formFields, formFieldsValuesMap]);

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
    const result = validateFormFieldValue(toValidatorField(field), rawValue);

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

      if (!valuesMapOverride) {
        setFormFieldsValuesMap((prev) => {
          const next = new Map(prev);
          next.set(normalizedFieldId, result.data);
          formFieldsValuesMapRef.current = next;
          return next;
        });
      }

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
            if (!parentExtra.options) return;

            const parentValues = Array.isArray(value) ? value : [value];
            const allowedOptions = new Set<any>();

            parentValues.forEach((parentValue) => {
              const parentOptionIndex = parentExtra.options?.indexOf(parentValue);

              if (parentOptionIndex !== -1) {
                const dependency = childExtra.parentDependencies?.find(
                  (dep: any) => dep.parentOptionIndex === parentOptionIndex,
                );

                if (dependency) {
                  dependency.childOptionIndices.forEach((childOptionIndex: number) => {
                    if (childExtra.options && childOptionIndex < childExtra.options.length) {
                      allowedOptions.add(childExtra.options[childOptionIndex]);
                    }
                  });
                }
              }
            });

            if (allowedOptions.size > 0) {
              if (currentChildValue) {
                const childValues = Array.isArray(currentChildValue)
                  ? currentChildValue
                  : [currentChildValue];

                const validValues = childValues.filter((val) => allowedOptions.has(val));

                if (validValues.length !== childValues.length) {
                  const newValue = childExtra.multiSelect
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
              const emptyValue = childExtra.multiSelect ? [] : "";
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
      const result = validateFormFieldValue(toValidatorField(field), rawValue);

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

    if (isValidForm) {
      formFieldsValuesMapRef.current = nextParsedValuesMap;
      setFormFieldsValuesMap(nextParsedValuesMap);
    }

    return {
      isValid: isValidForm,
      parsedValuesMap: nextParsedValuesMap,
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
    formFieldsTouchedMap,
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
  };
};
