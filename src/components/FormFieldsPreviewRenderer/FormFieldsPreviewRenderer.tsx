import { FieldTypeIds, LinkValue, LocationValueError } from "../../utils/interfaces";
import CustomDateTime from "../FormFields/CustomDateTime/CustomDateTime";
import CustomDropDownSelect from "../FormFields/CustomDropDownSelect/CustomDropDownSelect";
import CustomFileInputField from "../FormFields/CustomFileInputField/CustomFileInputField";
import CustomLatitudeLongitudeField from "../FormFields/CustomLatitudeLongitudeField/CustomLatitudeLongitudeField";
import CustomMultiInputField from "../FormFields/CustomMultiInputField/CustomMultiInputField";
import CustomNumberField from "../FormFields/CustomNumberField/CustomNumberField";
import CustomSwitch from "../FormFields/CustomSwitch/CustomSwitch";
import CustomTextField from "../FormFields/CustomTextField/CustomTextField";
import CustomTimePicker from "../FormFields/CustomTimePicker/CustomTimePicker";
import LinkTextField from "../FormFields/LinkTextField/LinkTextField";

function FormFieldsPreviewRenderer({ formField }) {
  let formFieldValue = null;
  const viewMode = true;
  const valid = true;

  switch (formField.typeId) {
    case FieldTypeIds.longText: //מס' שורות טקסט
      return (
        <CustomTextField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {}}
          value={formFieldValue}
          validationRegex={formField.validationRegex}
          multiline
        />
      );

    case FieldTypeIds.shortText: //שורה אחת
      console.log(formField);

      return (
        <CustomTextField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {}}
          value={formFieldValue}
          validationRegex={formField.validationRegex}
        />
      );

    case FieldTypeIds.options: //אפשרויות
      // Filter options for child fields based on parent selection
      let availableOptions: any = [];

      return (
        <CustomDropDownSelect
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(values: string[] | string, valid: boolean | null) => {}}
          value={formFieldValue || (formField.multiSelect ? [] : "")}
          multiple={formField.multiSelect}
          options={availableOptions}
        />
      );

    case FieldTypeIds.link: //היפר-קישור
      return (
        <LinkTextField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={{ link: valid, linkTxt: valid }}
          isDisabled={viewMode}
          onChangeHandler={(
            value: LinkValue,
            valid: { link: boolean; linkTxt: boolean } | null,
          ) => {}}
          value={formFieldValue || null}
        />
      );

    case FieldTypeIds.date: //תאריך
      return (
        <CustomDateTime
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {}}
          value={formFieldValue}
          dateAndTime={formField?.dateAndTime}
          defaultValue={formField?.initialValType}
        />
      );

    case FieldTypeIds.time: //שעה
      return (
        <CustomTimePicker
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean | null) => {}}
          value={formFieldValue}
          showSeconds={formField?.showSeconds}
          defaultValue={formField?.initialValType}
        />
      );

    case FieldTypeIds.location: //מיקום
      return (
        <CustomLatitudeLongitudeField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={{ x: valid, y: valid }}
          isDisabled={viewMode}
          coordinateType={formField.coordinateType}
          onChangeHandler={(value: any, valid: LocationValueError | null) => {}}
          value={{ x: "", y: "" }}
        />
      );

    case FieldTypeIds.checkbox: //
      // generate input from type checkbox that if the initial value is empty, it will be nonChceked and if true or "כן" it will be checked
      return (
        <CustomSwitch
          label={formField.displayName}
          isDisabled={viewMode}
          onChangeHandler={(value: boolean) => {}}
          value={true}
          defaultValue={formField?.initialValType}
        />
      );

    case FieldTypeIds.list: //
      return (
        <CustomMultiInputField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any[]) => {}}
          value={formFieldValue}
        />
      );

    case FieldTypeIds.number:
      return (
        <CustomNumberField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any, valid: boolean) => {}}
          value={formFieldValue ?? formField?.initialNumberValue ?? ""}
          numberType={formField?.numberType}
          minValue={formField?.minValue}
          maxValue={formField?.maxValue}
        />
      );

    case FieldTypeIds.file:
      return (
        <CustomFileInputField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(value: any) => {}}
          value={formFieldValue}
        />
      );

    default:
      return <></>;
  }
}
export default FormFieldsPreviewRenderer;
