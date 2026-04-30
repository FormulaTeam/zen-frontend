import React, { useEffect, useState } from "react";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";
import FieldErrorText from "../FieldErrorText/FieldErrorText";

interface CustomNumberFieldProps {
  label: string;
  isRequired: boolean;
  isDisabled: boolean;
  onChangeHandler: (value: string) => void;
  onBlurHandler?: () => void;
  validationMessage?: string | null;
  validationDetail?: string | null;
  defaultValue: any;
  numberFormat?: number;
  min?: number;
  max?: number;
  isTabularEdit?: boolean;
}

const CustomNumberField: React.FC<CustomNumberFieldProps> = ({
  defaultValue: value,
  isDisabled,
  onChangeHandler,
  onBlurHandler,
  validationMessage,
  validationDetail,
  label,
  isRequired,
  isTabularEdit = false,
}) => {
  const [inputValue, setInputValue] = useState(
    value !== undefined && value !== null ? String(value) : "",
  );

  useEffect(() => {
    setInputValue(value !== undefined && value !== null ? String(value) : "");
  }, [value]);

  return (
    <BaseFieldInput
      isTabularEdit={isTabularEdit}
      fullWidth={true}
      label={isTabularEdit ? "" : label}
      disabled={isDisabled}
      value={inputValue}
      error={Boolean(validationMessage)}
      helperText={<FieldErrorText message={validationMessage} detail={validationDetail} />}
      required={isRequired}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        onChangeHandler(event.target.value);
      }}
      onBlur={onBlurHandler}
      size={isTabularEdit ? "medium" : undefined}
      dir="rtl"
      sx={{
        ...(isTabularEdit && {
          "& .MuiInputBase-root": {
            fontSize: "1rem",
            minHeight: "40px",
            display: "flex",
            alignItems: "center",
            "&::before": {
              border: "none",
            },
            "&::after": {
              border: "none",
            },
            "&:hover:not(.Mui-disabled)::before": {
              border: "none",
            },
          },
          "& .MuiInputBase-input": {
            textAlign: "center",
            padding: "8px 12px",
          },
          "& .MuiFormLabel-root": {
            display: "none",
          },
          "& .MuiFormHelperText-root": {
            fontSize: "0.85rem",
            margin: "4px 0 0 0",
            lineHeight: "1.2",
            minHeight: "auto",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          },
        }),
      }}
    />
  );
};

export default CustomNumberField;
