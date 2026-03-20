import { useEffect, useMemo, useState } from "react";
import {
  ConditionUtils,
  FieldTypeIds,
  Form,
  FormField,
  ResponseFieldValue,
  ResponseForm,
  Role,
} from "../utils/interfaces";
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

interface SectionsMap {
  [sectionId: string]: {
    name?: string;
    description?: string;
    fields: FormField[];
    order: number;
    id?: string;
  };
}

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
  const [formFieldsValidMap, setFormFieldsValidMap] = useState<Map<string, any>>(new Map());
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
            setForm(fetchedForm);
          }
        }

        if (responseId) {
          const res: any = await searchResponses({
            form_id: Number(formId),
            searchFilters: [{ searchText: Number(responseId), searchField: "id" }],
          });

          const found = res?.responses?.[0] ?? null;

          if (isMounted && found) {
            if (copyMode) {
              setResponse({ ...found, id: null as any });
            } else {
              setResponse(found);
            }
          }
        }
      } finally {
        // keep true until form initialization effect completes
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
        response,
        form,
        user,
        isSuperAdmin,
      );

      if (!hasPermissions) {
        navigate(IPath.ERROR, { replace: true });
        return;
      }
    }

    if (!form.fields) return;

    const nextFormFields = [...form.fields];
    const nextFieldsByIdMap = new Map<string, FormField & ResponseFieldValue>();
    const nextValuesMap = new Map<string, any>();
    const nextValidMap = new Map<string, any>();

    nextFormFields.forEach((field: any) => {
      const uniqueId = String(field?.uniqueId || field?.uniqId);

      nextFieldsByIdMap.set(uniqueId, field);

      let defaultValue = field?.value;

      if (field.typeId === FieldTypeIds.number && field?.initialNumberValue !== undefined) {
        defaultValue = field.initialNumberValue;
      } else if (field.typeId === FieldTypeIds.checkbox && field?.defaultValue !== undefined) {
        defaultValue = field.defaultValue;
      }

      nextValuesMap.set(uniqueId, defaultValue);

      if (field.typeId === FieldTypeIds.link) {
        nextValidMap.set(uniqueId, { link: true, linkTxt: true });
      } else if (field.typeId === FieldTypeIds.location) {
        nextValidMap.set(uniqueId, { x: true, y: true });
      } else {
        nextValidMap.set(uniqueId, true);
      }
    });

    if (responseId) {
      if (!response) return;

      setFormTitle((copyMode ? "יצירת תגובה - " : "עריכת תגובה - ") + form.name);

      const fieldValuesArray = response.fieldValues ?? response.data ?? [];
      const fieldDefsMap = new Map<string, any>();

      nextFormFields.forEach((f: any) => {
        const uid = String(f?.uniqueId || f?.uniqId);
        fieldDefsMap.set(uid, f);
      });

      fieldValuesArray.forEach((res: ResponseFieldValue) => {
        const uid = String(res.uniqueId || (res as any).field_id);
        const fieldDef = fieldDefsMap.get(uid);
        let value: any = res?.value;

        if (fieldDef) {
          switch (fieldDef.typeId) {
            case FieldTypeIds.checkbox:
              if (typeof value === "string") {
                value = value === "true";
              } else if (value === null || value === undefined) {
                value = false;
              }
              break;

            case FieldTypeIds.options:
              if (fieldDef.multiSelect && value && !Array.isArray(value)) {
                value = [value];
              } else if (!fieldDef.multiSelect && Array.isArray(value)) {
                value = value[0] ?? "";
              }
              break;

            case FieldTypeIds.list:
              if (value && !Array.isArray(value)) {
                value = [value];
              }
              break;

            default:
              break;
          }
        }

        nextValuesMap.set(uid, value);
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
    field: FormField,
    fields: FormField[],
    valuesMap: Map<string, any>,
  ): boolean => {
    if (!field.conditions || field.conditions.length === 0) {
      return true;
    }

    const dataObject: any = {};
    valuesMap.forEach((value, fieldId) => {
      dataObject[fieldId] = value;
    });

    const conditionsRoot = {
      groups: field.conditions,
      affectedTargets: [],
    };

    try {
      return ConditionUtils.evaluateConditionsRoot(conditionsRoot, dataObject, fields);
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

    const visibleIds = new Set(visibleFormFields.map((field) => String(field?.uniqueId)));

    setFormFieldsValuesMap((prev) => {
      let changed = false;
      const next = new Map(prev);

      formFields.forEach((field) => {
        const uniqueId = String(field?.uniqueId);

        if (visibleIds.has(uniqueId)) return;

        const currentValue = next.get(uniqueId);
        const emptyValue = field.typeId === FieldTypeIds.checkbox ? false : "";

        if (currentValue !== undefined && isDifferent(currentValue, emptyValue)) {
          next.set(uniqueId, emptyValue);
          changed = true;
        }
      });

      return changed ? next : prev;
    });

    setFormFieldsValidMap((prev) => {
      let changed = false;
      const next = new Map(prev);

      formFields.forEach((field) => {
        const uniqueId = String(field?.uniqueId);

        if (visibleIds.has(uniqueId)) return;

        const currentValid = next.get(uniqueId);
        const resetValid =
          field.typeId === FieldTypeIds.link
            ? { link: true, linkTxt: true }
            : field.typeId === FieldTypeIds.location
              ? { x: true, y: true }
              : true;

        if (JSON.stringify(currentValid) !== JSON.stringify(resetValid)) {
          next.set(uniqueId, resetValid);
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [formFields, visibleFormFields]);

  const onChangeHandler = (value: any, uniqueId: any, inputValueValid: any) => {
    const normalizedUniqueId = String(uniqueId);

    setFormFieldsValuesMap((prevFormFieldsValuesMap) => {
      const newFormFieldsValuesMap = new Map(prevFormFieldsValuesMap);
      const prevValue = prevFormFieldsValuesMap.get(normalizedUniqueId);

      if (isDifferent(prevValue, value)) {
        setHasUnsavedChanges?.(true);
      }

      newFormFieldsValuesMap.set(normalizedUniqueId, value);

      if (formFields && formFields.length > 0) {
        const childFields = formFields.filter(
          (field) => String(field.parentFieldId) === normalizedUniqueId,
        );

        if (childFields.length > 0) {
          childFields.forEach((childField) => {
            if (childField.typeId !== FieldTypeIds.options || !childField.parentDependencies)
              return;

            const childUniqueId = String(childField.uniqueId);
            const currentChildValue = newFormFieldsValuesMap.get(childUniqueId);

            const parentField = formFields.find(
              (field) => String(field.uniqueId) === String(childField.parentFieldId),
            );

            if (!parentField || !parentField.options) return;

            const parentValues = Array.isArray(value) ? value : [value];
            const allowedOptions = new Set<any>();

            parentValues.forEach((parentValue) => {
              const parentOptionIndex = parentField.options?.indexOf(parentValue);

              if (parentOptionIndex !== -1) {
                const dependency = childField.parentDependencies?.find(
                  (dep) => dep.parentOptionIndex === parentOptionIndex,
                );

                if (dependency) {
                  dependency.childOptionIndices.forEach((childOptionIndex) => {
                    if (childField.options && childOptionIndex < childField.options.length) {
                      allowedOptions.add(childField.options[childOptionIndex]);
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
                  const newValue = childField.multiSelect
                    ? validValues
                    : validValues.length > 0
                      ? validValues[0]
                      : "";

                  newFormFieldsValuesMap.set(childUniqueId, newValue);

                  setInteractedFields((prev) => {
                    const next = new Set(prev);
                    next.add(childUniqueId);
                    return next;
                  });

                  setFormFieldsValidMap((prev) => {
                    const next = new Map(prev);
                    next.set(childUniqueId, validValues.length > 0 || !childField.required);
                    return next;
                  });
                }
              }
            } else if (parentValues.length > 0) {
              const emptyValue = childField.multiSelect ? [] : "";
              newFormFieldsValuesMap.set(childUniqueId, emptyValue);

              setFormFieldsValidMap((prev) => {
                const next = new Map(prev);
                next.set(childUniqueId, !childField.required);
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
      next.add(normalizedUniqueId);
      return next;
    });

    setFormFieldsValidMap((prev) => {
      if (!interactedFields.has(normalizedUniqueId)) {
        return prev;
      }

      const next = new Map(prev);
      next.set(normalizedUniqueId, inputValueValid);
      return next;
    });
  };

  const validateRequiredFields = () => {
    let ans = true;
    const newFormFieldsValidMap = new Map();

    visibleFormFields.forEach((field) => {
      const uniqueId = String(field?.uniqueId);
      const isRequired = field.required;
      const val = formFieldsValuesMap.get(uniqueId);

      if (!!field.validationRegex) {
        if (val === "" || val === null || val === undefined) {
          if (!field.required) {
            newFormFieldsValidMap.set(uniqueId, true);
          } else {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
          }
        } else if (validateByRegex(val, field.validationRegex) === false) {
          newFormFieldsValidMap.set(uniqueId, false);
          ans = false;
        } else {
          newFormFieldsValidMap.set(uniqueId, true);
        }
      } else {
        const excludedTypeIds: number[] = [
          FieldTypeIds.link,
          FieldTypeIds.date,
          FieldTypeIds.time,
          FieldTypeIds.location,
          FieldTypeIds.checkbox,
          FieldTypeIds.number,
          FieldTypeIds.file,
          FieldTypeIds.list,
        ];

        if (isRequired && !excludedTypeIds.includes(field.typeId)) {
          if (field.typeId === FieldTypeIds.options) {
            if ((val && Array.isArray(val) && val.length === 0) || !val) {
              newFormFieldsValidMap.set(uniqueId, false);
              ans = false;
            } else {
              newFormFieldsValidMap.set(uniqueId, true);
            }
          } else {
            if (!val) {
              newFormFieldsValidMap.set(uniqueId, false);
              ans = false;
            } else {
              newFormFieldsValidMap.set(uniqueId, true);
            }
          }
        } else if (field.typeId === FieldTypeIds.link) {
          const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/i;

          const validObj = { link: true, linkTxt: true };

          if (!val?.link || !val.linkTxt) {
            if (!field.required) {
              newFormFieldsValidMap.set(uniqueId, validObj);
            }

            if (field.required) {
              newFormFieldsValidMap.set(uniqueId, {
                link: false,
                linkTxt: false,
              });
              ans = false;
            }
          } else {
            if (val && (val.link || val.linkTxt)) {
              if (val.link && !val.linkTxt) {
                validObj.linkTxt = false;
                ans = false;
              } else if (!val.link && val.linkTxt) {
                validObj.link = false;
                ans = false;
              } else if (!urlRegex.test(val.link)) {
                validObj.link = false;
                ans = false;
              }

              newFormFieldsValidMap.set(uniqueId, validObj);
            }
          }
        } else if (field.typeId === FieldTypeIds.date) {
          if (!val && !field.required) {
            newFormFieldsValidMap.set(uniqueId, true);
          } else if (!val && field.required) {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
          } else {
            newFormFieldsValidMap.set(uniqueId, true);
          }
        } else if (field.typeId === FieldTypeIds.time) {
          if (!val && !field.required) {
            newFormFieldsValidMap.set(uniqueId, true);
          } else if (!val && field.required) {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
          } else if (val) {
            if (timeRegex.test(val)) {
              newFormFieldsValidMap.set(uniqueId, true);
            } else {
              newFormFieldsValidMap.set(uniqueId, false);
              ans = false;
            }
          } else {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
          }
        } else if (field.typeId === FieldTypeIds.file) {
          if (
            (!val?.files && field.required) ||
            (val?.files?.newFiles?.length === 0 &&
              val?.files?.attachedFiles?.length === 0 &&
              field.required)
          ) {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
            return;
          }

          newFormFieldsValidMap.set(uniqueId, true);
        } else if (field.typeId === FieldTypeIds.location) {
          const validObj = { x: true, y: true };

          if (!val || (!val.x && !val.y)) {
            if (!field.required) {
              newFormFieldsValidMap.set(uniqueId, validObj);
            }

            if (field.required) {
              newFormFieldsValidMap.set(uniqueId, { x: false, y: false });
              ans = false;
              return;
            }
          } else {
            if (val && (val.x || val.y)) {
              if (!field.coordinateType || field.coordinateType === "UTM") {
                if (!utmRegex.test(val.x)) {
                  validObj.x = false;
                  ans = false;
                }
                if (!utmRegex.test(val.y)) {
                  validObj.y = false;
                  ans = false;
                }
              } else {
                if (!wktLongitudeRegexX.test(val.x)) {
                  validObj.x = false;
                  ans = false;
                }
                if (!wktLatitudeRegexY.test(val.y)) {
                  validObj.y = false;
                  ans = false;
                }
              }

              newFormFieldsValidMap.set(uniqueId, validObj);
              return;
            }
          }
        } else if (field.typeId === FieldTypeIds.list) {
          if (isRequired) {
            if (!val || val.length === 0) {
              newFormFieldsValidMap.set(uniqueId, false);
              ans = false;
              return;
            } else {
              newFormFieldsValidMap.set(uniqueId, true);
            }
          } else {
            newFormFieldsValidMap.set(uniqueId, true);
          }
        } else if (field.typeId === FieldTypeIds.number) {
          const { minValue, maxValue, numberType, required } = field;
          const isEmpty = isEmptyValue(val);

          if (isEmpty) {
            if (required) {
              newFormFieldsValidMap.set(uniqueId, false);
              ans = false;
            } else {
              newFormFieldsValidMap.set(uniqueId, true);
            }
            return;
          }

          const numericValue = Number(val);

          if (isNaN(numericValue)) {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
            return;
          }

          if (numberType === "integer" && !Number.isInteger(numericValue)) {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
            return;
          }

          if ((minValue || minValue === 0) && numericValue < minValue) {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
            return;
          }

          if ((maxValue || maxValue === 0) && numericValue > maxValue) {
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
            return;
          }

          newFormFieldsValidMap.set(uniqueId, true);
        } else if (field.typeId === FieldTypeIds.checkbox) {
          newFormFieldsValidMap.set(uniqueId, true);
        } else if (isRequired === false) {
          newFormFieldsValidMap.set(uniqueId, true);
        }
      }
    });

    setFormFieldsValidMap(newFormFieldsValidMap);
    return ans;
  };

  const responsSections: SectionsMap = useMemo(() => {
    return visibleFormFields.reduce((acc: SectionsMap, field: FormField) => {
      const sectionId: string = field.sectionId || NOT_A_SECTION_ID;

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
