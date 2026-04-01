import { FieldTypeIds, LinkValue } from "../../utils/interfaces";
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

  switch (formField.typeId) {
    case FieldTypeIds.longText:
      return (
        <CustomTextField
          label={formField.displayName}
          isRequired={formField.required}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={formFieldValue}
          multiline
          validationMessage={null}
        />
      );

    case FieldTypeIds.shortText:
      return (
        <CustomTextField
          label={formField.displayName}
          isRequired={formField.required}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={formFieldValue}
          validationMessage={null}
        />
      );

    case FieldTypeIds.options: {
      const availableOptions: any[] = [];

      return (
        <CustomDropDownSelect
          label={formField.displayName}
          isRequired={formField.required}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={formFieldValue || (formField.multiSelect ? [] : "")}
          multiple={formField.multiSelect}
          options={availableOptions}
          validationMessage={null}
        />
      );
    }

    case FieldTypeIds.link:
      return (
        <LinkTextField
          label={formField.displayName}
          isRequired={formField.required}
          errors={null}
          isDisabled={viewMode}
          onChangeHandler={(_value: LinkValue) => {}}
          value={formFieldValue || null}
        />
      );

    case FieldTypeIds.date:
      return (
        <CustomDateTime
          label={formField.displayName}
          isRequired={formField.required}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={formFieldValue}
          dateAndTime={formField?.dateAndTime}
          defaultValue={formField?.initialValType}
          validationMessage={null}
        />
      );

    case FieldTypeIds.time:
      return (
        <CustomTimePicker
          label={formField.displayName}
          isRequired={formField.required}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={formFieldValue}
          showSeconds={formField?.showSeconds}
          defaultValue={formField?.initialValType}
          validationMessage={null}
        />
      );

    case FieldTypeIds.location:
      return (
        <CustomLatitudeLongitudeField
          label={formField.displayName}
          isRequired={formField.required}
          errors={null}
          isDisabled={viewMode}
          coordinateType={formField.coordinateType}
          onChangeHandler={() => {}}
          value={{ x: "", y: "" }}
        />
      );

    case FieldTypeIds.checkbox:
      return (
        <CustomSwitch
          label={formField.displayName}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={true}
          defaultValue={formField?.initialValType}
        />
      );

    case FieldTypeIds.list:
      return (
        <CustomMultiInputField
          label={formField.displayName}
          isRequired={formField.required}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={formFieldValue}
          validationMessage={null}
        />
      );

    case FieldTypeIds.number:
      return (
        <CustomNumberField
          label={formField.displayName}
          isRequired={formField.required}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={formFieldValue ?? formField?.initialNumberValue ?? ""}
          numberType={formField?.numberType}
          minValue={formField?.minValue}
          maxValue={formField?.maxValue}
          validationMessage={null}
        />
      );

    case FieldTypeIds.file:
      return (
        <CustomFileInputField
          label={formField.displayName}
          isRequired={formField.required}
          isDisabled={viewMode}
          onChangeHandler={() => {}}
          value={formFieldValue}
          validationMessage={null}
        />
      );

    default:
      return <></>;
  }
}

export default FormFieldsPreviewRenderer;
