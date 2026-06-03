import React, { useEffect, useMemo, useState } from "react";
import { Autocomplete, Box, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

interface OptionsCellEditorProps {
  value: string | string[];
  onChange: (value: string | string[], isValid: boolean) => void;
  options: string[];
  optionLabels?: Record<string, string>;
  selectionMode?: "single" | "multiple";
  isRequired?: boolean;
  errorMessage?: string;
}

const normalizeValue = (value: string | string[], selectionMode: string): string | string[] => {
  const isMultiSelect = selectionMode === "multiple";
  if (isMultiSelect) {
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
        py: "8px",
        fontSize: "1rem",
        lineHeight: 1.35,
        direction: "rtl",
        textAlign: "right",
        whiteSpace: "normal",
        overflowWrap: "anywhere",

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
  isMultiSelect,
  hasSelectedValue,
}: {
  hasError: boolean;
  isMultiSelect: boolean;
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
    display: "flex",
    flexDirection: "row-reverse",

    ...(isMultiSelect
      ? {
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "6px",
          maxHeight: "160px",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "8px 10px !important",
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
          alignItems: hasSelectedValue ? "flex-start" : "center",
          flexWrap: "nowrap",
          maxHeight: "132px",
          overflowY: hasSelectedValue ? "auto" : "hidden",
          overflowX: "hidden",
          padding: hasSelectedValue ? "8px 10px !important" : "0 10px !important",
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

    ...(hasSelectedValue
      ? {
          width: "0 !important",
          minWidth: "0 !important",
          flexGrow: "0 !important",
          padding: "0 !important",
        }
      : {
          minWidth: "120px !important",
          flexGrow: 1,
          padding: isMultiSelect ? "0 !important" : "7px 0 !important",
        }),
  },
});

const iconButtonSx = {
  width: 28,
  height: 28,
  color: "#64748b",
  borderRadius: "8px",
  padding: 0,

  "&:hover": {
    backgroundColor: "#eef4ff",
    color: "#334155",
  },

  "& .MuiSvgIcon-root": {
    fontSize: 18,
  },
};

const selectedTextSx = {
  width: "100%",
  minWidth: 0,
  direction: "rtl",
  textAlign: "right",
  fontSize: "1rem",
  lineHeight: 1.35,
  color: "#0f172a",
  whiteSpace: "normal",
  overflowWrap: "anywhere",
  userSelect: "none",
  pointerEvents: "none",
};

const selectedTagSx = {
  width: "100%",
  maxWidth: "100%",
  minHeight: 32,
  borderRadius: "8px",
  backgroundColor: "#eef4ff",
  border: "1px solid #d4e3ff",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: "6px",
  px: "8px",
  py: "4px",
  boxSizing: "border-box",
  direction: "rtl",
};

export const OptionsCellEditor: React.FC<OptionsCellEditorProps> = ({
  value,
  onChange,
  options,
  optionLabels = {},
  selectionMode = "single",
  isRequired = false,
  errorMessage,
}) => {
  const isMultiSelect = selectionMode === "multiple";
  const [localValue, setLocalValue] = useState<string | string[]>(() =>
    normalizeValue(value, selectionMode),
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalValue(normalizeValue(value, selectionMode));
  }, [value, selectionMode]);

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
          whiteSpace: "normal",
        }}>
        <span
          style={{
            display: "block",
            width: "100%",
            direction: "rtl",
            textAlign: "right",
            whiteSpace: "normal",
            overflowWrap: "anywhere",
          }}>
          {getOptionLabel(option)}
        </span>
      </li>
    );
  };

  const emitChange = (nextValue: string | string[]) => {
    setLocalValue(nextValue);

    const isEmpty = isMultiSelect
      ? Array.isArray(nextValue) && nextValue.length === 0
      : !nextValue || nextValue === "";

    onChange(nextValue, !(isRequired && isEmpty));
  };

  const clearValue = () => {
    emitChange(isMultiSelect ? [] : "");
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

  const selectedValues = isMultiSelect
    ? Array.isArray(localValue)
      ? localValue
      : localValue
        ? [localValue]
        : []
    : [];

  const singleValue = !isMultiSelect
    ? typeof localValue === "string"
      ? localValue
      : localValue[0] || null
    : null;

  const hasSelectedValue = isMultiSelect ? selectedValues.length > 0 : Boolean(singleValue);

  const renderSelectedSingleValue = () => {
    if (!singleValue) {
      return null;
    }

    const label = getOptionLabel(singleValue);

    return (
      <Box title={label} sx={selectedTextSx}>
        {label}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "flex-start",
        gap: "4px",
        direction: "ltr",
        padding: "6px 8px",
        boxSizing: "border-box",
      }}>
      <Box
        sx={{
          width: 30,
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: hasSelectedValue ? "flex-start" : "center",
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
        {isMultiSelect ? (
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
                const { key, onDelete, ...tagProps } = getTagProps({ index });
                const label = getOptionLabel(option);

                return (
                  <Box key={key} {...tagProps} component="span" title={label} sx={selectedTagSx}>
                    <Box
                      component="span"
                      sx={{
                        minWidth: 0,
                        fontSize: "0.95rem",
                        lineHeight: 1.35,
                        color: "#0f172a",
                        whiteSpace: "normal",
                        overflowWrap: "anywhere",
                      }}>
                      {label}
                    </Box>

                    <IconButton
                      size="small"
                      onMouseDown={handleIconMouseDown}
                      onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                        onDelete(event);
                      }}
                      sx={{
                        width: 22,
                        height: 22,
                        color: "#64748b",
                        padding: 0,

                        "& .MuiSvgIcon-root": {
                          fontSize: 16,
                        },

                        "&:hover": {
                          backgroundColor: "#dceaff",
                          color: "#334155",
                        },
                      }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Box>
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
                  isMultiSelect: true,
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
                  startAdornment: hasSelectedValue
                    ? renderSelectedSingleValue()
                    : params.InputProps.startAdornment,
                  disableUnderline: true,
                  endAdornment: null,
                }}
                sx={getTextFieldSx({
                  hasError: !!errorMessage,
                  isMultiSelect: false,
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
