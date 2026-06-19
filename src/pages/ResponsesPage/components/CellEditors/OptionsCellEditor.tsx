import React, { useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { Autocomplete, Box, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { selectionMode } from "formula-gear";

import { useLoadMoreOnVisible } from "../../hooks/useLoadMoreOnVisible";

interface OptionsCellEditorProps {
  value: string | string[];
  onChange: (value: string | string[], isValid: boolean) => void;
  options: string[];
  optionLabels?: Record<string, string>;
  selectionMode?: "single" | "multiple";
  isRequired?: boolean;
  errorMessage?: string;
  loading?: boolean;
  onScrollToBottom?: () => void;
}

const OPTIONS_DROPDOWN_MIN_WIDTH = 190;

const normalizeValue = (value: string | string[], mode: string): string | string[] => {
  const isMultiSelect = mode === selectionMode.Multiple;

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

const Listbox = React.forwardRef<
  HTMLUListElement,
  React.HTMLAttributes<HTMLUListElement> & { onLoadMore?: () => void }
>(function Listbox({ children, onLoadMore, ...props }, ref) {
  const listRef = useRef<HTMLUListElement>(null);
  const sentinelRef = useRef<HTMLLIElement>(null);

  useImperativeHandle(ref, () => listRef.current as HTMLUListElement);
  useLoadMoreOnVisible(listRef, sentinelRef, onLoadMore);

  return (
    <ul ref={listRef} {...props}>
      {children}
      <li
        aria-hidden
        ref={sentinelRef}
        style={{ height: 1, padding: 0, margin: 0, listStyle: "none" }}
      />
    </ul>
  );
});

const basePopperSlotProps = {
  clearIndicator: {
    title: "",
  },
  popupIndicator: {
    title: "",
  },
  popper: {
    sx: {
      minWidth: OPTIONS_DROPDOWN_MIN_WIDTH,
      maxWidth: "calc(100vw - 32px)",

      "& .MuiAutocomplete-paper": {
        mt: "4px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 8px 20px rgba(15, 23, 42, 0.1)",
        overflow: "hidden",
      },

      "& .MuiAutocomplete-listbox": {
        p: "4px",
        direction: "rtl",
        textAlign: "right",
      },

      "& .MuiAutocomplete-option": {
        minHeight: "34px",
        borderRadius: "7px",
        mx: 0,
        my: "1px",
        px: "9px",
        py: "6px",
        fontSize: "0.95rem",
        lineHeight: 1.35,
        direction: "rtl",
        textAlign: "right",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",

        "&[aria-selected='true']": {
          backgroundColor: "#eef4ff",
          fontWeight: 600,
        },

        "&.Mui-focused": {
          backgroundColor: "#f8fafc",
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
    minHeight: "36px",
    borderRadius: "8px",
    border: "1px solid",
    borderColor: hasError ? "#d32f2f" : "#d8dee9",
    backgroundColor: "#fff",
    fontSize: "0.95rem",
    direction: "rtl",
    boxShadow: "none",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
    display: "flex",
    flexDirection: "row-reverse",

    ...(isMultiSelect
      ? {
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "5px",
          maxHeight: "140px",
          overflowY: "auto",
          overflowX: "hidden",
          padding: "6px 8px !important",
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
          maxHeight: "120px",
          overflowY: hasSelectedValue ? "auto" : "hidden",
          overflowX: "hidden",
          padding: hasSelectedValue ? "6px 8px !important" : "0 8px !important",
        }),

    "&:hover": {
      borderColor: hasError ? "#d32f2f" : "#cbd5e1",
      backgroundColor: "#fff",
    },

    "&.Mui-focused": {
      borderColor: hasError ? "#d32f2f" : "#7c9cc9",
      boxShadow: hasError
        ? "0 0 0 2px rgba(211, 47, 47, 0.12)"
        : "0 0 0 2px rgba(124, 156, 201, 0.14)",
    },

    "&::before, &::after": {
      display: "none",
    },
  },

  "& .MuiAutocomplete-endAdornment": {
    display: "none",
  },

  "& .MuiAutocomplete-input": {
    fontSize: "0.95rem",
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
          minWidth: "0 !important",
          flexGrow: 1,
          padding: isMultiSelect ? "0 !important" : "6px 0 !important",
        }),
  },
});

const iconButtonSx = {
  width: 24,
  height: 24,
  color: "#64748b",
  borderRadius: "6px",
  padding: 0,

  "&:hover": {
    backgroundColor: "#f1f5f9",
    color: "#334155",
  },

  "& .MuiSvgIcon-root": {
    fontSize: 17,
  },
};

const selectedTextSx = {
  width: "100%",
  minWidth: 0,
  direction: "rtl",
  textAlign: "right",
  fontSize: "0.95rem",
  lineHeight: 1.35,
  color: "#0f172a",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  userSelect: "none",
  pointerEvents: "none",
};

const selectedTagSx = {
  width: "100%",
  maxWidth: "100%",
  minHeight: 28,
  borderRadius: "7px",
  backgroundColor: "#f1f5ff",
  border: "1px solid #dbe7ff",
  display: "grid",
  gridTemplateColumns: "1fr auto",
  alignItems: "center",
  gap: "5px",
  px: "7px",
  py: "3px",
  boxSizing: "border-box",
  direction: "rtl",
};

export const OptionsCellEditor: React.FC<OptionsCellEditorProps> = ({
  value,
  onChange,
  options,
  optionLabels = {},
  selectionMode: mode = "single",
  isRequired = false,
  errorMessage,
  loading = false,
  onScrollToBottom,
}) => {
  const isMultiSelect = mode === selectionMode.Multiple;
  const [localValue, setLocalValue] = useState<string | string[]>(() =>
    normalizeValue(value, mode),
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLocalValue(normalizeValue(value, mode));
  }, [value, mode]);

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
          whiteSpace: "nowrap",
          overflow: "hidden",
        }}>
        <span
          style={{
            display: "block",
            width: "100%",
            direction: "rtl",
            textAlign: "right",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
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
        padding: "4px 6px",
        boxSizing: "border-box",
        position: "relative",
        zIndex: 5,
      }}>
      <Box
        sx={{
          width: 26,
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
            slotProps={basePopperSlotProps}
            ListboxComponent={Listbox}
            ListboxProps={{ onLoadMore: onScrollToBottom } as any}
            loading={loading}
            loadingText="טוען אפשרויות..."
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
                        fontSize: "0.9rem",
                        lineHeight: 1.35,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
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
                        width: 20,
                        height: 20,
                        color: "#64748b",
                        padding: 0,

                        "& .MuiSvgIcon-root": {
                          fontSize: 15,
                        },

                        "&:hover": {
                          backgroundColor: "#e2e8f0",
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
            slotProps={basePopperSlotProps}
            ListboxComponent={Listbox}
            ListboxProps={{ onLoadMore: onScrollToBottom } as any}
            loading={loading}
            loadingText="טוען אפשרויות..."
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
