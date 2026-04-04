import React from "react";

import type { FormFieldDto } from "../../types/shared";
import {
  connectionTypes,
  LinkValue,
  LocationValueError,
  LinkValueError,
} from "../../utils/interfaces";
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

type OptionItem = {
  id: string;
  text: string;
  controllingItemsIds?: string[];
};

type FormFieldExtra = {
  options?:
    | {
        items?: OptionItem[];
      }
    | any[];
  value?: any;
  validationRegex?: string;
  linkedFormId?: number;
  connectedFieldId?: string;
  connectionType?: string | number;
  parentFieldId?: string;
  parentDependencies?: any[];
  locationFormat?: number;
  min?: number;
  max?: number;
  numberFormat?: number;
  defaultValue?: any;
  conditions?: any[];
  sectionDescription?: string;
  includeTime?: boolean;
  includeSeconds?: boolean;
  multiSelect?: boolean;
  multiple?: boolean;
  source?: number;
};

type FieldOptionValue = {
  value?: unknown;
};

type FormFieldRendererField = FormFieldDto & {
  sectionId?: string;
  sectionOrder?: number;
};

type FieldValidationError = {
  messages: string[];
  pathMessages: Record<string, string[]>;
};

interface FormFieldRendererProps {
  formField: FormFieldRendererField;
  formFieldsByIdMap: Map<string, FormFieldRendererField>;
  formFieldsValuesMap: Map<string, any>;
  formFieldsValidMap: Map<string, FieldValidationError | null>;
  onChangeHandler: (value: any, fieldId: string, valid?: any) => void;
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
    !!extra.linkedFormId &&
    !!extra.connectedFieldId
  );
};

const getFieldOptionItems = (field: FormFieldDto): OptionItem[] => {
  const extra = getFieldExtra(field);

  if (
    extra.options &&
    typeof extra.options === "object" &&
    !Array.isArray(extra.options) &&
    Array.isArray((extra.options as { items?: OptionItem[] }).items)
  ) {
    return (extra.options as { items: OptionItem[] }).items
      .filter(
        (item) =>
          item &&
          typeof item.id === "string" &&
          item.id.length > 0 &&
          typeof item.text === "string",
      )
      .map((item) => ({
        id: item.id,
        text: item.text,
        controllingItemsIds: Array.isArray(item.controllingItemsIds)
          ? item.controllingItemsIds
          : [],
      }));
  }

  if (Array.isArray(extra.options)) {
    return extra.options.map((option) => ({
      id: String(option),
      text: String(option),
      controllingItemsIds: [],
    }));
  }

  return [];
};

const getFieldOptions = (field: FormFieldDto): string[] =>
  getFieldOptionItems(field).map((item) => item.id);

const getFieldOptionLabelMap = (field: FormFieldDto): Record<string, string> =>
  Object.fromEntries(getFieldOptionItems(field).map((item) => [item.id, item.text]));

const getParentDependencies = (field: FormFieldDto): any[] => {
  const extra = getFieldExtra(field);
  return Array.isArray(extra.parentDependencies) ? extra.parentDependencies : [];
};

const getValidationMessage = (validation: FieldValidationError | null | undefined): string | null =>
  validation?.messages?.[0] ?? null;

const getLocationErrors = (
  validation: FieldValidationError | null | undefined,
): LocationValueError | null => {
  if (!validation) return null;

  return {
    x: validation.pathMessages?.x?.[0],
    y: validation.pathMessages?.y?.[0],
    general: validation.pathMessages?._root?.[0] ?? validation.messages?.[0],
  };
};

