import { useEffect, useMemo, useState } from "react";
import {
  ConditionUtils,
  ElementTypeIds,
  Form,
  FormField,
  ResponseFieldValue,
  ResponseForm,
  Role,
  SearchResponsesFilter,
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
  const [formFields, setFormFields]: any[] = useState([]);
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

  const { fieldOptions, isLoading: loadingConnections } = useConnectedFormOptions({
    formFields: form?.fields || [],
  });

  const toggleSectionCollapse = (sectionId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };
  const navigate = useNavigate();
  useEffect(() => {
    if (formId) {
      getFormById(Number(formId)).then((form) => {
        if (form) {
          setForm(form);
        }
      });
    }
    if (responseId) {
      const filter: SearchResponsesFilter = {
        form_id: Number(formId),
        searchFilters: [{ searchText: Number(responseId), searchField: "id" }],
      };
      searchResponses(filter).then((res: any) => {
        if (res) {
          if (copyMode) {
            const copyResponse = res.responses[0];
            copyResponse.id = null;
            setResponse(copyResponse);
          } else {
            setResponse(res.responses[0]);
          }
        }
      });
    }
  }, []);

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

    if (form?.fields) {
      setFormFields(form.fields);
      form.fields.forEach((field: any) => {
        const uniqueId = (field?.uniqueId || field?.uniqId) + "";
        formFieldsByIdMap.set(uniqueId, field);
        // Handle different field types for default values
        let defaultValue = field?.value;
        if (field.typeId === ElementTypeIds.number && field?.initialNumberValue !== undefined) {
          defaultValue = field.initialNumberValue;
        } else if (field.typeId === ElementTypeIds.checkbox && field?.defaultValue !== undefined) {
          defaultValue = field.defaultValue;
        }

        formFieldsValuesMap.set(uniqueId, defaultValue);

        if (field.typeId === ElementTypeIds.link) {
          formFieldsValidMap.set(uniqueId, { link: true, linkTxt: true });
        } else if (field.typeId === ElementTypeIds.location) {
          formFieldsValidMap.set(uniqueId, { x: true, y: true });
        } else {
          formFieldsValidMap.set(uniqueId, true);
        }
      });

      if (responseId) {
        if (!response) return; // will keep loading untill response is fetched
        setFormTitle((copyMode ? "יצירת תגובה - " : "עריכת תגובה - ") + form.name);
        response.data.map((res: any) => {
          formFieldsValuesMap.set(res.uniqueId + "", res?.value);
        });
      } else {
        setFormTitle("יצירת תגובה - " + form.name);
      }
      if (viewMode) {
        setFormTitle("צפייה בתגובה - " + form.name);
      }
      setLoading(false);
    }
  }, [form, response, viewMode, copyMode]);

  const onChangeHandler = (value: any, uniqueId: any, inputValueValid: any) => {
    setFormFieldsValuesMap((prevFormFieldsValuesMap) => {
      const newFormFieldsValuesMap = new Map(prevFormFieldsValuesMap);
      const prevValue = prevFormFieldsValuesMap.get(uniqueId);
      if (isDifferent(prevValue, value)) {
        setHasUnsavedChanges?.(true);
      }
      newFormFieldsValuesMap.set(uniqueId, value);

      // Check if this field is a parent of other fields and handle child fields accordingly
      if (formFields && formFields.length > 0) {
        // Find all child fields that depend on this field
        const childFields = formFields.filter((field) => field.parentFieldId === uniqueId);

        if (childFields.length > 0) {
          childFields.forEach((childField) => {
            // Skip if not options field (type 3)
            if (childField.typeId !== 3 || !childField.parentDependencies) return;

            const childUniqueId = childField.uniqueId;
            const currentChildValue = newFormFieldsValuesMap.get(childUniqueId);

            // Find the parent field to access its options
            const parentField = formFields.find(
              (field) => field.uniqueId === childField.parentFieldId,
            );

            if (!parentField || !parentField.options) return;

            // Collect all allowed options based on the parent's selection
            const parentValues = Array.isArray(value) ? value : [value];
            const allowedOptions = new Set();

            parentValues.forEach((parentValue) => {
              // Convert parent value to its index
              const parentOptionIndex = parentField.options.indexOf(parentValue);

              if (parentOptionIndex !== -1) {
                // Find dependency that matches this parent option index
                const dependency = childField.parentDependencies.find(
                  (dep) => dep.parentOptionIndex === parentOptionIndex,
                );

                if (dependency) {
                  // For each allowed child option index, get the actual option value
                  dependency.childOptionIndices.forEach((childOptionIndex) => {
                    if (childField.options && childOptionIndex < childField.options.length) {
                      allowedOptions.add(childField.options[childOptionIndex]);
                    }
                  });
                }
              }
            });

            // Check if current values are still valid with the new parent selection
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

                  // Also mark child field as interacted with
                  const newInteractedFields = new Set(interactedFields);
                  newInteractedFields.add(childUniqueId);
                  setInteractedFields(newInteractedFields);

                  // Update validation status
                  const newFormFieldsValidMap = new Map(formFieldsValidMap);
                  newFormFieldsValidMap.set(
                    childUniqueId,
                    validValues.length > 0 || !childField.required,
                  );
                  setFormFieldsValidMap(newFormFieldsValidMap);
                }
              }
            } else if (parentValues.length > 0) {
              // If parent has selection but no options are allowed, clear child value
              const emptyValue = childField.multiSelect ? [] : "";
              newFormFieldsValuesMap.set(childUniqueId, emptyValue);

              // Also update validation
              const newFormFieldsValidMap = new Map(formFieldsValidMap);
              newFormFieldsValidMap.set(childUniqueId, !childField.required);
              setFormFieldsValidMap(newFormFieldsValidMap);
            }
          });
        }
      }

      return newFormFieldsValuesMap;
    });

    // Mark field as interacted with
    const newInteractedFields = new Set(interactedFields);
    newInteractedFields.add(uniqueId);
    setInteractedFields(newInteractedFields);

    // Only set validation if we've interacted with the field
    if (interactedFields.has(uniqueId)) {
      const newFormFieldsValidMap = new Map(formFieldsValidMap);
      newFormFieldsValidMap.set(uniqueId, inputValueValid);
      setFormFieldsValidMap(newFormFieldsValidMap);
    }
  };

  /** validate that required fields are not empty
   * if link check both link text and link url
   * if options - check all options texts
   */
  const validateRequiredFields = () => {
    let ans = true;
    let newFormFieldsValidMap = new Map();
    if (form?.fields) {
      form.fields.forEach((field) => {
        let uniqueId = field?.uniqueId + "";
        let isRequired = field.required;
        let val = formFieldsValuesMap.get(uniqueId);
        // If there is a regex validation rule
        if (!!field.validationRegex) {
          // If the field is empty check if it's not required
          if (val === "" || val === null || val === undefined) {
            // If the field is not required, it's valid
            if (!field.required) {
              newFormFieldsValidMap.set(uniqueId, true);
            } else {
              // If the field is empty and required, it's invalid
              newFormFieldsValidMap.set(uniqueId, false);
              ans = false;
            }
            // If the field is not empty, check if it matches the regex
          } else if (validateByRegex(val, field.validationRegex) == false) {
            // If the field does not match the regex, it's invalid
            newFormFieldsValidMap.set(uniqueId, false);
            ans = false;
          }
        } else {
          const excludedTypeIds: number[] = [
            ElementTypeIds.link,
            ElementTypeIds.date,
            ElementTypeIds.hour,
            ElementTypeIds.location,
            ElementTypeIds.checkbox,
            ElementTypeIds.number,
            ElementTypeIds.file,
            ElementTypeIds.list,
          ];
          if (isRequired && !excludedTypeIds.includes(field.typeId)) {
            //אפשרויות
            if (field.typeId === ElementTypeIds.options) {
              if ((val && Array.isArray(val) && val.length === 0) || !val) {
                newFormFieldsValidMap.set(uniqueId, false);
                ans = false;
              } else {
                newFormFieldsValidMap.set(uniqueId, true);
              }
            }
            //שאר השדות שלא ברשימה
            else {
              if (!val) {
                newFormFieldsValidMap.set(uniqueId, false);
                ans = false;
              } else {
                newFormFieldsValidMap.set(uniqueId, true);
              }
            }
          }

          //היפר-קישור
          else if (field.typeId === ElementTypeIds.link) {
            const urlRegex = /^(https?:\/\/)?([\w.-]+)\.([a-z]{2,6})([/\w .-]*)*\/?$/i;

            let validObj = { link: true, linkTxt: true };
            //if no value
            if (!val?.link || !val.linkTxt) {
              //if no value and not required - true in both
              if (!field.required) {
                newFormFieldsValidMap.set(uniqueId, validObj);
              }
              //if no value and is required - false in both
              if (field.required) {
                newFormFieldsValidMap.set(uniqueId, {
                  link: false,
                  linkTxt: false,
                });
                ans = false;
              }
            }
            //if has value
            else {
              //if has value in link or linkTxt
              if (val && (val.link || val.linkTxt)) {
                //no value in linkTxt
                if (val.link && !val.linkTxt) {
                  validObj.linkTxt = false;
                  ans = false;
                }
                //no value in link
                else if (!val.link && val.linkTxt) {
                  validObj.link = false;
                  ans = false;
                } else if (!urlRegex.test(val.link)) {
                  validObj.link = false;
                  ans = false;
                }
                newFormFieldsValidMap.set(uniqueId, validObj);
              }
            }
          }

          //תאריך
          else if (field.typeId === ElementTypeIds.date) {
            //if no value and not required - is valid
            if (!val && !field.required) {
              newFormFieldsValidMap.set(uniqueId, true);
            }
            // //if no value and is required - not valid
            else if (!val && field.required) {
              newFormFieldsValidMap.set(uniqueId, false);
              ans = false;
            } else {
              newFormFieldsValidMap.set(uniqueId, true);
            }
          }

          //שעה
          else if (field.typeId === ElementTypeIds.hour) {
            //if no value and not required - is valid
            if (!val && !field.required) {
              newFormFieldsValidMap.set(uniqueId, true);
            }
            //if no value and is required - not valid
            else if (!val && field.required) {
              newFormFieldsValidMap.set(uniqueId, false);
              ans = false;
            }
            //if has value - validate time string format
            else if (val) {
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
          } else if (field.typeId === ElementTypeIds.file) {
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
          }

          //נקודת ציון - if not empty check 6 digits for x and y
          else if (field.typeId === ElementTypeIds.location) {
            // let val = formFieldsValuesMap.get(uniqueId);
            let validObj = { x: true, y: true };

            //if no value
            if (!val || (!val.x && !val.y)) {
              //if no value and not required - true in both
              if (!field.required) {
                newFormFieldsValidMap.set(uniqueId, validObj);
              }
              //if no value and is required - false in both
              if (field.required) {
                newFormFieldsValidMap.set(uniqueId, { x: false, y: false });
                ans = false;
                return;
              }
            }
            //if has value
            else {
              //if has value in x or y
              if (val && (val.x || val.y)) {
                //no value in y
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
          } else if (field.typeId === ElementTypeIds.list) {
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
          }
          //מספר
          else if (field.typeId === ElementTypeIds.number) {
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
          } else if (field.typeId === ElementTypeIds.checkbox) {
            return true;
          }
          //all other fields
          else if (isRequired === false) {
            newFormFieldsValidMap.set(uniqueId, true);
          }
        } //end if no regex
      });
    }
    setFormFieldsValidMap(newFormFieldsValidMap);
    return ans;
  };

  // Memoized evaluation of field visibility based on conditions and current values
  const visibleFormFields = useMemo(() => {
    // Function to evaluate if a field should be visible based on its conditions
    const evaluateFieldVisibility = (field: FormField): boolean => {
      // If the field has no conditions, it's always visible
      if (!field.conditions || field.conditions.length === 0) {
        return true;
      }

      // Create a data object from current form field values
      const dataObject: any = {};
      formFieldsValuesMap.forEach((value, fieldId) => {
        dataObject[fieldId] = value;
      });

      // Create a conditions root structure from the field's conditions
      const conditionsRoot = {
        groups: field.conditions,
        affectedTargets: [], // Not needed for evaluation
      };

      try {
        // Evaluate the conditions against the current data
        return ConditionUtils.evaluateConditionsRoot(conditionsRoot, dataObject, formFields);
      } catch (error) {
        console.error("Error evaluating conditions for field:", field.displayName, error);
        // If there's an error evaluating conditions, default to showing the field
        return true;
      }
    };
    // clear hidden fields value
    formFields.forEach((field: FormField) => {
      const isVisible = evaluateFieldVisibility(field);
      if (!isVisible) {
        const uniqueId = field?.uniqueId + "";
        // Clear value
        if (formFieldsValuesMap.get(uniqueId)) {
          formFieldsValuesMap.set(uniqueId, field.typeId === ElementTypeIds.checkbox ? false : "");
          setFormFieldsValuesMap(new Map(formFieldsValuesMap));
        }
        // Clear validation
        if (formFieldsValidMap.get(uniqueId)) {
          formFieldsValidMap.set(uniqueId, true);
          setFormFieldsValidMap(new Map(formFieldsValidMap));
        }
      }
    });

    // Filter form fields based on condition evaluation
    return formFields.filter(evaluateFieldVisibility);
  }, [formFields, formFieldsValuesMap]); // Re-evaluate when fields or values change

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
  }, [visibleFormFields]); // Re-calculate sections when visible fields change
  return {
    formTitle,
    formFields: visibleFormFields, // Return filtered fields instead of all fields
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
