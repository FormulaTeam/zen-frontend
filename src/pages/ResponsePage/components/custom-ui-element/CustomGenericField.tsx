import { FieldTypeIds, FormField } from "utils/interfaces";
import CustomTextField from "./CustomTextField";
import CustomLinkField from "./CustomLinkField";
import CustomToggleField from "./CustomToggleField";
import CustomLocationField from "./CustomLocationField";
import CustomFileInputField from "./CustomFileInputField";
import CustomDateTimeField from "./CustomDateTimeField";
import CustomCreatableSelectField from "./CustomCreatableSelectField";

interface CustomGenericFieldProps {
  field: FormField;
  value: any;
  onChange: (value: any) => void;
  error?: boolean;
  helperText?: string | false;
  errors?: any;
  //formik?: any;
  onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}
const CustomGenericField: React.FC<CustomGenericFieldProps> = ({
  field,
  value,
  onChange,
  error,
  helperText,
  onBlur,
  errors,
  //formik,
}) => {
  switch (field.typeId) {
    case FieldTypeIds.smallText:
    case FieldTypeIds.longText:
      return (
        <CustomTextField
          onBlur={onBlur}
          label={field.displayName}
          required={field.required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          error={error}
          helperText={helperText}
          multiline={field.typeId === FieldTypeIds.longText}
        />
      );
    case FieldTypeIds.number:
      return (
        <CustomTextField
          onBlur={onBlur}
          label={field.displayName}
          required={field.required}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          error={error}
          helperText={helperText}
        />
      );
    case FieldTypeIds.link:
      return (
        <CustomLinkField
          onBlur={onBlur}
          label={field.displayName}
          required={field.required}
          value={value}
          onChange={(value) => {
            onChange(value);
          }}
          linkError={!!errors[field.uniqueId]?.link}
          linkHelperText={errors[field.uniqueId]?.link}
          linkTxtError={!!errors[field.uniqueId]?.linkTxt}
          linkTxtHelperText={errors[field.uniqueId]?.linkTxt}
        />
      );
    case FieldTypeIds.date:
    case FieldTypeIds.hour:
      return (
        <CustomDateTimeField
          required={field.required}
          label={field.displayName}
          onBlur={onBlur}
          value={value}
          onChange={(value) => {
            onChange(value);
          }}
          showSeconds={field.showSeconds}
          error={!!errors[field.uniqueId]}
          helperText={errors[field.uniqueId]}
          dateAndTime={field.dateAndTime}
          type={field.typeId === FieldTypeIds.date ? "date" : "time"}
        />
      );
    case FieldTypeIds.checkbox:
      return (
        <CustomToggleField
          label={field.displayName}
          required={field.required}
          value={value}
          onChange={(value) => {
            onChange(value);
          }}
        />
      );
    case FieldTypeIds.location:
      return (
        <CustomLocationField
          onBlur={onBlur}
          label={field.displayName}
          required={field.required}
          value={value}
          onChange={(value) => {
            onChange(value);
          }}
          latitudeError={!!errors[field.uniqueId]?.latitude}
          latitudeHelperText={errors[field.uniqueId]?.latitude}
          longitudeError={!!errors[field.uniqueId]?.longitude}
          longitudeHelperText={errors[field.uniqueId]?.longitude}
        />
      );
    case FieldTypeIds.file:
      return (
        <CustomFileInputField
          label={field.displayName}
          onChange={(value) => {
            onChange(value);
          }}
          error={error}
          helperText={helperText}
          required={field.required}
          value={value}
        />
      );
    case FieldTypeIds.list:
      return (
        <CustomCreatableSelectField
          label={field.displayName}
          required={field.required}
          value={value}
          onChange={(value) => {
            onChange(value);
          }}
          error={!!(errors[field.uniqueId] as any)?.list}
          helperText={(errors[field.uniqueId] as any)?.list}
        />
      );
    // case FieldTypeIds.form:
    //   return <FormInsideForm />;
  }
  return <div></div>;
};

export default CustomGenericField;
