import React from "react";

import type { FormFieldDto } from "../../types/shared";
import {
  connectionTypes,
  LinkValue,
  LocationValueError,
  LinkValueError,
} from "../../utils/interfaces";
import {
  fieldType as legacyFieldTypeIds,
  type FieldValidationMessage,
  selectionMode,
} from "formula-gear";
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
import { formatOptionLabel } from "../../utils/optionResponseValue";

type OptionItem = {
  id: string;
  text: string;
  isActive?: boolean;
  controllingItemsIds?: string[];
};

type FormFieldExtra = {
  options?: {
    items?: OptionItem[];
    defaultValue?: string[];
  };
  value?: any;
  validationRegex?: string;
  linkedOptionsFieldId?: string | null;

  linkedFormId?: number;
  connectedFieldId?: string;
  connectionType?: string | number;

  parentFieldId?: string;
  parentDependencies?: any[];
  locationFormat?: "utm" | "wkt";
  min?: number;
  max?: number;
  numberType?: "integer" | "decimal";
  defaultValue?: any;
  conditions?: any[];
  sectionDescription?: string;
  dateType?: "datetime" | "date";
  timePrecision?: "seconds" | "minutes";
  selectionMode?: "multiple" | "single";
  inactiveOptionIds?: string[];
};

type FieldOptionValue = {
  value?: unknown;
};

type FormFieldRendererField = FormFieldDto & {
  sectionId?: string;
  sectionOrder?: number;
};

type FieldValidationError = {
  messages: FieldValidationMessage[];
  pathMessages: Record<string, FieldValidationMessage[]>;
};

type FieldErrorDisplay = {
  message?: string;
  detail?: string;
};

