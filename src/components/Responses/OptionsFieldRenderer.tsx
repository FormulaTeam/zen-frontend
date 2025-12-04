import React from "react";
import { connectionTypes, FormField, ResponseFieldValue } from "../../utils/interfaces";
import CustomDropDownAutocomplete from "../FormFields/CustomDropDownAutocomplete/CustomDropDownAutocomplete";
import { texts } from "../../utils/texts";

interface RenderOptionsFieldParams {
  formField: any;
  formFieldsByIdMap: Map<string, any>;
  formFieldsValuesMap: Map<string, any>;
  formFieldsValidMap: Map<string, any>;
  onChangeHandler: (value: any, uniqueId: string, valid: any) => void;
  viewMode: boolean;
  fieldOptions: Record<string, ResponseFieldValue[]>;
  formFields: FormField[];
  index?: number;
  isTabularEdit?: boolean;
}

export function renderOptionsField({
  formField,
  formFieldsByIdMap,
  formFieldsValuesMap,
  formFieldsValidMap,
  onChangeHandler,
  viewMode,
  fieldOptions,
  formFields,
  index = 0,
  isTabularEdit = false,
}: RenderOptionsFieldParams) {
  const isConnectedToForm = (field: any) => {
    return (
      field.connectionType === connectionTypes.form &&
      field.connectedFormId &&
      field.connectedFieldId
    );
  };

  let uniqueId = formField?.uniqueId || formField?.uniqId;
  let field = formFieldsByIdMap.get(uniqueId);

  field.name = formField.name;
  let formFieldValue: any = formFieldsValuesMap.get(uniqueId);
  let valid: any = formFieldsValidMap.get(uniqueId);

  if (formField.multiSelect && formFieldValue && Array.isArray(formFieldValue) === false) {
    formFieldValue = [formFieldValue];
  } else if (!formField.multiSelect && Array.isArray(formFieldValue) === true) {
    formFieldValue = formFieldValue[0];
  }

  // Filter options for child fields based on parent selection
  let availableOptions: any = [];
  const connectedToForm = isConnectedToForm(formField);
  if (connectedToForm) {
    availableOptions = fieldOptions[formField.uniqueId]?.map((field) => String(field.value)) || [];

    if (formFields.some((field) => field.parentFieldId === uniqueId)) {
      const uniqueOptions = new Set();
      const newAvailableOptions = fieldOptions[formField.uniqueId]
        ?.map((field) => String(field.value))
        .filter((value) => {
          if (!uniqueOptions.has(value)) {
            uniqueOptions.add(value);
            return true;
          }
          return false;
        });

      availableOptions = newAvailableOptions || [];
    } else {
      // remove duplicates for connected form fields
      const uniqueOptions = new Set(availableOptions);
      availableOptions = Array.from(uniqueOptions);
    }
  } else {
    availableOptions = formField.options || [];
  }

  // If this is a child field with parent dependencies
  if (formField.parentFieldId && formField.parentDependencies) {
    const parentField = formFields.find((field) => field.uniqueId === formField.parentFieldId);
    const parentValue = formFieldsValuesMap.get(formField.parentFieldId)?.length
      ? formFieldsValuesMap.get(formField.parentFieldId)
      : parentField?.options; // even if the parent field has no value, we can use its options to determine if it is filtered by another parent
    // check if parent has a valid value (not empty, null, undefined, or empty array)
    const hasParentValue =
      parentValue && (Array.isArray(parentValue) ? parentValue.length > 0 : parentValue !== "");

    if (hasParentValue) {
      const parentValues =
        parentField?.connectionType === connectionTypes.form || connectedToForm
          ? fieldOptions[formField.parentFieldId]?.map((field) => String(field.value)) // if field or parent is connected to form
          : Array.isArray(parentValue)
          ? parentValue
          : [parentValue];
      const allowedOptions = new Set();
      // Find the parent field to access its options
      if (
        formField.connectionType === connectionTypes.form &&
        formField.connectedFormId &&
        formField.connectedFieldId
      ) {
        const filteredOptions =
          fieldOptions[formField.uniqueId]
            ?.filter((field, index) => {
              return (
                parentValue.includes(
                  String(fieldOptions[formField.parentFieldId][index]?.value),
                ) && !!field.value
              );
            })
            .map((field) => {
              allowedOptions.add(String(field.value));
              return String(field.value);
            }) || [];

        // Remove duplicates
        availableOptions = Array.from(new Set(filteredOptions));
      } else if (parentField?.connectionType === connectionTypes.form) {
        // If parent field is connected to another form
        // create a set of all parent options from fieldOptions and then filter the child options based on parent selection
        const parentOptionsSet = [
          ...new Set(fieldOptions[formField.parentFieldId].map((field) => String(field.value))),
        ];

        parentValue.forEach((parentVal) => {
          const parentOptionIndex = parentOptionsSet.indexOf(parentVal);
          // Find the dependency that matches this parent option index
          const dependency = formField.parentDependencies.find(
            (dep) => dep.parentOptionIndex === parentOptionIndex,
          );

          // If found, add all allowed child options
          if (dependency) {
            // Each child option index points to the position in the child's options array
            dependency.childOptionIndices.forEach((childIndex) => {
              if (formField.options && childIndex < formField.options.length) {
                allowedOptions.add(formField.options[childIndex]);
              }
            });
          }
        });
        availableOptions = formField.options.filter((option) => allowedOptions.has(option)) || [];
      } else if (parentField && parentField.options) {
        // For each selected parent value
        parentValues.forEach((parentVal) => {
          // Convert the parent value (like "a") to its index in parent options array (like 0)
          const parentOptionIndex = parentField.options?.indexOf(parentVal);

          // If this parent option has dependencies
          if (parentOptionIndex !== -1) {
            // Find the dependency that matches this parent option index
            const dependency = formField.parentDependencies.find(
              (dep) => dep.parentOptionIndex === parentOptionIndex,
            );

            // If found, add all allowed child options
            if (dependency) {
              // Each child option index points to the position in the child's options array
              dependency.childOptionIndices.forEach((childIndex) => {
                if (formField.options && childIndex < formField.options.length) {
                  allowedOptions.add(formField.options[childIndex]);
                }
              });
            }
          }
        });
      }

      // Filter options to only allowed ones
      if (allowedOptions.size > 0) {
        if (formField.connectionType !== connectionTypes.form) {
          availableOptions = formField.options.filter((option) => allowedOptions.has(option));
        }

        // Check if current selection is still valid
        if (formFieldValue) {
          if (Array.isArray(formFieldValue)) {
            const validValues = formFieldValue.filter((val) => allowedOptions.has(val));

            if (validValues.length !== formFieldValue.length) {
              formFieldValue = validValues.length > 0 ? validValues : [];
              setTimeout(() => {
                onChangeHandler(
                  formFieldValue,
                  uniqueId,
                  validValues.length > 0 || !formField.required,
                );
              }, 0);
            }
          } else if (!allowedOptions.has(formFieldValue)) {
            formFieldValue = "";
            setTimeout(() => {
              onChangeHandler("", uniqueId, !formField.required);
            }, 0);
          }
        }
      } else if (parentValues?.length > 0) {
        // If parent has value but no child options are allowed, clear child
        availableOptions = [];
        formFieldValue = formField.multiSelect ? [] : "";
        setTimeout(() => {
          onChangeHandler(formFieldValue, uniqueId, !formField.required);
        }, 0);
      }
    } else {
      // if parent is empty - restore all original options for child field (before this, required refresh)
      if (connectedToForm) {
        // For connected form fields, use fieldOptions
        availableOptions = fieldOptions[formField.uniqueId]?.map((field) => field.value) || [];
        // Remove duplicates
        const uniqueOptions = new Set(availableOptions);
        availableOptions = Array.from(uniqueOptions);
      } else {
        // For regular fields, use formField.options
        availableOptions = formField.options || [];
      }
    }
  }

  // Add an empty option at the beginning for non-required fields
  if (!formField.required && !formField.multiSelect) {
    if (!availableOptions.includes(texts.heb.emptyValue)) {
      // Create a new array with a labeled empty option as the first option
      availableOptions = [texts.heb.emptyValue, ...availableOptions];
    }

    // If the current value is our empty option label, convert it to actual empty value for display
    if (formFieldValue === texts.heb.emptyValue) {
      formFieldValue = "";
    }
  }

  const fieldValues = Array.isArray(formFieldValue) ? formFieldValue : [];

  const value = formField.multiSelect ? fieldValues : formFieldValue;
  availableOptions = availableOptions.filter((option) => !!option); // clearing empty here

  if (connectedToForm) field.options = availableOptions; // doing this allows us to use the same fieldOptions logic for connected fields

  return (
    <CustomDropDownAutocomplete
      key={index}
      defaultValue={formField?.defaultValue}
      label={formField.displayName}
      isRequired={formField.required}
      isValid={valid}
      isDisabled={viewMode}
      onChangeHandler={(values: string[] | string, valid: boolean | null) => {
        if ((Array.isArray(values) && values[0] === texts.heb.emptyValue) || values === texts.heb.emptyValue) {
          onChangeHandler("", uniqueId, !formField.required);
        } else {
          onChangeHandler(values, uniqueId, valid);
        }
      }}
      value={value}
      multipleOptions={formField.multiSelect}
      options={availableOptions}
      isTabularEdit={isTabularEdit}
    />
  );
}