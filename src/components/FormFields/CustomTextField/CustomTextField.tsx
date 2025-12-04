import React, { useEffect, useState } from "react";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

interface CustomTextFieldProps extends CustomInputFormFieldProps {
  multiline?: boolean;
  value: any;
  isTabularEdit?: boolean;
}

const CustomTextField: React.FC<CustomTextFieldProps> = ({
  value,
  isDisabled,
  multiline = false,
  onChangeHandler,
  isValid,
  label,
  isRequired,
  validationRegex,
  isTabularEdit = false,
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [helperText, setHelperText] = useState("");

  const onChangeInputHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
    isRequired?: boolean,
    validationRegex?: string,
  ) => {
    if (isRequired && !event.target.value) {
      setHelperText("שדה זה הינו חובה");
    } else if (!!event.target.value && !!validationRegex) {
      const reg = new RegExp(validationRegex);
      const isValid = reg.test(event.target.value);
      if (!isValid) {
        setHelperText("הפורמט אינו תקין");
      } else {
        setHelperText("");
      }
    } else {
      setHelperText("");
    }
    setInputValue(event.target.value);
    onChangeHandler(event.target.value, isValid);
  };

  useEffect(() => {    
    if (isRequired && !isValid) {
      setHelperText("שדה זה הינו חובה");
    }
  }, [isValid]);

  return (
    <BaseFieldInput
      isTabularEdit={isTabularEdit}
      fullWidth={true}
      label={isTabularEdit ? "" : label}
      required={isRequired}
      value={inputValue}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
        onChangeInputHandler(e, isRequired, validationRegex);
      }}
      multiline={multiline && !isTabularEdit}
      error={!isValid&&!!helperText}
      helperText={helperText || " "}
      size={isTabularEdit ? "medium" : undefined}
      slotProps={{
        htmlInput: {
          pattern: validationRegex,
        },
      }}
      disabled={isDisabled}
      sx={{
        textarea: {
          resize: isDisabled ? "none" : multiline ? "vertical" : "none", // Allow resize when multiline
          minHeight: "32px",
        },
        "& .MuiInputBase-root textarea": {
          resize: isDisabled ? "none" : multiline ? "vertical" : "none", // Allow resize when multiline
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
