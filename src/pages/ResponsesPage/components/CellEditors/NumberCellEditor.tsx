import React, { useEffect, useState } from "react";
import { Box, TextField } from "@mui/material";
import { preventEnterKeyNavigation } from "@utils/utils";

import { numberType } from "formula-gear";

interface NumberCellEditorProps {
  value: number | string;
  onChange: (value: number | string, isValid: boolean) => void;
  numberType?: string;
  minValue?: number;
  maxValue?: number;
  isRequired?: boolean;
  errorMessage?: string;
}

const getInputSx = ({ hasError }: { hasError: boolean }) => ({
  "& .MuiInputBase-root": {
    minHeight: 40,
    borderRadius: "10px",
    border: "1px solid",
    borderColor: hasError ? "#d32f2f" : "#d7deea",
    backgroundColor: "#ffffff",
    padding: "0 10px",
    fontSize: "1rem",
    color: "#0f172a",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

    "&:hover": {
      borderColor: hasError ? "#d32f2f" : "#b8c4d6",
      backgroundColor: "#fbfcfe",
    },

    "&.Mui-focused": {
      borderColor: hasError ? "#d32f2f" : "#7c9cc9",
      boxShadow: hasError
        ? "0 0 0 3px rgba(211, 47, 47, 0.14)"
        : "0 0 0 3px rgba(124, 156, 201, 0.16)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    padding: "7px 0 !important",
    fontSize: "1rem",
    lineHeight: 1.3,
    fontWeight: 400,
    direction: "ltr",
    textAlign: "left",
    color: "#0f172a",
  },

  "& input[type=number]::-webkit-inner-spin-button, & input[type=number]::-webkit-outer-spin-button":
    {
      opacity: 1,
    },
});

export const NumberCellEditor: React.FC<NumberCellEditorProps> = ({
  value,
  onChange,
  numberType: type = numberType.Integer,
  minValue,
  maxValue,
  isRequired = false,
  errorMessage: externalErrorMessage,
}) => {
  const [inputValue, setInputValue] = useState(String(value ?? ""));
  const [localErrorMessage, setLocalErrorMessage] = useState("");

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
        return {
          isValid: false,
          errorMsg: "נדרש להזין מספר",
          parsed: "",
        };
      }

      return {
        isValid: true,
        errorMsg: "",
        parsed: "",
      };
    }

    const isValidFormat = type === numberType.Integer ? integerRegex.test(val) : floatRegex.test(val);

    if (!isValidFormat) {
      return {
        isValid: false,
        errorMsg: type === numberType.Integer ? "חובה להזין מספר שלם" : "חובה להזין מספר עשרוני",
        parsed: val,
      };
    }

    const parsed = type === numberType.Integer ? parseInt(val, 10) : parseFloat(val);

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

    return {
      isValid: true,
      errorMsg: "",
      parsed,
    };
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;

    setInputValue(nextValue);

    const { isValid, errorMsg, parsed } = validate(nextValue);

    setLocalErrorMessage(errorMsg);
    onChange(parsed, isValid && !(isRequired && nextValue === ""));
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (event) => {
    preventEnterKeyNavigation(event);
  };

  const hasError = !!externalErrorMessage || !!localErrorMessage;

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "6px 8px",
        boxSizing: "border-box",
        direction: "ltr",
      }}>
      <TextField
        fullWidth
        type="number"
        value={inputValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        error={hasError}
        helperText={undefined}
        variant="standard"
        autoFocus
        slotProps={{
          input: {
            disableUnderline: true,
          },
          htmlInput: {
            step: type === numberType.Integer ? 1 : "any",
            min: minValue,
            max: maxValue,
          },
        }}
        sx={getInputSx({ hasError })}
      />
    </Box>
  );
};
