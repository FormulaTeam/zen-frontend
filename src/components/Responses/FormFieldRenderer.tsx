import React from "react";
import {
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
import { renderOptionsField } from "./OptionsFieldRenderer";

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
  let input: any = null;
  let uniqueId = formField?.uniqueId || formField?.uniqId;
  let field = formFieldsByIdMap.get(uniqueId);

  field.name = formField.name;
  let formFieldValue: any = formFieldsValuesMap.get(uniqueId);
  if (
    ![FieldTypeIds.date, FieldTypeIds.hour, FieldTypeIds.checkbox, FieldTypeIds.number].includes(
      field.typeId,
    ) &&
    !formFieldValue
  ) {
    formFieldValue = "";
  }
  let valid: any = formFieldsValidMap.get(uniqueId);

  switch (formField.typeId) {
    case FieldTypeIds.longText:
    case FieldTypeIds.smallText: //מס' שורות טקסט או שורה אחת
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
          multiline={formField.typeId === FieldTypeIds.longText}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.options: //אפשרויות
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

    case FieldTypeIds.hour: //שעה
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

    case FieldTypeIds.checkbox: //כן לא
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

    case FieldTypeIds.list: // list
      input = (
        <CustomMultiInputField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any[],isValid: boolean) => {
            onChangeHandler(value, uniqueId, isValid);
          }}
          value={formFieldValue}
          isTabularEdit={isTabularEdit}
        />
      );
      break;

    case FieldTypeIds.number: //מספר
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

    case FieldTypeIds.file: //קובץ
      input = (
        <CustomFileInputField
          key={index}
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any,isValid) => {
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