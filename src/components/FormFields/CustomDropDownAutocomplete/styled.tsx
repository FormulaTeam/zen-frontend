import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete from "@mui/material/Autocomplete";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";
import { SxProps, Theme } from "@mui/material/styles";

export const StyledFormHelperText = styled(FormHelperText)`
  color: ${({ theme }) => theme.palette.error.main};
  text-align: right;
  margin-top: 15px;
`;

export const StyledInputLabel = styled(InputLabel)`
  top: -14px;
  left: 5px;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.primary};
  transform: translate(0, 0) scale(1) !important;
`;

export const StyledAutocomplete = styled(Autocomplete)`
  .MuiAutocomplete-endAdornment {
    left: 0;
    right: auto;
  }
  .MuiAutocomplete-inputRoot {
    padding-right: 10px !important;
  }
`;

export const StyledTextField = styled(TextField)`
  .MuiInputAdornment-root {
    max-height: 1.5rem;
  }
  .MuiInput-root {
    min-height: 50px;
    font-size: 1.2rem;
    ::before: {
      border: none !important;
    }
  }
  .MuiAutocomplete-inputRoot {
    top: 16px;
    border: 1px solid;
    border-color: ${({ theme }) => theme.palette.input?.border + " !important"};
    border-radius: 8px;
    font-size: 1.2rem;
  }

  .MuiAutocomplete-tag {
    margin-top: 0px;
  }

  .MuiChip-deleteIcon {
    margin: 0px;
    padding-left: 5px;
  }

  .MuiInputBase-root {
    min-height: 50px;

    .Mui-error::before {
      border-color: ${({ theme }) => theme.palette.error.main};
    }
    :hover,
    :hover:not(.Mui-disabled, .Mui-error):before {
      border-radius: 8px;
      border-bottom: "1px solid " + ${({ theme }) => theme.palette.primary?.main + " !important"};
    }
    ::after {
      top: 0;
      border-radius: 8px;
      border-bottom: "1px solid " + ${({ theme }) => theme.palette.primary?.main + " !important"};
    }
  }
`;

