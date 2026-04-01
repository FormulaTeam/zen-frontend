import React, { useEffect, useState } from "react";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

interface CustomTextFieldProps {
  label: string;
  isRequired: boolean;
  isDisabled: boolean;
  onChangeHandler: (value: string) => void;
  validationMessage?: string | null;
  multiline?: boolean;
  value: any;
  isTabularEdit?: boolean;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  value,
  isDisabled,
  multiline = false,
  onChangeHandler,
  validationMessage,
  label,
  isRequired,
  isTabularEdit = false,
}) => {
  const [inputValue, setInputValue] = useState(value || "");

  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  return (
    <BaseFieldInput
      isTabularEdit={isTabularEdit}
      fullWidth={true}
      label={isTabularEdit ? "" : label}
      required={isRequired}
      value={inputValue}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        setInputValue(event.target.value);
        onChangeHandler(event.target.value);
      }}
      multiline={multiline && !isTabularEdit}
      error={Boolean(validationMessage)}
      helperText={validationMessage || " "}
      size={isTabularEdit ? "medium" : undefined}
      disabled={isDisabled}
      sx={{
        textarea: {
          resize: isDisabled ? "none" : multiline ? "vertical" : "none",
          minHeight: "32px",
        },
        "& .MuiInputBase-root textarea": {
          resize: isDisabled ? "none" : multiline ? "vertical" : "none",
        },
        ...(isTabularEdit && {
          "& .MuiInputBase-root": {
            fontSize: "1rem",
            minHeight: "40px",
            display: "flex",
            alignItems: "center",
            "&::before": {
              border: "none !important",
            },
            "&::after": {
              border: "none !important",
            },
            "&:hover:not(.Mui-disabled)::before": {
              border: "none !important",
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

export default CustomTextField;
