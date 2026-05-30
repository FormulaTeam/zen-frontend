import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, Box, Chip, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

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
        direction: "rtl",
        textAlign: "right",
      },

      "& .MuiAutocomplete-option": {
        minHeight: "40px",
        borderRadius: "8px",
        mx: 0,
        my: "2px",
        px: "10px",
        fontSize: "1rem",
        direction: "rtl",
        textAlign: "right",

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

const getTextFieldSx = ({
  hasError,
  multiSelect,
  hasSelectedValue,
}: {
  hasError: boolean;
  multiSelect: boolean;
  hasSelectedValue: boolean;
}) => ({
  "& .MuiInputBase-root": {
    minHeight: "40px",
    borderRadius: "10px",
    border: "1px solid",
    borderColor: hasError ? "#d32f2f" : "#d7deea",
    backgroundColor: "#fff",
    fontSize: "1rem",
    direction: "rtl",
    boxShadow: "0 1px 2px rgba(16, 24, 40, 0.04)",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",

    // Force selected value/chips to start from the physical right side.
    display: "flex",
    flexDirection: "row-reverse",

    ...(multiSelect
      ? {
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "6px",
          maxHeight: "132px",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "8px 10px !important",
          scrollbarGutter: "stable",
          overscrollBehavior: "contain",

          scrollbarWidth: "thin",
          scrollbarColor: "#cbd5e1 transparent",

          "&::-webkit-scrollbar": {
            width: "8px",
          },

          "&::-webkit-scrollbar-track": {
            backgroundColor: "transparent",
          },

          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#cbd5e1",
            borderRadius: "999px",
            border: "2px solid #ffffff",
          },

          "&::-webkit-scrollbar-thumb:hover": {
            backgroundColor: "#94a3b8",
          },
        }
      : {
          alignItems: "center",
          flexWrap: "nowrap",
          padding: "0 10px !important",
        }),

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

  "& .MuiAutocomplete-endAdornment": {
    display: "none",
  },

  "& .MuiAutocomplete-input": {
    fontSize: "1rem",
    textAlign: "right",
    direction: "rtl",
    caretColor: "transparent",

    ...(multiSelect && hasSelectedValue
      ? {
          width: "0 !important",
          minWidth: "0 !important",
          flexGrow: "0 !important",
          padding: "0 !important",
        }
      : {
          minWidth: "120px !important",
          flexGrow: 1,
          padding: multiSelect ? "0 !important" : "7px 0 !important",
        }),
  },

  "& .MuiAutocomplete-tag": {
    margin: "2px",
  },
});

const iconButtonSx = {
  width: 28,
  height: 28,
  color: "#64748b",
  borderRadius: "8px",

  "&:hover": {
    backgroundColor: "#eef4ff",
    color: "#334155",
  },
};

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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalValue(normalizeValue(value, multiSelect));
  }, [value, multiSelect]);

  const normalizedOptions = useMemo(
    () => options.filter((option): option is string => typeof option === "string"),
    [options],
  );

  const getOptionLabel = (option: string): string => optionLabels[option] ?? option;

  const renderRtlOption = (
    props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
    option: string,
  ) => {
    const { key, style, ...optionProps } = props;

    return (
      <li
        key={key}
        {...optionProps}
        dir="rtl"
        style={{
          ...style,
          direction: "rtl",
          textAlign: "right",
          display: "flex",
          justifyContent: "flex-start",
          width: "100%",
        }}>
        <span
          style={{
            display: "block",
            width: "100%",
            direction: "rtl",
            textAlign: "right",
          }}>
          {getOptionLabel(option)}
        </span>
      </li>
    );
  };

  const emitChange = (nextValue: string | string[]) => {
    setLocalValue(nextValue);

    const isEmpty = multiSelect
      ? Array.isArray(nextValue) && nextValue.length === 0
      : !nextValue || nextValue === "";

    onChange(nextValue, !(isRequired && isEmpty));
  };

  const clearValue = () => {
    emitChange(multiSelect ? [] : "");
  };

  const handleIconMouseDown = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleClearClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    clearValue();
  };

  const handleToggleOpenClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen((prev) => !prev);
  };

  const selectedValues = multiSelect
    ? Array.isArray(localValue)
      ? localValue
      : localValue
        ? [localValue]
        : []
    : [];

  const singleValue = !multiSelect
    ? typeof localValue === "string"
      ? localValue
      : localValue[0] || null
    : null;

  const hasSelectedValue = multiSelect ? selectedValues.length > 0 : Boolean(singleValue);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: "4px",

        // Physical layout: buttons left, input right.
        // This prevents RTL from flipping the outer layout.
        direction: "ltr",
      }}>
      <Box
        sx={{
          width: hasSelectedValue ? 64 : 30,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "2px",
        }}>
        {hasSelectedValue && (
          <IconButton
            size="small"
            onMouseDown={handleIconMouseDown}
            onClick={handleClearClick}
            sx={iconButtonSx}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}

        <IconButton
          size="small"
          onMouseDown={handleIconMouseDown}
          onClick={handleToggleOpenClick}
          sx={iconButtonSx}>
          <ArrowDropDownIcon fontSize="small" />
        </IconButton>
      </Box>

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          direction: "rtl",
        }}>
        {multiSelect ? (
          <Autocomplete<string, true, false, false>
            fullWidth
            multiple
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={selectedValues}
            onChange={(_event, newValue) => {
              emitChange(newValue);
            }}
            options={normalizedOptions}
            getOptionLabel={getOptionLabel}
            renderOption={renderRtlOption}
            isOptionEqualToValue={(option, currentValue) => option === currentValue}
            disableCloseOnSelect
            autoHighlight
            openOnFocus
            slotProps={slotProps}
            sx={{ width: "100%" }}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index });

                return (
                  <Chip
                    key={key}
                    {...tagProps}
                    label={getOptionLabel(option)}
                    size="small"
                    sx={{
                      height: 28,
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      fontWeight: 500,
                      backgroundColor: "#eef4ff",
                      border: "1px solid #d4e3ff",
                      maxWidth: "150px",

                      "& .MuiChip-label": {
                        px: "8px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      },

                      "& .MuiChip-deleteIcon": {
                        fontSize: 17,
                        mx: "2px",
                      },
                    }}
                  />
                );
              })
            }
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                autoFocus
                error={!!errorMessage}
                helperText={undefined}
                placeholder={hasSelectedValue ? "" : "בחר אפשרויות"}
                inputProps={{
                  ...params.inputProps,
                  readOnly: true,
                  style: {
                    textAlign: "right",
                    direction: "rtl",
                    caretColor: "transparent",
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  endAdornment: null,
                }}
                sx={getTextFieldSx({
                  hasError: !!errorMessage,
                  multiSelect: true,
                  hasSelectedValue,
                })}
              />
            )}
          />
        ) : (
          <Autocomplete<string, false, false, false>
            fullWidth
            open={open}
            onOpen={() => setOpen(true)}
            onClose={() => setOpen(false)}
            value={singleValue || null}
            onChange={(_event, newValue) => {
              emitChange(newValue ?? "");
            }}
            options={normalizedOptions}
            getOptionLabel={getOptionLabel}
            renderOption={renderRtlOption}
            isOptionEqualToValue={(option, currentValue) => option === currentValue}
            autoHighlight
            openOnFocus
            slotProps={slotProps}
            sx={{ width: "100%" }}
            renderInput={(params) => (
              <TextField
                {...params}
                variant="standard"
                autoFocus
                error={!!errorMessage}
                helperText={undefined}
                placeholder="בחר אפשרות"
                inputProps={{
                  ...params.inputProps,
                  readOnly: true,
                  style: {
                    textAlign: "right",
                    direction: "rtl",
                    caretColor: "transparent",
                  },
                }}
                InputProps={{
                  ...params.InputProps,
                  disableUnderline: true,
                  endAdornment: null,
                }}
                sx={getTextFieldSx({
                  hasError: !!errorMessage,
                  multiSelect: false,
                  hasSelectedValue,
                })}
              />
            )}
          />
        )}
      </Box>
    </Box>
  );
};
