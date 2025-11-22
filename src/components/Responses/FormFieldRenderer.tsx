import React from "react";
import {
  connectionTypes,
  FieldTypeIds,
  FormField,
  LinkValue,
  LocationValueError,
  ResponseFieldValue,
} from "../../utils/interfaces";
import CustomTextField from "../FormFields/CustomTextField/CustomTextField";
import LinkTextField from "../FormFields/LinkTextField/LinkTextField";
import CustomDateTime from "../FormFields/CustomDateTime/CustomDateTime";
import CustomTimePicker from "../FormFields/CustomTimePicker/CustomTimePicker";
import CustomLatitudeLongitudeField from "../FormFields/CustomLatitudeLongitudeField/CustomLatitudeLongitudeField";
import CustomSwitch from "../FormFields/CustomSwitch/CustomSwitch";
import CustomMultiInputField from "../FormFields/CustomMultiInputField/CustomMultiInputField";
import CustomNumberField from "../FormFields/CustomNumberField/CustomNumberField";
import CustomFileInputField from "../FormFields/CustomFileInputField/CustomFileInputField";
import { FormFieldWrapper, StyledBox } from "./FormFieldRenderer.styled";
import CustomDropDownAutocomplete from "../FormFields/CustomDropDownAutocomplete/CustomDropDownAutocomplete";
import { texts } from "../../utils/texts";

interface FormFieldRendererProps {
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

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
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
}) => {
  const isConnectedToForm = (field: any) => {
    return (
      field.connectionType === connectionTypes.form &&
      field.connectedFormId &&
      field.connectedFieldId
    );
  };

  let input: any = null;
  let uniqueId = formField?.uniqueId || formField?.uniqId;
  let field = formFieldsByIdMap.get(uniqueId);

  field.name = formField.name;
  let formFieldValue: any = formFieldsValuesMap.get(uniqueId);
  if (
    ![FieldTypeIds.date, FieldTypeIds.time, FieldTypeIds.checkbox, FieldTypeIds.number].includes(
      field.typeId,
    ) &&
    !formFieldValue
  ) {
    formFieldValue = "";
  }
  let valid: any = formFieldsValidMap.get(uniqueId);

  switch (formField.typeId) {
    case FieldTypeIds.longText: //מס' שורות טקסט
      input = (
        <CustomTextField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          value={formFieldValue}
          validationRegex={formField.validationRegex}
          multiline
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.shortText: //שורה אחת
      input = (
        <CustomTextField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          value={formFieldValue}
          validationRegex={formField.validationRegex}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.options: //אפשרויות
      if (formField.multiSelect && formFieldValue && Array.isArray(formFieldValue) === false) {
        formFieldValue = [formFieldValue];
      } else if (!formField.multiSelect && Array.isArray(formFieldValue) === true) {
        formFieldValue = formFieldValue[0];
      }

      // Filter options for child fields based on parent selection
      let availableOptions: any = [];
      const connectedToForm = isConnectedToForm(formField);
      if (connectedToForm) {
        availableOptions =
          fieldOptions[formField.uniqueId]?.map((field) => String(field.value)) || [];

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
            availableOptions =
              formField.options.filter((option) => allowedOptions.has(option)) || [];
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

      const defaultValues = Array.isArray(formField.defaultValue)
        ? formField.defaultValue
        : [formField.defaultValue ?? ""];

      const fieldValues = Array.isArray(formFieldValue) ? formFieldValue : [];

      const mergedValues = Array.from(new Set([...defaultValues, ...fieldValues]));

      const value = formField.multiSelect ? fieldValues : formFieldValue;
      availableOptions = availableOptions.filter((option) => !!option); // clearing empty here

      if (connectedToForm) field.options = availableOptions; // doing this allows us to use the same fieldOptions logic for connected fields
      input = (
        <CustomDropDownAutocomplete
          key={index}
          defaultValue={formField?.defaultValue}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(values: string[] | string, valid: boolean | null) => {
            if (values[0] === texts.heb.emptyValue) {
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
      break;

    case FieldTypeIds.link: //היפר-קישור
      input = (
        <LinkTextField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(
            value: LinkValue,
            valid: { link: boolean; linkTxt: boolean } | null,
          ) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          value={formFieldValue || null}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.date: //תאריך
      input = (
        <CustomDateTime
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          value={formFieldValue}
          dateAndTime={formField?.dateAndTime}
          defaultValue={formField?.initialValType}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.time: //שעה
      input = (
        <CustomTimePicker
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          value={formFieldValue}
          showSeconds={formField?.showSeconds}
          defaultValue={formField?.initialValType}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.location: //מיקום
      input = (
        <CustomLatitudeLongitudeField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          coordinateType={formField.coordinateType}
          onChangeHandler={(value: any, valid: LocationValueError | null) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.checkbox: //
      input = (
        <CustomSwitch
          key={index}
          label={formField.displayName}
          isDisabled={viewMode}
          onChangeHandler={(value: boolean) => {
            onChangeHandler(value, uniqueId, true);
          }}
          value={formFieldValue}
          defaultValue={formField?.initialValType}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.list: //
      input = (
        <CustomMultiInputField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any[]) => {
            onChangeHandler(value, uniqueId, true);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.number:
      input = (
        <CustomNumberField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          value={formFieldValue ?? formField?.initialNumberValue ?? ""}
          numberType={formField?.numberType}
          minValue={formField?.minValue}
          maxValue={formField?.maxValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.file:
      input = (
        <CustomFileInputField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any) => {
            onChangeHandler(value, uniqueId, true);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;
    default:
      break;
  }

  if (input) {
    return isTabularEdit ? (
      <StyledBox>
        <FormFieldWrapper>{input}</FormFieldWrapper>
      </StyledBox>
    ) : (
      <FormFieldWrapper>{input}</FormFieldWrapper>
    );
  } else {
    return null;
  }
};

const shouldSkipRerenderHOF = (prevProps, nextProps) => {
  const { formField: prevField, formFieldsValuesMap: prevValues, formFieldsValidMap: prevValid } = prevProps;
  const { formField: nextField, formFieldsValuesMap: nextValues, formFieldsValidMap: nextValid } = nextProps;

  const uniqueId = prevField.uniqueId || prevField.uniqId;

  // רק אם הערך או התוקף השתנה - נעשה רינדור
  const prevVal = prevValues.get(uniqueId);
  const nextVal = nextValues.get(uniqueId);
  const prevValidVal = prevValid.get(uniqueId);
  const nextValidVal = nextValid.get(uniqueId);

  const valueChanged = JSON.stringify(prevVal) !== JSON.stringify(nextVal);
  const validChanged = JSON.stringify(prevValidVal) !== JSON.stringify(nextValidVal);

  return !valueChanged && !validChanged;
};

export default React.memo(FormFieldRenderer, shouldSkipRerenderHOF);