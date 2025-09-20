import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";

interface StyledTextFieldProps {
  isTabularEdit?: boolean;
  borderColor?: string;
  borderWeight?: string;
}

export const StyledTextField = styled(TextField)<StyledTextFieldProps>(
  ({ theme, isTabularEdit, borderColor, borderWeight }) => ({
    // Base styles for all modes
    "& .MuiInputAdornment-root": {
      maxHeight: "1.5rem",
      margin: "auto",
      display: "flex", // Keep adornments visible in tabular edit mode for better UX
    },

    // Tabular edit mode styles
    ...(isTabularEdit && {
      width: "100%",
      height: "100%",
      "& .MuiInputBase-root": {
        backgroundColor: "transparent",
        minHeight: "100%",
        width: "100%",
        height: "100%",
        border: "1px solid transparent",
        padding: "4px 8px",
        "::before": {
          border: "none",
          borderColor: "transparent",
          borderRadius: "0",
          top: 0,
        },
        "&.Mui-error::before, &.Mui-error::after": {
          borderColor: "transparent",
        },
        ":hover:not(.Mui-disabled):before": {
          borderRadius: "0",
          borderBottom: "none",
          border: "none",
        },
        "::after": {
          top: 0,
          borderRadius: "0",
          borderBottom: "none",
          border: "none",
        },
        "&:hover:not(.Mui-disabled):before": {
          borderBottom: "none",
          border: "none",
        },
        "&:after": {
          borderBottom: "none",
          border: "none",
        },
      },
      "& .MuiInput-underline": {
        "&:before": {
          borderBottom: "none",
        },
        "&:after": {
          borderBottom: "none",
        },
        "&:hover:not(.Mui-disabled):before": {
          borderBottom: "none",
        },
      },
      // Show helper text in tabular edit mode for validation errors
      "& .MuiFormHelperText-root": {
        position: "absolute",
        bottom: "-20px",
        left: "0",
        fontSize: "1.75rem !important",
        color: theme.palette.error.main,
        backgroundColor: theme.palette.background.paper,
        padding: "2px 4px",
        borderRadius: "4px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        zIndex: 1000,
        whiteSpace: "nowrap",
        // Only show when there's an error
        "&.Mui-error": {
          display: "block",
        },
        "&:not(.Mui-error)": {
          display: "none",
        },
      },
    }),

    // Regular mode styles
    ...(!isTabularEdit && {
      "& .MuiInputBase-root": {
        "::before": {
          border: "1px solid",
          borderColor: theme.palette.input?.border || borderColor,
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
          borderBottom: `${borderWeight} solid ${borderColor}`,
        },
        "&:after": {
          borderBottom: `${borderWeight} solid ${borderColor}`,
        },
      },
      "& .MuiFormHelperText-root": {
        display: "block",
      },
    }),
  })
);

export const StyledInputLabel = styled("div")<{ isTabularEdit?: boolean }>(
  ({ isTabularEdit }) => ({
    ...(isTabularEdit && {
      display: "none", // Hide labels in tabular edit mode
    }),
    ...(!isTabularEdit && {
      display: "block",
    }),
  })
);
