import InputAdornment from "@mui/material/InputAdornment";
import { useTheme } from "@mui/material/styles";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import * as React from "react";

type BaseFieldInputProps = TextFieldProps & {
  adornment?: React.ReactNode;
  isTabularEdit?: boolean;
};

// NOTE: Use forwardRef so that parent components (e.g. MUI pickers) can anchor poppers correctly.
// Without this the TimePicker popper may complain about invalid `anchorEl`.
const BaseFieldInput = React.forwardRef<HTMLDivElement, BaseFieldInputProps>(
  ({ adornment, fullWidth = false, disabled, isTabularEdit = false, slotProps, ...props }, ref) => {
    const theme = useTheme();
    const borderColor = disabled ? theme.palette.input?.border : theme.palette.primary.main;
    const borderWeight = disabled ? "1px" : "2px";

    return (
      <TextField
        {...props}
        ref={ref}
        disabled={disabled}
        fullWidth={fullWidth}
        slotProps={{
          ...(slotProps || {}),
          inputLabel: {
            shrink: true,
            sx: {
              left: '5px',
              display: isTabularEdit ? "none" : "block",
              top: '-14px',
              fontSize: '1.3rem',
              fontWeight: 600,
              color: theme.palette.text.primary,
              transform: 'translate(0, 0) scale(1)',
              '&.Mui-focused': {
                color: theme.palette.primary.main,
              }
            },
            ...(slotProps as any)?.inputLabel,
          },
          ...(adornment && {
            input: {
              endAdornment: <InputAdornment position="end">{adornment}</InputAdornment>,
              ...(slotProps as any)?.input,
            },
          }),
        }}
        variant="standard"
        sx={{
          ...props.sx,
          ...(isTabularEdit && {
            width: "100%",
            height: "100%",
            "& .MuiInputBase-root": {
              backgroundColor: "transparent",
              minHeight: "100%",
              width: "100%",
              height: "100%",
              border: "1px solid transparent",
              fontSize: '1.1rem',
              "&:hover": {
                border: "1px solid rgba(0, 0, 0, 0.23)",
              },
              "&.Mui-focused": {
                backgroundColor: "rgba(25, 118, 210, 0.04)",
              },
            },
            "& .MuiInput-underline": {
              "&:before": { borderBottom: "none" },
              "&:after": { borderBottom: "none" },
              "&:hover:not(.Mui-disabled):before": { borderBottom: "none" },
            },
          }),
          "& .MuiInputAdornment-root": {
            maxHeight: "1.5rem",
            margin: "auto",
            display: "flex",
          },
          "& .MuiInputBase-root": {
            fontSize: '1.2rem',
            "::before": {
              border: isTabularEdit ? "none" : "1px solid",
              borderColor: isTabularEdit ? "transparent" : theme.palette.input?.border,
              borderRadius: isTabularEdit ? "0" : "8px",
              top: 0,
            },
            "&.Mui-error::before, &.Mui-error::after": {
              borderColor: theme.palette.error.main,
              borderWidth: isTabularEdit ? "2px" : undefined,
            },
            ":hover:not(.Mui-disabled):before": {
              borderRadius: isTabularEdit ? "0" : "8px",
              borderBottom: isTabularEdit ? "none" : `1px solid ${borderColor}`,
              border: isTabularEdit ? "none" : undefined,
            },
            "::after": {
              top: 0,
              borderRadius: isTabularEdit ? "0" : "8px",
              borderBottom: isTabularEdit ? "none" : `1px solid ${borderColor}`,
              border: isTabularEdit ? "none" : undefined,
            },
            padding: isTabularEdit ? "4px 8px" : "0.75rem 1.25rem",
            "&:hover:not(.Mui-disabled):before": {
              borderBottom: isTabularEdit ? "none" : `${borderWeight} solid ${borderColor} `,
              border: isTabularEdit ? "none" : undefined,
            },
            "&:after": {
              borderBottom: isTabularEdit ? "none" : `${borderWeight} solid ${borderColor} `,
              border: isTabularEdit ? "none" : undefined,
            },
          },
        }}
      />
    );
  },
);

BaseFieldInput.displayName = "BaseFieldInput";

export default BaseFieldInput;
