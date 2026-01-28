import { FieldTypeIds, LinkValue, LocationValidity } from "../../utils/interfaces";
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

type Props = {
  formField: any;
  formId?: number;
};

function FormFieldsPreviewRenderer({ formField, formId = 0 }: Props) {
  const formFieldValue = null;
  const viewMode = true;
  const valid = true;

  switch (formField.typeId) {
    case FieldTypeIds.longText:
      return (
        <CustomTextField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(_value: any, _valid: boolean | null) => {}}
          value={formFieldValue}
          multiline
        />
      );

    case FieldTypeIds.smallText:
      return (
        <CustomTextField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(_value: any, _valid: boolean | null) => {}}
          value={formFieldValue}
        />
      );

    case FieldTypeIds.options: {
      const availableOptions: any[] = [];
      return (
        <CustomDropDownSelect
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(_values: string[] | string, _valid: boolean | null) => {}}
          value={formFieldValue || (formField.multiSelect ? [] : "")}
          multiple={formField.multiSelect}
          options={availableOptions}
        />
      );
    }

    case FieldTypeIds.link:
      return (
        <LinkTextField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={{ link: valid, linkTxt: valid }}
          isDisabled={viewMode}
          onChangeHandler={(
            _value: LinkValue,
            _valid: { link: boolean; linkTxt: boolean } | null,
          ) => {}}
          value={formFieldValue || null}
        />
      );

    case FieldTypeIds.date:
      return (
        <CustomDateTime
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(_value: any, _valid: boolean | null) => {}}
          value={formFieldValue}
          dateAndTime={formField?.dateAndTime}
          defaultValue={formField?.initialValType}
        />
      );

    case FieldTypeIds.hour:
      return (
        <CustomTimePicker
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(_value: any, _valid: boolean | null) => {}}
          value={formFieldValue}
          showSeconds={formField?.showSeconds}
          defaultValue={formField?.initialValType}
        />
      );

    case FieldTypeIds.location:
      return (
        <CustomLatitudeLongitudeField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={{ x: valid, y: valid }}
          isDisabled={viewMode}
          coordinateType={formField.coordinateType}
          onChangeHandler={(_value: any, _valid: LocationValidity | null) => {}}
          value={{ x: "", y: "" }}
        />
      );

    case FieldTypeIds.checkbox:
      return (
        <CustomSwitch
          label={formField.displayName}
          isDisabled={viewMode}
          onChangeHandler={(_value: boolean) => {}}
          value={true}
          defaultValue={formField?.initialValType}
        />
      );

    case FieldTypeIds.list:
      return (
        <CustomMultiInputField
          label={formField.displayName}
          isRequired={formField.required}
          isValid={valid}
          isDisabled={viewMode}
          onChangeHandler={(_value: any[]) => {}}
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
          onChangeHandler={(_value: any, _valid: boolean) => {}}
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
          onChangeHandler={(_value: any) => {}}
          value={formFieldValue}
          formId={formId}
        />
      );

    default:
      return <></>;
  }
}

export default FormFieldsPreviewRenderer;
