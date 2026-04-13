import { useEffect, useMemo, useState } from "react";
import type {
  FormDto,
  FormFieldDto,
  FormSectionDto,
  ResponseDto,
  ResponseFieldValueDto,
} from "../types/shared";
import { fieldType, FieldType } from "formula-gear";
import { getFormById, searchResponses } from "../api";
import { useConnectedFormOptions } from "./useConnectedFormOptions";
import {
  checkUserAccessForResponse,
  timeRegex,
  utmRegex,
  validateByRegex,
  wktLatitudeRegexY,
  wktLongitudeRegexX,
} from "../utils/utils";
import { NOT_A_SECTION_ID } from "../utils/sections/consts";
import { useNavigate } from "react-router-dom";
import { IPath } from "../types/enums/global.enums";
import { isDifferent } from "../utils/responses";
import { isEmptyValue } from "../utils/strings";
import { ConditionUtils } from "../utils/interfaces";

type FieldExtra = {
  options?: any[];
  multiSelect?: boolean;
  value?: any;
  validationRegex?: string;
  connectedFormId?: number;
  parentFieldId?: string;
  parentDependencies?: any[];
  coordinateType?: string;
  minValue?: number;
  maxValue?: number;
  numberType?: string;
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

  if (currentFieldType === fieldType.Number && extra.initialNumberValue !== undefined) {
    return extra.initialNumberValue;
  }

  if (currentFieldType === fieldType.Boolean && extra.defaultValue !== undefined) {
    return extra.defaultValue;
  }

  return extra.value;
};

