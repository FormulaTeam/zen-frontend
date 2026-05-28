import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, Box, TextField } from "@mui/material";

interface OptionsCellEditorProps {
  value: string | string[];
  onChange: (value: string | string[], isValid: boolean) => void;
  options: string[];
  optionLabels?: Record<string, string>;
  multiSelect?: boolean;
  isRequired?: boolean;
  errorMessage?: string;
}

const normalizeValue = (value: string | string[], multiSelect: boolean): string | string[] => {
  if (multiSelect) {
    if (Array.isArray(value)) {
      return value.filter((item) => typeof item === "string");
    }

    return value ? [value] : [];
  }

  if (Array.isArray(value)) {
    return value[0] || "";
  }

  return value || "";
};

const editorSx = {
  "& .MuiInputBase-root": {
    minHeight: "34px",
    borderRadius: "8px",
    border: "1px solid #d7deea",
    backgroundColor: "#fff",
    padding: "2px 10px",
    fontSize: "0.9rem",
    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

    "&:hover": {
      borderColor: "#b8c4d6",
      backgroundColor: "#fbfcfe",
    },

    "&.Mui-focused": {
      borderColor: "#7c9cc9",
      boxShadow: "0 0 0 3px rgba(124, 156, 201, 0.16)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiInputBase-input": {
    padding: "6px 0 !important",
  },
};

const autocompleteSx = {
  "& .MuiAutocomplete-inputRoot": {
    paddingRight: "36px !important",
  },

  "& .MuiAutocomplete-tag": {
    height: 22,
    borderRadius: "8px",
    fontSize: "0.78rem",
    fontWeight: 500,
    backgroundColor: "#eef4ff",
    border: "1px solid #d4e3ff",

    "& .MuiChip-deleteIcon": {
      fontSize: "16px",
    },
  },
};

const slotProps = {
  clearIndicator: {
    title: "",
  },
  popupIndicator: {
    title: "",
  },
  popper: {
    sx: {
      "& .MuiAutocomplete-paper": {
        mt: "6px",
        borderRadius: "12px",
        border: "1px solid #d7deea",
        boxShadow: "0 12px 32px rgba(15, 23, 42, 0.12)",
        overflow: "hidden",
      },

      "& .MuiAutocomplete-listbox": {
        p: "6px",
      },

      "& .MuiAutocomplete-option": {
        minHeight: "38px",
        borderRadius: "8px",
        mx: 0,
        my: "2px",
        fontSize: "0.95rem",

        "&[aria-selected='true']": {
          backgroundColor: "#eaf2ff",
          fontWeight: 600,
        },

        "&.Mui-focused": {
          backgroundColor: "#f3f7fd",
        },
      },
    },
  },
} as const;

export const OptionsCellEditor: React.FC<OptionsCellEditorProps> = ({
  value,
  onChange,
  options,
  optionLabels = {},
  multiSelect = false,
  isRequired = false,
  errorMessage,
}) => {
  const [localValue, setLocalValue] = useState<string | string[]>(() =>
    normalizeValue(value, multiSelect),
  );

  useEffect(() => {
    setLocalValue(normalizeValue(value, multiSelect));
  }, [value, multiSelect]);

  const normalizedOptions = useMemo(
    () => options.filter((option): option is string => typeof option === "string"),
    [options],
  );

  const getOptionLabel = (option: string): string => optionLabels[option] ?? option;

  const emitChange = (nextValue: string | string[]) => {
    setLocalValue(nextValue);

    const isEmpty = multiSelect
      ? Array.isArray(nextValue) && nextValue.length === 0
      : !nextValue || nextValue === "";

    onChange(nextValue, !(isRequired && isEmpty));
  };

  if (multiSelect) {
    const multiValue = Array.isArray(localValue) ? localValue : localValue ? [localValue] : [];

    return (
      <Box sx={{ width: "100%" }}>
        <Autocomplete<string, true, false, false>
          fullWidth
          multiple
          value={multiValue}
          onChange={(_event, newValue) => {
            emitChange(newValue);
          }}
          options={normalizedOptions}
          getOptionLabel={getOptionLabel}
          isOptionEqualToValue={(option, currentValue) => option === currentValue}
          disableCloseOnSelect
          autoHighlight
          openOnFocus
          slotProps={slotProps}
          sx={autocompleteSx}
          renderInput={(params) => (
            <TextField
              {...params}
              variant="standard"
              autoFocus
              error={!!errorMessage}
              helperText={undefined}
              placeholder="בחר אפשרויות"
              slotProps={{
                input: {
                  ...params.InputProps,
                  disableUnderline: true,
                },
              }}
              sx={editorSx}
            />
          )}
        />
      </Box>
    );
  }

  const singleValue = typeof localValue === "string" ? localValue : localValue[0] || null;

  return (
    <Box sx={{ width: "100%" }}>
      <Autocomplete<string, false, false, false>
        fullWidth
        value={singleValue || null}
        onChange={(_event, newValue) => {
          emitChange(newValue ?? "");
        }}
        options={normalizedOptions}
        getOptionLabel={getOptionLabel}
        isOptionEqualToValue={(option, currentValue) => option === currentValue}
        autoHighlight
        openOnFocus
        slotProps={slotProps}
        sx={autocompleteSx}
        renderInput={(params) => (
          <TextField
            {...params}
            variant="standard"
            autoFocus
            error={!!errorMessage}
            helperText={undefined}
            placeholder="בחר אפשרות"
            slotProps={{
              input: {
                ...params.InputProps,
                disableUnderline: true,
              },
            }}
            sx={editorSx}
          />
        )}
      />
    </Box>
  );
};
