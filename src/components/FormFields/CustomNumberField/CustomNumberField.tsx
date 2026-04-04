import React, { useEffect, useState } from "react";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

interface CustomNumberFieldProps {
  label: string;
  isRequired: boolean;
  isDisabled: boolean;
  onChangeHandler: (value: string) => void;
  validationMessage?: string | null;
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
  validationMessage,
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
      helperText={validationMessage || " "}
      required={isRequired}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        onChangeHandler(event.target.value);
      }}
      size={isTabularEdit ? "medium" : undefined}
      dir="ltr"
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