const getLinkErrors = (
  validation: FieldValidationError | null | undefined,
): LinkValueError | null => {
  if (!validation) return null;

  return {
    link: validation.pathMessages?.link?.[0],
    linkTxt: validation.pathMessages?.linkTxt?.[0],
    general: validation.pathMessages?._root?.[0],
  };
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
      legacyFieldTypeIds.File,
    ].includes(formField.fieldType as never) &&
    !formFieldValue
  ) {
    formFieldValue = "";
  }

  const validation = formFieldsValidMap.get(fieldId);
  const validationMessage = getValidationMessage(validation);

  let input: any = null;

  switch (formField.fieldType) {
    case legacyFieldTypeIds.LongText:
      input = (
        <CustomTextField
          key={index}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isDisabled={viewMode}
          onChangeHandler={(value: string) => {
            onChangeHandler(value, fieldId);
          }}
          value={formFieldValue}
          validationMessage={validationMessage}
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
          isDisabled={viewMode}
          onChangeHandler={(value: string) => {
            onChangeHandler(value, fieldId);
          }}
          value={formFieldValue}
          validationMessage={validationMessage}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.Options: {
      const multiSelect = Boolean(formFieldExtra.multiSelect ?? formFieldExtra.multiple);

      if (multiSelect) {
        if (!Array.isArray(formFieldValue)) {
          formFieldValue =
            typeof formFieldValue === "string" && formFieldValue !== "" ? [formFieldValue] : [];
        }
      } else {
        if (Array.isArray(formFieldValue)) {
          formFieldValue = formFieldValue[0] ?? "";
        } else if (typeof formFieldValue !== "string") {
          formFieldValue = "";
        }
      }

      let availableOptions: string[] = [];
      const connectedToForm = isConnectedToForm(formField);

      if (connectedToForm) {
        availableOptions =
          fieldOptions[fieldId]?.map((optionField) => String(optionField.value)) || [];

        if (
          formFields.some(
            (candidateField) => getFieldExtra(candidateField).parentFieldId === fieldId,
          )
        ) {
          const uniqueOptions = new Set<string>();
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

      const optionLabels = connectedToForm ? {} : getFieldOptionLabelMap(formField);

      const parentFieldId = formFieldExtra.parentFieldId;
      const parentDependencies = getParentDependencies(formField);

      if (parentFieldId && parentDependencies.length > 0) {
        const parentField = formFields.find(
          (candidateField) => candidateField.id === parentFieldId,
        );
        const parentFieldExtra = parentField ? getFieldExtra(parentField) : {};
        const parentValueFromMap = formFieldsValuesMap.get(parentFieldId);

        const normalizedParentValue = Array.isArray(parentValueFromMap)
          ? parentValueFromMap
          : typeof parentValueFromMap === "string" && parentValueFromMap !== ""
            ? [parentValueFromMap]
            : [];

        const fallbackParentOptions = getFieldOptions(parentField ?? formField);
        const parentValuesForDependency =
          normalizedParentValue.length > 0 ? normalizedParentValue : fallbackParentOptions;

        const hasParentValue = parentValuesForDependency.length > 0;

        if (hasParentValue) {
          const parentValues =
            parentField && (isConnectedToForm(parentField) || connectedToForm)
              ? fieldOptions[parentFieldId]?.map((optionField) => String(optionField.value)) || []
              : parentValuesForDependency;

          const allowedOptions = new Set<string>();

          if (
            formFieldExtra.connectionType === connectionTypes.form &&
            formFieldExtra.linkedFormId &&
            formFieldExtra.connectedFieldId
          ) {
            const filteredOptions =
              fieldOptions[fieldId]
                ?.filter((optionField, optionIndex) => {
                  return (
                    parentValuesForDependency.includes(
                      String(fieldOptions[parentFieldId]?.[optionIndex]?.value),
                    ) && !!optionField.value
                  );
                })
                .map((optionField) => {
                  const value = String(optionField.value);
                  allowedOptions.add(value);
                  return value;
                }) || [];

            availableOptions = Array.from(new Set(filteredOptions));
          } else if (parentField && parentFieldExtra.connectionType === connectionTypes.form) {
            const parentOptionsSet = [
              ...new Set(
                (fieldOptions[parentFieldId] || []).map((optionField) => String(optionField.value)),
              ),
            ];

            parentValues.forEach((parentValueItem: string) => {
              const parentOptionIndex = parentOptionsSet.indexOf(parentValueItem);
              const dependency = parentDependencies.find(
                (candidateDependency) =>
                  candidateDependency.parentOptionIndex === parentOptionIndex,
              );

              if (dependency) {
                dependency.childOptionIndices.forEach((childIndex: number) => {
                  const formOptions = getFieldOptions(formField);
                  if (childIndex < formOptions.length) {
                    allowedOptions.add(formOptions[childIndex]);
                  }
                });
              }
            });

            availableOptions = getFieldOptions(formField).filter((option) =>
              allowedOptions.has(option),
            );
          } else if (parentField) {
            const parentOptions = getFieldOptions(parentField);

            parentValues.forEach((parentValueItem: string) => {
              const parentOptionIndex = parentOptions.indexOf(parentValueItem);

              if (parentOptionIndex !== -1) {
                const dependency = parentDependencies.find(
                  (candidateDependency) =>
                    candidateDependency.parentOptionIndex === parentOptionIndex,
                );

                if (dependency) {
                  dependency.childOptionIndices.forEach((childIndex: number) => {
                    const formOptions = getFieldOptions(formField);
                    if (childIndex < formOptions.length) {
                      allowedOptions.add(formOptions[childIndex]);
                    }
                  });
                }
              }
            });
          }

          if (allowedOptions.size > 0) {
            if (formFieldExtra.connectionType !== connectionTypes.form) {
              availableOptions = getFieldOptions(formField).filter((option) =>
                allowedOptions.has(option),
              );
            }

            if (multiSelect) {
              const currentValues = Array.isArray(formFieldValue) ? formFieldValue : [];
              const validValues = currentValues.filter((value: string) =>
                allowedOptions.has(value),
              );

              if (validValues.length !== currentValues.length) {
                formFieldValue = validValues;

                setTimeout(() => {
                  onChangeHandler(validValues, fieldId);
                }, 0);
              }
            } else {
              const currentValue = typeof formFieldValue === "string" ? formFieldValue : "";

              if (currentValue && !allowedOptions.has(currentValue)) {
                formFieldValue = "";

                setTimeout(() => {
                  onChangeHandler("", fieldId);
                }, 0);
              }
            }
          } else if (parentValues?.length > 0) {
            availableOptions = [];
            formFieldValue = multiSelect ? [] : "";

            setTimeout(() => {
              onChangeHandler(formFieldValue, fieldId);
            }, 0);
          }
        } else {
          if (connectedToForm) {
            availableOptions =
              fieldOptions[fieldId]?.map((optionField) => String(optionField.value)) || [];
            availableOptions = Array.from(new Set(availableOptions));
          } else {
            availableOptions = getFieldOptions(formField);
          }
        }
      }

      if (!formField.isRequired && !multiSelect) {
        if (!availableOptions.includes(texts.heb.emptyValue)) {
          availableOptions = [texts.heb.emptyValue, ...availableOptions];
        }

        if (formFieldValue === texts.heb.emptyValue) {
          formFieldValue = "";
        }
      }

      const defaultValue = formFieldExtra.defaultValue;
      const value = multiSelect
        ? Array.isArray(formFieldValue)
          ? formFieldValue
          : []
        : typeof formFieldValue === "string"
          ? formFieldValue
          : "";

      availableOptions = availableOptions.filter((option) => !!option);

      if (connectedToForm) {
        field.extra = {
          ...fieldExtra,
          options: availableOptions,
        };
      }

      input = (
        <CustomDropDownAutocomplete
          key={index}
          defaultValue={defaultValue}
          label={formField.displayName}
          isRequired={formField.isRequired}
          isDisabled={viewMode}
          onChangeHandler={(nextValue: string[] | string) => {
            onChangeHandler(nextValue, fieldId);
          }}
          value={value}
          multipleOptions={multiSelect}
          options={availableOptions}
          optionLabels={optionLabels}
          validationMessage={validationMessage}
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
          errors={getLinkErrors(validation)}
          isDisabled={viewMode}
          onChangeHandler={(value: LinkValue) => {
            onChangeHandler(value, fieldId);
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
          isDisabled={viewMode}
          onChangeHandler={(value: string) => {
            onChangeHandler(value, fieldId);
          }}
          value={formFieldValue}
          dateAndTime={formFieldExtra.includeTime}
          defaultValue={formFieldExtra.defaultValue}
          validationMessage={validationMessage}
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
          isDisabled={viewMode}
          onChangeHandler={(value: string) => {
            onChangeHandler(value, fieldId);
          }}
          value={formFieldValue}
          includeSeconds={formFieldExtra.includeSeconds}
          defaultValue={formFieldExtra.defaultValue}
          validationMessage={validationMessage}
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
          errors={getLocationErrors(validation)}
          isDisabled={viewMode}
          locationFormat={formFieldExtra.locationFormat}
          onChangeHandler={(value: any) => {
            onChangeHandler(value, fieldId);
          }}
          value={formFieldValue || { x: "", y: "" }}
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
            onChangeHandler(value, fieldId);
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
          isDisabled={viewMode}
          onChangeHandler={(value: any[]) => {
            onChangeHandler(value, fieldId);
          }}
          value={formFieldValue}
          validationMessage={validationMessage}
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
          isDisabled={viewMode}
          onChangeHandler={(value: string) => {
            onChangeHandler(value, fieldId);
          }}
          defaultValue={formFieldValue ?? formFieldExtra.defaultValue ?? ""}
          numberFormat={formFieldExtra.numberFormat}
          min={formFieldExtra.min}
          max={formFieldExtra.max}
          validationMessage={validationMessage}
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
          isDisabled={viewMode}
          onChangeHandler={(value: any) => {
            onChangeHandler(value, fieldId);
          }}
          value={formFieldValue}
          validationMessage={validationMessage}
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