const getInitialFieldValidity = (field: FormFieldWithSectionDto) => {
  const currentFieldType = getFieldType(field);

  if (currentFieldType === fieldType.Link) {
    return { link: true, linkTxt: true };
  }

  if (currentFieldType === fieldType.Location) {
    return { x: true, y: true };
  }

  return true;
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
  const [formFieldsValidMap, setFormFieldsValidMap] = useState<Map<string, any>>(new Map());
  const [interactedFields, setInteractedFields] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<FormDto | null>(null);
  const [response, setResponse] = useState<ResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

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

        if (responseId) {
          const res: any = await searchResponses({
            form_id: Number(formId),
            searchFilters: [{ searchText: responseId, searchField: "id" }],
          });

          const found = (res?.responses?.[0] ?? null) as ResponseDto | null;

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
        }
      } finally {
        // keep loading true until initialization below completes
      }
    };

    loadData();

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

    const nextFormFields = flattenFields(form);
    const nextFieldsByIdMap = new Map<string, FormFieldWithSectionDto>();
    const nextValuesMap = new Map<string, any>();
    const nextValidMap = new Map<string, any>();

    nextFormFields.forEach((field) => {
      const currentFieldId = String(field.id);

      nextFieldsByIdMap.set(currentFieldId, field);
      nextValuesMap.set(currentFieldId, getDefaultFieldValue(field));
      nextValidMap.set(currentFieldId, getInitialFieldValidity(field));
    });

    if (responseId) {
      if (!response) return;

      setFormTitle((copyMode ? "יצירת תגובה - " : "עריכת תגובה - ") + form.name);

      const fieldValuesArray = (response.fieldValues ?? []) as ResponseFieldValueDto[];
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

    setFormFields(nextFormFields);
    setFormFieldsByIdsMap(nextFieldsByIdMap);
    setFormFieldsValuesMap(nextValuesMap);
    setFormFieldsValidMap(nextValidMap);
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
        const emptyValue = getFieldType(field) === fieldType.Boolean ? false : "";

        if (currentValue !== undefined && isDifferent(currentValue, emptyValue)) {
          next.set(currentFieldId, emptyValue);
          changed = true;
        }
      });

      return changed ? next : prev;
    });

    setFormFieldsValidMap((prev) => {
      let changed = false;
      const next = new Map(prev);

      formFields.forEach((field) => {
        const currentFieldId = String(field.id);

        if (visibleIds.has(currentFieldId)) return;

        const currentValid = next.get(currentFieldId);
        const currentFieldType = getFieldType(field);

        const resetValid =
          currentFieldType === fieldType.Link
            ? { link: true, linkTxt: true }
            : currentFieldType === fieldType.Location
              ? { x: true, y: true }
              : true;

        if (JSON.stringify(currentValid) !== JSON.stringify(resetValid)) {
          next.set(currentFieldId, resetValid);
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [formFields, visibleFormFields]);

  const onChangeHandler = (value: any, fieldId: string, inputValueValid: any) => {
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

                  setInteractedFields((prev) => {
                    const next = new Set(prev);
                    next.add(childFieldId);
                    return next;
                  });

                  setFormFieldsValidMap((prev) => {
                    const next = new Map(prev);
                    next.set(childFieldId, validValues.length > 0 || !childField.isRequired);
                    return next;
                  });
                }
              }
            } else if (parentValues.length > 0) {
              const emptyValue = childExtra.multiSelect ? [] : "";
              newFormFieldsValuesMap.set(childFieldId, emptyValue);

              setFormFieldsValidMap((prev) => {
                const next = new Map(prev);
                next.set(childFieldId, !childField.isRequired);
                return next;
              });
            }
          });
        }
      }

      return newFormFieldsValuesMap;
    });

    setInteractedFields((prev) => {
      const next = new Set(prev);
      next.add(normalizedFieldId);
      return next;
    });

    setFormFieldsValidMap((prev) => {
      if (!interactedFields.has(normalizedFieldId)) {
        return prev;
      }

      const next = new Map(prev);
      next.set(normalizedFieldId, inputValueValid);
      return next;
    });
  };

  const validateRequiredFields = () => {
    let isValidForm = true;
    const nextValidMap = new Map<string, any>();

    visibleFormFields.forEach((field) => {
      const currentFieldId = String(field.id);
      const value = formFieldsValuesMap.get(currentFieldId);
      const extra = getFieldExtra(field);
      const currentFieldType = getFieldType(field);
      const isRequired = field.isRequired;

      if (extra.validationRegex) {
        if (value === "" || value === null || value === undefined) {
          if (!isRequired) {
            nextValidMap.set(currentFieldId, true);
          } else {
            nextValidMap.set(currentFieldId, false);
            isValidForm = false;
          }
        } else if (validateByRegex(value, extra.validationRegex) === false) {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
        } else {
          nextValidMap.set(currentFieldId, true);
        }

        return;
      }

      const excludedRequiredTypes: FieldType[] = [
        fieldType.Link,
        fieldType.Date,
        fieldType.Time,
        fieldType.Location,
        fieldType.Boolean,
        fieldType.Number,
        fieldType.File,
        fieldType.List,
      ];

      if (isRequired && !excludedRequiredTypes.includes(currentFieldType)) {
        if (currentFieldType === fieldType.Options) {
          if ((value && Array.isArray(value) && value.length === 0) || !value) {
            nextValidMap.set(currentFieldId, false);
            isValidForm = false;
          } else {
            nextValidMap.set(currentFieldId, true);
          }
        } else {
          if (!value) {
            nextValidMap.set(currentFieldId, false);
            isValidForm = false;
          } else {
            nextValidMap.set(currentFieldId, true);
          }
        }

        return;
      }

      if (currentFieldType === fieldType.Link) {
        const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/i;
        const validObj = { link: true, linkTxt: true };

        if (!value?.link || !value?.linkTxt) {
          if (!isRequired) {
            nextValidMap.set(currentFieldId, validObj);
          } else {
            nextValidMap.set(currentFieldId, { link: false, linkTxt: false });
            isValidForm = false;
          }
        } else if (value?.link || value?.linkTxt) {
          if (value.link && !value.linkTxt) {
            validObj.linkTxt = false;
            isValidForm = false;
          } else if (!value.link && value.linkTxt) {
            validObj.link = false;
            isValidForm = false;
          } else if (!urlRegex.test(value.link)) {
            validObj.link = false;
            isValidForm = false;
          }

          nextValidMap.set(currentFieldId, validObj);
        }

        return;
      }

      if (currentFieldType === fieldType.Date) {
        if (!value && !isRequired) {
          nextValidMap.set(currentFieldId, true);
        } else if (!value && isRequired) {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
        } else {
          nextValidMap.set(currentFieldId, true);
        }

        return;
      }

      if (currentFieldType === fieldType.Time) {
        if (!value && !isRequired) {
          nextValidMap.set(currentFieldId, true);
        } else if (!value && isRequired) {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
        } else if (value) {
          if (timeRegex.test(value)) {
            nextValidMap.set(currentFieldId, true);
          } else {
            nextValidMap.set(currentFieldId, false);
            isValidForm = false;
          }
        } else {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
        }

        return;
      }

      if (currentFieldType === fieldType.File) {
        if (
          (!value?.files && isRequired) ||
          (value?.files?.newFiles?.length === 0 &&
            value?.files?.attachedFiles?.length === 0 &&
            isRequired)
        ) {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
          return;
        }

        nextValidMap.set(currentFieldId, true);
        return;
      }

      if (currentFieldType === fieldType.Location) {
        const validObj = { x: true, y: true };

        if (!value || (!value.x && !value.y)) {
          if (!isRequired) {
            nextValidMap.set(currentFieldId, validObj);
          } else {
            nextValidMap.set(currentFieldId, { x: false, y: false });
            isValidForm = false;
          }

          return;
        }

        if (!extra.coordinateType || extra.coordinateType === "UTM") {
          if (!utmRegex.test(value.x)) {
            validObj.x = false;
            isValidForm = false;
          }
          if (!utmRegex.test(value.y)) {
            validObj.y = false;
            isValidForm = false;
          }
        } else {
          if (!wktLongitudeRegexX.test(value.x)) {
            validObj.x = false;
            isValidForm = false;
          }
          if (!wktLatitudeRegexY.test(value.y)) {
            validObj.y = false;
            isValidForm = false;
          }
        }

        nextValidMap.set(currentFieldId, validObj);
        return;
      }

      if (currentFieldType === fieldType.List) {
        if (isRequired) {
          if (!value || value.length === 0) {
            nextValidMap.set(currentFieldId, false);
            isValidForm = false;
          } else {
            nextValidMap.set(currentFieldId, true);
          }
        } else {
          nextValidMap.set(currentFieldId, true);
        }

        return;
      }

      if (currentFieldType === fieldType.Number) {
        const { minValue, maxValue, numberType } = extra;
        const isEmpty = isEmptyValue(value);

        if (isEmpty) {
          if (isRequired) {
            nextValidMap.set(currentFieldId, false);
            isValidForm = false;
          } else {
            nextValidMap.set(currentFieldId, true);
          }
          return;
        }

        const numericValue = Number(value);

        if (isNaN(numericValue)) {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
          return;
        }

        if (numberType === "integer" && !Number.isInteger(numericValue)) {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
          return;
        }

        if ((minValue || minValue === 0) && numericValue < minValue) {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
          return;
        }

        if ((maxValue || maxValue === 0) && numericValue > maxValue) {
          nextValidMap.set(currentFieldId, false);
          isValidForm = false;
          return;
        }

        nextValidMap.set(currentFieldId, true);
        return;
      }

      if (currentFieldType === fieldType.Boolean) {
        nextValidMap.set(currentFieldId, true);
        return;
      }

      if (!isRequired) {
        nextValidMap.set(currentFieldId, true);
      }
    });

    setFormFieldsValidMap(nextValidMap);
    return isValidForm;
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