export const getAutocompleteSx = (
  isTabularEdit: boolean,
  isMultiple: boolean,
  hasError: boolean,
): SxProps<Theme> => ({
  width: "100%",
  direction: "ltr",

  "& .MuiAutocomplete-option": {
    minHeight: isTabularEdit ? "36px" : "42px",
    borderRadius: "8px",
    paddingInline: "10px",
    paddingBlock: "7px",
    fontSize: isTabularEdit ? "0.95rem" : "1rem",
    justifyContent: "flex-start",
    direction: "rtl",
    textAlign: "right",

    '&[aria-selected="true"]': {
      fontWeight: 600,
      backgroundColor: "rgba(30, 136, 229, 0.08)",
    },

    "&.Mui-focused": {
      backgroundColor: "rgba(148, 163, 184, 0.12)",
    },
  },

  "& .MuiAutocomplete-inputRoot": {
    minHeight: isTabularEdit ? "40px" : "50px",
    borderRadius: isTabularEdit ? "8px" : "12px",
    backgroundColor: "background.paper",
    border: isTabularEdit ? "none" : "1px solid",
    borderColor: hasError ? "error.main" : "divider",
    px: isTabularEdit ? "8px" : "12px",
    py: isMultiple ? "6px" : "0",
    paddingLeft: isTabularEdit ? "10px !important" : "12px !important",
    paddingRight: isTabularEdit ? "58px !important" : "64px !important",
    display: "flex !important",
    alignItems: "center",
    flexWrap: isMultiple ? "wrap" : "nowrap",
    gap: isMultiple ? "4px" : 0,
    direction: "ltr",

    "&:before, &:after": {
      display: "none",
    },

    "&:hover": {
      borderColor: isTabularEdit
        ? "transparent"
        : hasError
          ? "error.main"
          : "text.secondary",
      backgroundColor: isTabularEdit ? "transparent" : "action.hover",
    },

    "&.Mui-focused": {
      borderColor: hasError ? "error.main" : "primary.main",
      boxShadow: isTabularEdit
        ? "none"
        : hasError
          ? "0 0 0 3px rgba(211, 47, 47, 0.12)"
          : "0 0 0 3px rgba(25, 118, 210, 0.14)",
      backgroundColor: "background.paper",
    },

    "&.Mui-disabled": {
      backgroundColor: isTabularEdit ? "transparent" : "action.disabledBackground",
      opacity: 0.75,
    },
  },

  "& .MuiAutocomplete-input": {
    minWidth: isMultiple ? "70px !important" : "0 !important",
    flexGrow: 1,
    textAlign: "left",
    direction: "ltr",
    fontSize: isTabularEdit ? "0.95rem" : "1rem",
    color: "text.primary",
    py: isTabularEdit ? "6px !important" : "10px !important",
    px: "0 !important",
  },

  "& .MuiAutocomplete-endAdornment": {
    right: isTabularEdit ? "8px" : "10px",
    left: "auto",
    top: "50%",
    transform: "translateY(-50%)",
    display: "flex",
    alignItems: "center",
    gap: "2px",
  },

  "& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator": {
    width: isTabularEdit ? "24px" : "28px",
    height: isTabularEdit ? "24px" : "28px",
    color: "text.secondary",
    p: 0,
    borderRadius: "8px",

    "&:hover": {
      backgroundColor: "rgba(30, 136, 229, 0.08)",
      color: "primary.main",
    },
  },

  "& .MuiAutocomplete-tag": {
    m: "2px",
    maxWidth: isTabularEdit ? "110px" : "160px",
  },

  ...(isTabularEdit && {
    "& .MuiAutocomplete-inputRoot": {
      minHeight: "40px !important",
      border: "none !important",
      boxShadow: "none !important",
      backgroundColor: "transparent !important",
    },

    "& .MuiInputBase-input": {
      textAlign: "left !important",
      direction: "ltr !important",
      padding: "6px 0 !important",
    },
  }),
});

export const getFormControlSx = (isTabularEdit: boolean): SxProps<Theme> => ({
  gap: isTabularEdit ? 0 : "6px",

  ...(isTabularEdit && {
    "& .MuiInputLabel-root": {
      display: "none",
    },

    "& .MuiFormHelperText-root": {
      display: "none",
    },
  }),
});

export const getHelperTextSx = (
  hasErrorText: boolean,
): SxProps<Theme> => ({
  minHeight: hasErrorText ? "18px" : 0,
  mt: "2px",
  mx: 0,
  fontSize: "0.82rem",
  lineHeight: 1.35,
  color: "error.main",
  textAlign: "right",
});

export const autocompleteListboxProps = {
  style: {
    maxHeight: 320,
    overflowY: "auto" as const,
    padding: 4,
    direction: "rtl" as const,
    textAlign: "right" as const,
  },
};

export const autocompletePaperSlotProps = {
  sx: {
    mt: "6px",
    borderRadius: "10px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.1)",
    border: "1px solid",
    borderColor: "rgba(148, 163, 184, 0.35)",
    overflow: "hidden",
  },
};

export const getAutocompleteChipSx = (isTabularEdit: boolean): SxProps<Theme> => ({
  maxWidth: isTabularEdit ? "110px" : "160px",
  height: isTabularEdit ? "26px" : "30px",
  borderRadius: "8px",
  fontSize: isTabularEdit ? "0.82rem" : "0.9rem",
  fontWeight: 500,
  backgroundColor: "rgba(30, 136, 229, 0.08)",
  border: "1px solid rgba(30, 136, 229, 0.18)",
  color: "text.primary",
  direction: "ltr",

  "& .MuiChip-label": {
    px: "8px",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  "& .MuiChip-deleteIcon": {
    mx: "2px",
    fontSize: "17px",
    color: "text.secondary",

    "&:hover": {
      color: "primary.main",
    },
  },
});