interface FormFieldRendererProps {
  formField: FormFieldRendererField;
  formFieldsByIdMap: Map<string, FormFieldRendererField>;
  formFieldsValuesMap: Map<string, any>;
  formFieldsValidMap: Map<string, FieldValidationError | null>;
  onChangeHandler: (value: any, fieldId: string, valid?: any) => void;
  onBlurHandler: (fieldId: string) => void;
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

const isConnectedToForm = (field: FormFieldDto, formFields?: FormFieldDto[]): boolean => {
  const linkedOptionsFieldId = getFieldExtra(field).linkedOptionsFieldId;
  if (!linkedOptionsFieldId) return false;

  if (formFields && formFields.some((f) => String(f.id) === String(linkedOptionsFieldId))) {
    return false;
  }

  return true;
};

const getConnectedFieldOptions = (
  fieldId: string,
  fieldOptions: Record<string, FieldOptionValue[]>,
): string[] => {
  const options =
    fieldOptions[fieldId]
      ?.map((optionField) => optionField.value)
      .filter((value) => value !== undefined && value !== null && String(value).trim() !== "")
      .map((value) => String(value)) ?? [];

  return Array.from(new Set(options));
};

const getFieldOptionItems = (field: FormFieldDto, includeInactive = false): OptionItem[] => {
  if (Array.isArray((field as any).options)) {
    return (field as any).options
      .filter(
        (item: any) =>
          item &&
          typeof item.id === "string" &&
          item.id.length > 0 &&
          typeof item.text === "string" &&
          (includeInactive || item.isActive !== false),
      )
      .map((item: any) => ({
        id: item.id,
        text: item.text,
        isActive: item.isActive,
        controllingItemsIds: Array.isArray(item.controllingItemsIds)
          ? item.controllingItemsIds
          : [],
      }));
  }

  return [];
};

const getFieldOptions = (field: FormFieldDto): string[] =>
  getFieldOptionItems(field, false).map((item) => item.id);

const getFieldOptionLabelMap = (field: FormFieldDto): Record<string, string> =>
  Object.fromEntries(getFieldOptionItems(field, true).map((item) => [item.id, item.text]));

const getConnectedOptionLabelMap = (options: string[]): Record<string, string> =>
  Object.fromEntries(options.map((option) => [option, formatOptionLabel(option)]));

const getParentDependencies = (field: FormFieldDto): any[] => {
  const extra = getFieldExtra(field);
  return Array.isArray(extra.parentDependencies) ? extra.parentDependencies : [];
};

const getValidationMessage = (validation: FieldValidationError | null | undefined): string | null =>
  validation?.messages?.[0]?.message ?? null;

const getValidationDetail = (validation: FieldValidationError | null | undefined): string | null =>
  validation?.messages?.[0]?.detail ?? null;

const getLocationErrors = (
  validation: FieldValidationError | null | undefined,
): LocationValueError | null => {
  if (!validation) return null;

  return {
    x: validation.pathMessages?.x?.[0]?.message,
    y: validation.pathMessages?.y?.[0]?.message,
    general: validation.pathMessages?._root?.[0]?.message ?? validation.messages?.[0]?.message,
  };
};

const getLocationErrorDetails = (
  validation: FieldValidationError | null | undefined,
): FieldErrorDisplay | null => {
  if (!validation) return null;

  return {
    message: validation.pathMessages?._root?.[0]?.message ?? validation.messages?.[0]?.message,
    detail: validation.pathMessages?._root?.[0]?.detail ?? validation.messages?.[0]?.detail,
  };
};

const getLinkErrors = (
  validation: FieldValidationError | null | undefined,
): LinkValueError | null => {
  if (!validation) return null;

  return {
    link: validation.pathMessages?.link?.[0]?.message,
    linkTxt: validation.pathMessages?.linkTxt?.[0]?.message,
    general: validation.pathMessages?._root?.[0]?.message,
  };
};

const getLinkErrorDetails = (
  validation: FieldValidationError | null | undefined,
): FieldErrorDisplay | null => {
  if (!validation) return null;

  return {
    message:
      validation.pathMessages?.link?.[0]?.message ??
      validation.pathMessages?.linkTxt?.[0]?.message ??
      validation.pathMessages?._root?.[0]?.message ??
      validation.messages?.[0]?.message,
    detail:
      validation.pathMessages?.link?.[0]?.detail ??
      validation.pathMessages?.linkTxt?.[0]?.detail ??
      validation.pathMessages?._root?.[0]?.detail ??
      validation.messages?.[0]?.detail,
  };
};

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  formField,
  formFieldsByIdMap,
  formFieldsValuesMap,
  formFieldsValidMap,
  onChangeHandler,
  onBlurHandler,
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
  const validationDetail = getValidationDetail(validation);

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
          onBlurHandler={() => {
            onBlurHandler(fieldId);
          }}
          value={formFieldValue}
          validationMessage={validationMessage}
          validationDetail={validationDetail}
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
          onBlurHandler={() => {
            onBlurHandler(fieldId);
          }}
          value={formFieldValue}
          validationMessage={validationMessage}
          validationDetail={validationDetail}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case legacyFieldTypeIds.Options: {
      const mode = formFieldExtra.selectionMode ?? selectionMode.Single;
      const isMultiple = mode === selectionMode.Multiple;

      if (isMultiple) {
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

      const connectedToForm = isConnectedToForm(formField, formFields);

      let availableOptions: string[] = connectedToForm
        ? getConnectedFieldOptions(fieldId, fieldOptions)
        : getFieldOptions(formField);

      const parentFieldId = formFieldExtra.parentFieldId ?? formFieldExtra.linkedOptionsFieldId;
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
            parentField && (isConnectedToForm(parentField, formFields) || connectedToForm)
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
          } else if (parentField && parentDependencies.length > 0) {
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
          } else if (parentField) {
            const childOptionItems = getFieldOptionItems(formField, true);
            childOptionItems.forEach((childOption) => {
              const matchesParent = (childOption.controllingItemsIds ?? []).some((parentId) =>
                parentValues.includes(parentId),
              );
              if (matchesParent) {
                allowedOptions.add(childOption.id);
              }
            });
          }

          if (allowedOptions.size > 0) {
            if (formFieldExtra.connectionType !== connectionTypes.form) {
              availableOptions = getFieldOptions(formField).filter((option) =>
                allowedOptions.has(option),
              );
            }

            if (isMultiple) {
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
            formFieldValue = isMultiple ? [] : "";

            setTimeout(() => {
              onChangeHandler(formFieldValue, fieldId);
            }, 0);
          }
        } else {
          availableOptions = connectedToForm
            ? getConnectedFieldOptions(fieldId, fieldOptions)
            : getFieldOptions(formField);
        }
      }

