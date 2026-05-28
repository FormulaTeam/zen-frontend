import React, { useEffect, useState } from "react";
import { TextField, styled } from "@mui/material";
import { preventEnterKeyNavigation } from "@utils/utils";

const StyledNumberTextField = styled(TextField)({
  width: "100%",
  "& .MuiInputBase-root": {
    minHeight: "34px",
    borderRadius: "8px",
    border: "1px solid #d7deea",
    backgroundColor: "#fff",
    fontSize: "0.9rem",
    padding: "0 8px",
    "&::before, &::after": {
      display: "none",
    },
  },
  "& .MuiInputBase-input": {
    padding: "6px 0 !important",
  },
});

interface NumberCellEditorProps {
  value: number | string;
  onChange: (value: number | string, isValid: boolean) => void;
  numberType?: string;
  minValue?: number;
  maxValue?: number;
  isRequired?: boolean;
  errorMessage?: string;
}

export const NumberCellEditor: React.FC<NumberCellEditorProps> = ({
  value,
  onChange,
  numberType = "integer",
  minValue,
  maxValue,
  isRequired = false,
  errorMessage: externalErrorMessage,
}) => {
  const [inputValue, setInputValue] = useState<string>(String(value ?? ""));
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    setInputValue(String(value ?? ""));
  }, [value]);

  const integerRegex = /^-?\d+$/;
  const floatRegex = /^-?\d+(\.\d+)?$/;

  const validate = (
    val: string,
  ): { isValid: boolean; errorMsg: string; parsed: number | string } => {
    if (val === "") {
      if (isRequired) {
        return { isValid: false, errorMsg: "נדרש להזין מספר", parsed: "" };
      }
      return { isValid: true, errorMsg: "", parsed: "" };
    }
    let isValidFormat = false;
    if (numberType === "integer") {
      isValidFormat = integerRegex.test(val);
    } else {
      isValidFormat = floatRegex.test(val);
    }
    if (!isValidFormat) {
      return {
        isValid: false,
        errorMsg: numberType === "integer" ? "חובה להזין מספר שלם" : "חובה להזין מספר עשרוני",
        parsed: val,
      };
    }
    const parsed = numberType === "integer" ? parseInt(val, 10) : parseFloat(val);
    if (minValue !== undefined && parsed < minValue) {
      return {
        isValid: false,
        errorMsg: `המספר חייב להיות גדול מ- ${minValue}`,
        parsed,
      };
    }
    if (maxValue !== undefined && parsed > maxValue) {
      return {
        isValid: false,
        errorMsg: `המספר חייב להיות קטן מ- ${maxValue}`,
        parsed,
      };
    }
    return { isValid: true, errorMsg: "", parsed };
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value;
    setInputValue(val);
    const { isValid, errorMsg, parsed } = validate(val);
    setErrorMessage(errorMsg);
    const finalValid = isValid && !(isRequired && val === "");
    onChange(parsed, finalValid);
  };

  return (
    <StyledNumberTextField
      fullWidth
      type="number"
      value={inputValue}
      onChange={handleChange}
      onKeyDown={(e) => preventEnterKeyNavigation(e)}
      error={!!externalErrorMessage || !!errorMessage}
      helperText={undefined}
      variant="standard"
      autoFocus
      inputProps={{
        step: numberType === "integer" ? 1 : "any",
      }}
    />
  );
};
