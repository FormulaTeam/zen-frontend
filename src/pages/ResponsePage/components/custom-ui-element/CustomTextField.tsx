import { TextField, useTheme } from "@mui/material";
import React from "react";
import { GenericFieldsProps } from "../../interfaces/GenericFieldsProps";

interface CustomTextFieldProps extends GenericFieldsProps {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  endAdornment?: React.ReactNode;
  multiline?: boolean;
}
const CustomTextField = React.forwardRef<HTMLDivElement, CustomTextFieldProps>(
  (
    {
      label,
      required,
      type = "text",
      value,
      onChange,
      error,
      helperText,
      onBlur,
      disabled = false,
      inputProps,
      onKeyDown,
      endAdornment,
      multiline = false,
    },
    ref,
  ) => {
    const theme = useTheme();
    const borderColor = disabled ? theme.palette.input?.border : theme.palette.primary.main;
    const borderWeight = disabled ? "1px" : "2px";
    return (
      <TextField
        ref={ref}
        label={label}
        required={required}
        type={type}
        value={value}
        onChange={(e) => onChange(e)}
        error={error}
        helperText={helperText}
        onBlur={onBlur}
        inputProps={inputProps}
        InputProps={{
          endAdornment: endAdornment || undefined,
        }}
        multiline={multiline}
        onKeyDown={onKeyDown}
        slotProps={{
          inputLabel: {
            shrink: true,
            sx: {
              position: "absolute",
              height: "24px",
              top: 0,
              padding: "0 8px",
              right: 0,
              left: "unset",
              transformOrigin: "top right",
              display: "block",
            },
          },
          formHelperText: {
            sx: {
              position: "absolute",
              bottom: "-16px",
              height: "16px",
              left: 0,
            },
          },
        }}
        variant="standard"
        sx={{
          width: "100%",
          // ...props.sx,
          textarea: {
            resize: multiline ? "vertical" : "none",
            // resize: disabled ? "none" : multiline ? "vertical" : "none", // Allow resize when multiline
            minHeight: "32px",
          },
          ...(type === "file" && {
            "& input[type='file']": {
              minHeight: "26px",
              color: "transparent", // מסתיר את "No file chosen" ושמות הקבצים
              fontSize: 0, // מעלים את הטקסט
            },
            "& input[type='file']::file-selector-button": {
              visibility: "hidden",
            },
          }),
          "& .MuiInputBase-root textarea": {
            resize: multiline ? "vertical" : "none",
            // resize: disabled ? "none" : multiline ? "vertical" : "none", // Allow resize when multiline
          },
          "& .MuiInputAdornment-root": {
            maxHeight: "1.5rem",
            margin: "auto",
            display: "flex",
          },
          "& .MuiInputBase-root": {
            "::before": {
              border: "1px solid",
              borderColor: theme.palette.input?.border,
              borderRadius: "8px",
              top: 0,
            },
            "&.Mui-error::before, &.Mui-error::after": {
              borderColor: theme.palette.error.main,
            },
            ":hover:not(.Mui-disabled):before": {
              borderRadius: "8px",
              borderBottom: `1px solid ${borderColor}`,
            },
            "::after": {
              top: 0,
              borderRadius: "8px",
              borderBottom: `1px solid ${borderColor}`,
            },
            padding: "0.5rem 1rem",
            "&:hover:not(.Mui-disabled):before": {
              borderBottom: `${borderWeight} solid ${borderColor} `,
            },
            "&:after": {
              borderBottom: `${borderWeight} solid ${borderColor} `,
            },
          },
        }}
      />
    );
  },
);

export default React.memo(CustomTextField);
