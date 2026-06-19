import { Chip, FormControl } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { texts } from "../../../utils/texts";
import FieldErrorText from "../FieldErrorText/FieldErrorText";
import {
  StyledFormHelperText,
  StyledInputLabel,
  StyledListbox,
  StyledTextField,
  StyledAutocomplete,
} from "./styled";
import { selectionMode } from "formula-gear";

interface CustomDropDownAutocompleteProps {
  value: string | string[];
  selectionMode?: "single" | "multiple";
  options: string[];
  optionLabels?: Record<string, string>;
  defaultValue?: string | string[];
  isTabularEdit?: boolean;
  label: string;
  isRequired: boolean;
  isDisabled: boolean;
  onChangeHandler: (value: string | string[]) => void;
  onBlurHandler?: () => void;
  validationMessage?: string | null;
  validationDetail?: string | null;
  onInputChange?: (event: React.SyntheticEvent, value: string, reason: string) => void;
  onScrollToBottom?: () => void;
  loading?: boolean;
  inputValue?: string;
  filterOptions?: (options: unknown[], state: any) => unknown[];
  noOptionsText?: string;
}

const normalizeToArray = (value: string | string[] | null | undefined): string[] => {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  if (typeof value === "string") return value ? [value] : [];
  return [];
};

const CustomDropDownAutocomplete: React.FC<CustomDropDownAutocompleteProps> = ({
  value,
  isDisabled,
  selectionMode: mode = "single",
  options,
  optionLabels = {},
  onChangeHandler,
  onBlurHandler,
  label,
  isRequired,
  isTabularEdit = false,
  validationMessage,
  validationDetail,
  onInputChange,
  onScrollToBottom,
  loading,
  inputValue,
  filterOptions,
  noOptionsText,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(normalizeToArray(value));
  const hasTriggeredBlurRef = useRef(false);

  useEffect(() => {
    setSelectedValues(normalizeToArray(value));
  }, [value]);

  const isMultiple = mode === selectionMode.Multiple;

  const emitChange = (nextValues: string[]) => {
    const normalized = nextValues.map((val) => (val === texts.heb.emptyValue ? "" : val));

    setSelectedValues(normalized);

    if (isMultiple) {
      onChangeHandler(normalized);
      return;
    }

    onChangeHandler(normalized[0] ?? "");
  };

  const onSelectHandler = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string | string[] | null,
  ) => {
    const normalized = newValue == null ? [""] : Array.isArray(newValue) ? newValue : [newValue];
    emitChange(normalized);
  };

  const onDeleteHandler = (index: number) => {
    const newSelected = [...selectedValues];
    newSelected.splice(index, 1);
    emitChange(newSelected);
  };

  const displayedValue = selectedValues.map((val) => (val === "" ? texts.heb.emptyValue : val));
  const autocompleteValue = isMultiple ? displayedValue : (displayedValue[0] ?? null);

  const getLabel = (option: string) => {
    if (option === "") return texts.heb.emptyValue;
    return optionLabels[option] ?? option;
  };

  const triggerBlurValidation = () => {
    if (!hasTriggeredBlurRef.current) {
      hasTriggeredBlurRef.current = true;
      onBlurHandler?.();
    }
  };

  const handleListboxScroll = (event: React.UIEvent<HTMLUListElement>) => {
    const listboxNode = event.currentTarget;

    if (
      onScrollToBottom &&
      listboxNode.scrollTop + listboxNode.clientHeight >= listboxNode.scrollHeight - 10
    ) {
      onScrollToBottom();
    }
  };

  return (
    <FormControl
      fullWidth
      variant="standard"
      sx={{
        gap: "6px",

        ...(isTabularEdit && {
          gap: 0,

          "& .MuiInputLabel-root": {
            display: "none",
          },

          "& .MuiFormHelperText-root": {
            display: "none",
          },
        }),
      }}>
      {!isTabularEdit && (
        <StyledInputLabel
          shrink
          error={Boolean(validationMessage)}
          required={isRequired}
          id={`select-helper-label-${label}`}>
          {label}
        </StyledInputLabel>
      )}

      <StyledAutocomplete
        slotProps={{
          listbox: {
            component: StyledListbox,
            onScroll: handleListboxScroll,
            sx: {
              p: "4px",
              direction: "ltr",
              textAlign: "left",

              "& .MuiAutocomplete-option": {
                minHeight: isTabularEdit ? "36px" : "42px",
                borderRadius: "8px",
                px: "10px",
                py: "7px",
                fontSize: isTabularEdit ? "0.95rem" : "1rem",
                justifyContent: "flex-start",
                direction: "ltr",
                textAlign: "left",

                '&[aria-selected="true"]': {
                  fontWeight: 600,
                  backgroundColor: "rgba(30, 136, 229, 0.08)",
                },

                "&.Mui-focused": {
                  backgroundColor: "rgba(148, 163, 184, 0.12)",
                },
              },
            },
          },
          paper: {
            sx: {
              mt: "6px",
              borderRadius: "10px",
              boxShadow: "0 10px 28px rgba(15, 23, 42, 0.1)",
              border: "1px solid",
              borderColor: "rgba(148, 163, 184, 0.35)",
              overflow: "hidden",
            },
          },
          clearIndicator: {
            title: "",
          },
          popupIndicator: {
            title: "",
          },
        }}
        disabled={isDisabled}
        multiple={isMultiple}
        options={options}
        noOptionsText={noOptionsText}
        loading={loading}
        onInputChange={onInputChange}
        value={autocompleteValue}
        {...(inputValue !== undefined ? { inputValue } : {})}
        {...(filterOptions ? { filterOptions } : {})}
        onChange={(event: any, nextValue: any, _reason: string) => {
          hasTriggeredBlurRef.current = false;
          onSelectHandler(event, nextValue);
        }}
        onBlur={() => {
          triggerBlurValidation();
        }}
        onClose={() => {
          triggerBlurValidation();
        }}
        getOptionLabel={(option: any) => getLabel(String(option))}
        isOptionEqualToValue={(option, currentValue) => option === currentValue}
        size={isTabularEdit ? "small" : "medium"}
        sx={{
          width: "100%",
          direction: "ltr",

          "& .MuiAutocomplete-inputRoot": {
            minHeight: isTabularEdit ? "40px" : "50px",
            borderRadius: isTabularEdit ? "8px" : "12px",
            backgroundColor: "background.paper",
            border: isTabularEdit ? "none" : "1px solid",
            borderColor: validationMessage ? "error.main" : "divider",
            px: isTabularEdit ? "8px" : "12px",
            py: isMultiple ? "6px" : "0",
            paddingLeft: isTabularEdit ? "10px !important" : "12px !important",
            paddingRight: isTabularEdit ? "58px !important" : "64px !important",
            display: "flex !important",
            alignItems: "center",
            flexWrap: isMultiple ? "wrap" : "nowrap",
            gap: isMultiple ? "4px" : 0,
            direction: "ltr",
            transition:
              "border-color 160ms ease, box-shadow 160ms ease, background-color 160ms ease",

            "&:before, &:after": {
              display: "none",
            },

            "&:hover": {
              borderColor: isTabularEdit
                ? "transparent"
                : validationMessage
                  ? "error.main"
                  : "text.secondary",
              backgroundColor: isTabularEdit ? "transparent" : "action.hover",
            },

            "&.Mui-focused": {
              borderColor: validationMessage ? "error.main" : "primary.main",
              boxShadow: isTabularEdit
                ? "none"
                : validationMessage
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
        }}
        renderTags={(tagValue: any, getTagProps) =>
          tagValue.map((option: string, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });
            const labelText = option === texts.heb.emptyValue ? "" : getLabel(option);

            return (
              <Chip
                key={key}
                label={labelText}
                {...tagProps}
                onDelete={() => onDeleteHandler(index)}
                size={isTabularEdit ? "small" : "medium"}
                sx={{
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
                }}
              />
            );
          })
        }
        renderInput={(params) => (
          <StyledTextField
            {...params}
            required={isRequired}
            error={Boolean(validationMessage)}
            variant="standard"
            size={isTabularEdit ? "medium" : undefined}
            onBlur={() => {
              triggerBlurValidation();
            }}
            inputProps={{
              ...params.inputProps,
              value:
                inputValue !== undefined
                  ? String(params.inputProps.value)
                  : isMultiple || params.inputProps.value !== texts.heb.emptyValue
                    ? String(params.inputProps.value)
                    : "",
            }}
          />
        )}
      />

      {!isTabularEdit && (
        <StyledFormHelperText
          sx={{
            minHeight: validationMessage || validationDetail ? "18px" : 0,
            mt: "2px",
            mx: 0,
            fontSize: "0.82rem",
            lineHeight: 1.35,
            color: "error.main",
            textAlign: "right",
          }}>
          <FieldErrorText message={validationMessage} detail={validationDetail} />
        </StyledFormHelperText>
      )}
    </FormControl>
  );
};

export default CustomDropDownAutocomplete;
