import React from "react";
import {
  FieldTypeIds,
  FormField,
  LinkValue,
  LocationValidity,
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
import { renderOptionsField } from "./OptionsFieldRenderer";

interface FormFieldRendererProps {
  formId: number;
  formField: any;
  formFieldsByIdMap: Map<string, any>;
  formFieldsValuesMap: Map<string, any>;
  formFieldsValidMap: Map<string, any>;
  touchedFields: Record<string, boolean>;
  onBlurField: (uniqueId: string, part?: "x" | "y" | "link" | "linkTxt") => void;
  onChangeHandler: (value: any, uniqueId: string, valid: any) => void;
  viewMode: boolean;
  fieldOptions: Record<string, ResponseFieldValue[]>;
  formFields: FormField[];
  index?: number;
  isTabularEdit?: boolean;
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({
  formId,
  formField,
  formFieldsByIdMap,
  formFieldsValuesMap,
  formFieldsValidMap,
  touchedFields,
  onBlurField,
  onChangeHandler,
  viewMode,
  fieldOptions,
  formFields,
  index = 0,
  isTabularEdit = false,
}) => {
  let input: any = null;
  const uniqueId = formField?.uniqueId || formField?.uniqId;
  const field = formFieldsByIdMap.get(uniqueId);

  field.name = formField.name;

  let formFieldValue: any = formFieldsValuesMap.get(uniqueId);

  // Do not coerce to "" for file/link/date/hour/checkbox/number.
  if (
    ![
      FieldTypeIds.date,
      FieldTypeIds.hour,
      FieldTypeIds.checkbox,
      FieldTypeIds.number,
      FieldTypeIds.file,
      FieldTypeIds.link,
    ].includes(field.typeId) &&
    (formFieldValue === undefined || formFieldValue === null)
  ) {
    formFieldValue = "";
  }

  // Ensure file value has { files: [] } shape
  if (
    field.typeId === FieldTypeIds.file &&
    (!formFieldValue || typeof formFieldValue !== "object")
  ) {
    formFieldValue = { files: [] };
  }

  // Ensure link value has { link:"", linkTxt:"" } shape
  if (
    field.typeId === FieldTypeIds.link &&
    (!formFieldValue || typeof formFieldValue !== "object")
  ) {
    formFieldValue = { link: "", linkTxt: "" };
  }

  const valid = formFieldsValidMap.get(uniqueId);
  const zodMsg =
    valid && typeof valid === "object" && "valid" in valid && (valid as any).valid === false
      ? (valid as any).message
      : "";

  const touched = !!touchedFields[String(uniqueId)];
  const onBlur = (part?: "x" | "y" | "link" | "linkTxt") => onBlurField(String(uniqueId), part);

  switch (formField.typeId) {
    case FieldTypeIds.longText:
    case FieldTypeIds.smallText:
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
          multiline={formField.typeId === FieldTypeIds.longText}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.options:
      input = renderOptionsField({
        formField,
        formFieldsByIdMap,
        formFieldsValuesMap,
        formFieldsValidMap,
        onChangeHandler,
        viewMode,
        fieldOptions,
        formFields,
        index,
        isTabularEdit,
      });
      break;

    case FieldTypeIds.link:
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
          onBlur={onBlur}
          touched={touched}
        />
      );
      break;

    case FieldTypeIds.date:
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

    case FieldTypeIds.hour:
      input = (
        <CustomTimePicker
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          errorMessage={zodMsg}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          touched={touched}
          onBlur={onBlur}
          value={formFieldValue}
          showSeconds={formField?.showSeconds}
          defaultValue={formField?.initialValType}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.location:
      input = (
        <CustomLatitudeLongitudeField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          coordinateType={formField.coordinateType}
          onChangeHandler={(value: any, valid: LocationValidity | null) => {
            onChangeHandler(value, uniqueId, valid);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
          touched={touched}
          onBlur={onBlur}
        />
      );
      break;

    case FieldTypeIds.checkbox:
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

    case FieldTypeIds.list:
      input = (
        <CustomMultiInputField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any[], isValid: boolean) => {
            onChangeHandler(value, uniqueId, isValid);
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
          value={formFieldValue}
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
          formId={formId}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, isValid) => {
            onChangeHandler(value, uniqueId, isValid);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
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

export default FormFieldRenderer;
