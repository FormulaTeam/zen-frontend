import React from "react";

import type { FormFieldDto } from "../../types/shared";
import { connectionTypes, LinkValue, LocationValueError } from "../../utils/interfaces";
import { fieldType as legacyFieldTypeIds } from "formula-gear";
import CustomDateTime from "../FormFields/CustomDateTime/CustomDateTime";
import CustomDropDownAutocomplete from "../FormFields/CustomDropDownAutocomplete/CustomDropDownAutocomplete";
import CustomFileInputField from "../FormFields/CustomFileInputField/CustomFileInputField";
import CustomLatitudeLongitudeField from "../FormFields/CustomLatitudeLongitudeField/CustomLatitudeLongitudeField";
import CustomMultiInputField from "../FormFields/CustomMultiInputField/CustomMultiInputField";
import CustomNumberField from "../FormFields/CustomNumberField/CustomNumberField";
import CustomSwitch from "../FormFields/CustomSwitch/CustomSwitch";
import CustomTextField from "../FormFields/CustomTextField/CustomTextField";
import CustomTimePicker from "../FormFields/CustomTimePicker/CustomTimePicker";
import LinkTextField from "../FormFields/LinkTextField/LinkTextField";
import { FormFieldWrapper, StyledBox } from "./FormFieldRenderer.styled";
import { texts } from "../../utils/texts";

type FormFieldExtra = {
  options?: any[];
  value?: any;
  validationRegex?: string;
  connectedFormId?: number;
  connectedFieldId?: string;
  connectionType?: string | number;
  parentFieldId?: string;
  parentDependencies?: any[];
  coordinateType?: string;
  minValue?: number;
  maxValue?: number;
  numberType?: string;
  initialNumberValue?: number;
  defaultValue?: any;
  conditions?: any[];
  sectionDescription?: string;
  dateAndTime?: boolean;
  initialValType?: any;
  showSeconds?: boolean;
  multiSelect?: boolean;
};

type FieldOptionValue = {
  value?: unknown;
};

type FormFieldRendererField = FormFieldDto & {
  sectionId?: string;
  sectionOrder?: number;
};

interface FormFieldRendererProps {
  formField: FormFieldRendererField;
  formFieldsByIdMap: Map<string, FormFieldRendererField>;
  formFieldsValuesMap: Map<string, any>;
  formFieldsValidMap: Map<string, any>;
  onChangeHandler: (value: any, fieldId: string, valid: any) => void;
  viewMode: boolean;
  fieldOptions: Record<string, FieldOptionValue[]>;
  formFields: FormFieldRendererField[];
  index?: number;
  isTabularEdit?: boolean;
  formId?: number | string;
}

const getFieldExtra = (field: FormFieldDto): FormFieldExtra => {
  if (!field.extra || typeof field.extra !== "object") return {};

  return field.extra as FormFieldExtra;
};

const isConnectedToForm = (field: FormFieldDto) => {
  const extra = getFieldExtra(field);

  return (
    extra.connectionType === connectionTypes.form &&
    !!extra.connectedFormId &&
    !!extra.connectedFieldId
  );
};

const getFieldOptions = (field: FormFieldDto): any[] => {
  const extra = getFieldExtra(field);

  return Array.isArray(extra.options) ? extra.options : [];
};