      availableOptions = Array.from(new Set(availableOptions.filter((option) => !!option)));

      const inactiveOptionIds = formFieldExtra.inactiveOptionIds ?? [];
      availableOptions = availableOptions.filter((optionId) => !inactiveOptionIds.includes(optionId));

      const optionLabels = connectedToForm
        ? getConnectedOptionLabelMap(availableOptions)
        : getFieldOptionLabelMap(formField);

      const defaultValue = formFieldExtra.options?.defaultValue ?? formFieldExtra.defaultValue;
      const value = isMultiple
        ? Array.isArray(formFieldValue)
          ? formFieldValue
          : []
        : typeof formFieldValue === "string"
          ? formFieldValue
          : "";

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
          onBlurHandler={() => {
            onBlurHandler(fieldId);
          }}
          value={value}
          selectionMode={mode}
          options={availableOptions}
          optionLabels={optionLabels}
          validationMessage={validationMessage}
          validationDetail={validationDetail}
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
          errorDetail={getLinkErrorDetails(validation)}
          isDisabled={viewMode}
          onChangeHandler={(value: LinkValue) => {
            onChangeHandler(value, fieldId);
          }}
          onBlurHandler={() => {
            onBlurHandler(fieldId);
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
          onBlurHandler={() => {
            onBlurHandler(fieldId);
          }}
          value={formFieldValue}
          dateType={formFieldExtra.dateType}
          defaultValue={formFieldExtra.defaultValue}
          validationMessage={validationMessage}
          validationDetail={validationDetail}
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
          onBlurHandler={() => {
            onBlurHandler(fieldId);
          }}
          value={formFieldValue}
          timePrecision={formFieldExtra.timePrecision}
          defaultValue={formFieldExtra.defaultValue}
          validationMessage={validationMessage}
          validationDetail={validationDetail}
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
          errorDetail={getLocationErrorDetails(validation)}
          isDisabled={viewMode}
          locationFormat={formFieldExtra.locationFormat}
          onChangeHandler={(value: any) => {
            onChangeHandler(value, fieldId);
          }}
          onBlurHandler={() => {
            onBlurHandler(fieldId);
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
            onBlurHandler(fieldId);
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
          onBlurHandler={() => {
            onBlurHandler(fieldId);
          }}
          value={formFieldValue}
          validationMessage={validationMessage}
          validationDetail={validationDetail}
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
          onBlurHandler={() => {
            onBlurHandler(fieldId);
          }}
          defaultValue={formFieldValue ?? formFieldExtra.defaultValue ?? ""}
          numberType={formFieldExtra.numberType}
          min={formFieldExtra.min}
          max={formFieldExtra.max}
          validationMessage={validationMessage}
          validationDetail={validationDetail}
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
            onBlurHandler(fieldId);
          }}
          value={formFieldValue}
          validationMessage={validationMessage}
          validationDetail={validationDetail}
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
  const viewModeChanged = prevProps.viewMode !== nextProps.viewMode;
  const fieldChanged = prevField.id !== nextField.id;

  const fieldOptionsChanged =
    JSON.stringify(prevProps.fieldOptions) !== JSON.stringify(nextProps.fieldOptions);

  return (
    !valueChanged && !validChanged && !viewModeChanged && !fieldChanged && !fieldOptionsChanged
  );
};

export default React.memo(FormFieldRenderer, shouldSkipRerenderHOF);
