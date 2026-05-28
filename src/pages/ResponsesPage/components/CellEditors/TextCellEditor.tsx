import React, { useEffect, useState } from "react";
import { TextField, styled } from "@mui/material";

const QUICK_EDIT_FONT_SIZE = "1.05rem";
const QUICK_EDIT_LINE_HEIGHT = 1.45;

const StyledTextField = styled(TextField)(({ theme }) => ({
  width: "100%",
  height: "100%",

  "& .MuiInputBase-root": {
    width: "100%",
    minHeight: "38px",
    borderRadius: "8px",
    border: "1px solid #d7deea",
    backgroundColor: "#ffffff",
    fontSize: QUICK_EDIT_FONT_SIZE,
    lineHeight: QUICK_EDIT_LINE_HEIGHT,
    padding: "4px 10px",
    alignItems: "flex-start",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

    "&:hover": {
      borderColor: "#b8c4d6",
      backgroundColor: "#fbfcfe",
    },

    "&.Mui-focused": {
      borderColor: "#7c9cc9",
      boxShadow: "0 0 0 2px rgba(124, 156, 201, 0.14)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    fontSize: QUICK_EDIT_FONT_SIZE,
    lineHeight: QUICK_EDIT_LINE_HEIGHT,
    padding: "4px 0 !important",
  },

  "& textarea": {
    resize: "none",
    overflow: "auto !important",

    "&::-webkit-scrollbar": {
      width: "5px",
    },

    "&::-webkit-scrollbar-track": {
      backgroundColor: theme.palette.background.default,
    },

    "&::-webkit-scrollbar-thumb": {
      backgroundColor: theme.scrollBar.color,
      borderRadius: theme.scrollBar.borderRadius,
    },
  },
}));

interface TextCellEditorProps {
  value: string;
  onChange: (value: string, isValid: boolean) => void;
  multiline?: boolean;
  validationRegex?: string;
  isRequired?: boolean;
  errorMessage?: string;
}

export const TextCellEditor: React.FC<TextCellEditorProps> = ({
  value,
  onChange,
  multiline = false,
  validationRegex,
  isRequired = false,
  errorMessage,
}) => {
  const [localValue, setLocalValue] = useState(value || "");

  useEffect(() => {
    setLocalValue(value || "");
  }, [value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    setLocalValue(newValue);

    let isValid = true;

    if (isRequired && !newValue.trim()) {
      isValid = false;
    } else if (newValue && validationRegex) {
      const reg = new RegExp(validationRegex);
      isValid = reg.test(newValue);
    }

    onChange(newValue, isValid);
  };

  return (
    <StyledTextField
      fullWidth
      multiline={multiline}
      minRows={1}
      maxRows={multiline ? 5 : 1}
      value={localValue}
      onChange={handleChange}
      error={!!errorMessage}
      variant="standard"
      autoFocus
      slotProps={{
        input: {
          disableUnderline: true,
        },
      }}
    />
  );
};