const getParentDependencies = (field: FormFieldDto): any[] => {
  const extra = getFieldExtra(field);

  return Array.isArray(extra.parentDependencies) ? extra.parentDependencies : [];
};

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
  formId,
}) => {
  const fieldId = formField.id;
  const field = formFieldsByIdMap.get(fieldId) ?? formField;
  const formFieldExtra = getFieldExtra(formField);
  const fieldExtra = getFieldExtra(field);

  field.name = formField.name;

  let formFieldValue: any = formFieldsValuesMap.get(fieldId);

  if (
    ![
      legacyFieldTypeIds.Date,
      legacyFieldTypeIds.Time,
      legacyFieldTypeIds.Boolean,
      legacyFieldTypeIds.Number,
    ].includes(field.fieldType as never) &&
    !formFieldValue
  ) {
    formFieldValue = "";
  }

  const valid: any = formFieldsValidMap.get(fieldId);
  let input: any = null;

  switch (formField.fieldType) {
    case legacyFieldTypeIds.LongText:
      input = (
        <CustomTextField
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, nextValid: boolean | null) => {
            onChangeHandler(value, fieldId, nextValid);
          }}
          value={formFieldValue}
          validationRegex={formFieldExtra.validationRegex}
          multiline
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.ShortText:
      input = (
        <CustomTextField
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, nextValid: boolean | null) => {
            onChangeHandler(value, fieldId, nextValid);
          }}
          value={formFieldValue}
          validationRegex={formFieldExtra.validationRegex}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.Options: {
      const multiSelect = !!formFieldExtra.multiSelect;

      if (multiSelect && formFieldValue && Array.isArray(formFieldValue) === false)
        formFieldValue = [formFieldValue];
      else if (!multiSelect && Array.isArray(formFieldValue) === true)
        formFieldValue = formFieldValue[0];

      let availableOptions: any[] = [];
      const connectedToForm = isConnectedToForm(formField);

      if (connectedToForm) {
        availableOptions =
          fieldOptions[fieldId]?.map((optionField) => String(optionField.value)) || [];

        if (
          formFields.some(
            (candidateField) => getFieldExtra(candidateField).parentFieldId === fieldId,
          )
        ) {
          const uniqueOptions = new Set();
          const filteredOptions = fieldOptions[fieldId]
            ?.map((optionField) => String(optionField.value))
            .filter((value) => {
              if (!uniqueOptions.has(value)) {
                uniqueOptions.add(value);

                return true;
              }

              return false;
            });

          availableOptions = filteredOptions || [];
        } else {
          availableOptions = Array.from(new Set(availableOptions));
        }
      } else {
        availableOptions = getFieldOptions(formField);
      }

      const parentFieldId = formFieldExtra.parentFieldId;
      const parentDependencies = getParentDependencies(formField);

      if (parentFieldId && parentDependencies.length > 0) {
        const parentField = formFields.find(
          (candidateField) => candidateField.id === parentFieldId,
        );
        const parentFieldExtra = parentField ? getFieldExtra(parentField) : {};
        const parentValueFromMap = formFieldsValuesMap.get(parentFieldId);
        const parentValue = parentValueFromMap?.length
          ? parentValueFromMap
          : getFieldOptions(parentField ?? formField);

        const hasParentValue =
          parentValue && (Array.isArray(parentValue) ? parentValue.length > 0 : parentValue !== "");

        if (hasParentValue) {
          const parentValues =
            parentField && (isConnectedToForm(parentField) || connectedToForm)
              ? fieldOptions[parentFieldId]?.map((optionField) => String(optionField.value))
              : Array.isArray(parentValue)
                ? parentValue
                : [parentValue];

          const allowedOptions = new Set<any>();

          if (
            formFieldExtra.connectionType === connectionTypes.form &&
            formFieldExtra.connectedFormId &&
            formFieldExtra.connectedFieldId
          ) {
            const filteredOptions =
              fieldOptions[fieldId]
                ?.filter((optionField, optionIndex) => {
                  return (
                    parentValue.includes(
                      String(fieldOptions[parentFieldId]?.[optionIndex]?.value),
                    ) && !!optionField.value
                  );
                })
                .map((optionField) => {
                  allowedOptions.add(String(optionField.value));

                  return String(optionField.value);
                }) || [];

            availableOptions = Array.from(new Set(filteredOptions));
          } else if (parentField && parentFieldExtra.connectionType === connectionTypes.form) {
            const parentOptionsSet = [
              ...new Set(
                (fieldOptions[parentFieldId] || []).map((optionField) => String(optionField.value)),
              ),
            ];

            parentValue.forEach((parentValueItem: any) => {
              const parentOptionIndex = parentOptionsSet.indexOf(parentValueItem);
              const dependency = parentDependencies.find(
                (candidateDependency) =>
                  candidateDependency.parentOptionIndex === parentOptionIndex,
              );

              if (dependency) {
                dependency.childOptionIndices.forEach((childIndex: number) => {
                  const formOptions = getFieldOptions(formField);

                  if (childIndex < formOptions.length) allowedOptions.add(formOptions[childIndex]);
                });
              }
            });

            availableOptions =
              getFieldOptions(formField).filter((option) => allowedOptions.has(option)) || [];
          } else if (parentField) {
            const parentOptions = getFieldOptions(parentField);

            parentValues.forEach((parentValueItem: any) => {
              const parentOptionIndex = parentOptions.indexOf(parentValueItem);

              if (parentOptionIndex !== -1) {
                const dependency = parentDependencies.find(
                  (candidateDependency) =>
                    candidateDependency.parentOptionIndex === parentOptionIndex,
                );

                if (dependency) {
                  dependency.childOptionIndices.forEach((childIndex: number) => {
                    const formOptions = getFieldOptions(formField);

                    if (childIndex < formOptions.length)
                      allowedOptions.add(formOptions[childIndex]);
                  });
                }
              }
            });
          }

          if (allowedOptions.size > 0) {
            if (formFieldExtra.connectionType !== connectionTypes.form)
              availableOptions = getFieldOptions(formField).filter((option) =>
                allowedOptions.has(option),
              );

            if (formFieldValue) {
              if (Array.isArray(formFieldValue)) {
                const validValues = formFieldValue.filter((value) => allowedOptions.has(value));

                if (validValues.length !== formFieldValue.length) {
                  formFieldValue = validValues.length > 0 ? validValues : [];

                  setTimeout(() => {
                    onChangeHandler(
                      formFieldValue,
                      fieldId,
                      validValues.length > 0 || !formField.isRequired,
                    );
                  }, 0);
                }
              } else if (!allowedOptions.has(formFieldValue)) {
                formFieldValue = "";

                setTimeout(() => {
                  onChangeHandler("", fieldId, !formField.isRequired);
                }, 0);
              }
            }
          } else if (parentValues?.length > 0) {
            availableOptions = [];
            formFieldValue = multiSelect ? [] : "";

            setTimeout(() => {
              onChangeHandler(formFieldValue, fieldId, !formField.isRequired);
            }, 0);
          }
        } else {
          if (connectedToForm) {
            availableOptions = fieldOptions[fieldId]?.map((optionField) => optionField.value) || [];
            availableOptions = Array.from(new Set(availableOptions));
          } else {
            availableOptions = getFieldOptions(formField);
          }
        }
      }

      if (!formField.isRequired && !multiSelect) {
        if (!availableOptions.includes(texts.heb.emptyValue))
          availableOptions = [texts.heb.emptyValue, ...availableOptions];

        if (formFieldValue === texts.heb.emptyValue) formFieldValue = "";
      }

      const defaultValue = formFieldExtra.defaultValue;
      const fieldValues = Array.isArray(formFieldValue) ? formFieldValue : [];
      const value = multiSelect ? fieldValues : formFieldValue;

      availableOptions = availableOptions.filter((option) => !!option);

      if (connectedToForm)
        field.extra = {
          ...fieldExtra,
          options: availableOptions,
        };

      input = (
        <CustomDropDownAutocomplete
          key={index}
          defaultValue={defaultValue}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(values: string[] | string, nextValid: boolean | null) => {
            if (values[0] === texts.heb.emptyValue)
              onChangeHandler("", fieldId, !formField.isRequired);
            else onChangeHandler(values, fieldId, nextValid);
          }}
          value={value}
          multipleOptions={multiSelect}
          options={availableOptions}
          isTabularEdit={isTabularEdit}
        />
      );
      break;
    }

    case legacyFieldTypeIds.Link:
      input = (
        <LinkTextField
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(
            value: LinkValue,
            nextValid: { link: boolean; linkTxt: boolean } | null,
          ) => {
            onChangeHandler(value, fieldId, nextValid);
          }}
          value={formFieldValue || null}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.Date:
      input = (
        <CustomDateTime
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, nextValid: boolean | null) => {
            onChangeHandler(value, fieldId, nextValid);
          }}
          value={formFieldValue}
          dateAndTime={formFieldExtra.dateAndTime}
          defaultValue={formFieldExtra.initialValType}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.Time:
      input = (
        <CustomTimePicker
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, nextValid: boolean | null) => {
            onChangeHandler(value, fieldId, nextValid);
          }}
          value={formFieldValue}
          showSeconds={formFieldExtra.showSeconds}
          defaultValue={formFieldExtra.initialValType}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.Location:
      input = (
        <CustomLatitudeLongitudeField
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          coordinateType={formFieldExtra.coordinateType}
          onChangeHandler={(value: any, nextValid: LocationValueError | null) => {
            onChangeHandler(value, fieldId, nextValid);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.Boolean:
      input = (
        <CustomSwitch
          key={index}
          label={formField.displayName}
          isDisabled={viewMode}
          onChangeHandler={(value: boolean) => {
            onChangeHandler(value, fieldId, true);
          }}
          value={formFieldValue}
          defaultValue={formFieldExtra.defaultValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.List:
      input = (
        <CustomMultiInputField
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any[]) => {
            onChangeHandler(value, fieldId, true);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.Number:
      input = (
        <CustomNumberField
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, nextValid: boolean) => {
            onChangeHandler(value, fieldId, nextValid);
          }}
          value={formFieldValue ?? formFieldExtra.initialNumberValue ?? ""}
          numberType={formFieldExtra.numberType}
          minValue={formFieldExtra.minValue}
          maxValue={formFieldExtra.maxValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.File:
      input = (
        <CustomFileInputField
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any) => {
            onChangeHandler(value, fieldId, true);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
          formId={formId}
        />
      );
      break;

    default:
      break;
  }

  if (!input) return null;

  return isTabularEdit ? (
    <StyledBox>
      <FormFieldWrapper>{input}</FormFieldWrapper>
    </StyledBox>
  ) : (
    <FormFieldWrapper>{input}</FormFieldWrapper>
  );
};

const shouldSkipRerenderHOF = (
  prevProps: FormFieldRendererProps,
  nextProps: FormFieldRendererProps,
) => {
  const {
    formField: prevField,
    formFieldsValuesMap: prevValues,
    formFieldsValidMap: prevValid,
  } = prevProps;
  const {
    formField: nextField,
    formFieldsValuesMap: nextValues,
    formFieldsValidMap: nextValid,
  } = nextProps;

  const fieldId = prevField.id;
  const previousValue = prevValues.get(fieldId);
  const nextValue = nextValues.get(fieldId);
  const previousValidValue = prevValid.get(fieldId);
  const nextValidValue = nextValid.get(fieldId);

  const valueChanged = JSON.stringify(previousValue) !== JSON.stringify(nextValue);
  const validChanged = JSON.stringify(previousValidValue) !== JSON.stringify(nextValidValue);

  return !valueChanged && !validChanged && prevField.id === nextField.id;
};

export default React.memo(FormFieldRenderer, shouldSkipRerenderHOF);
