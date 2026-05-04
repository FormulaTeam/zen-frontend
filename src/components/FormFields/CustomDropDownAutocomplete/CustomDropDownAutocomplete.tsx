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

interface CustomDropDownAutocompleteProps {
  value: string | string[];
  multipleOptions?: boolean;
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
}

const normalizeToArray = (value: string | string[] | null | undefined): string[] => {
  if (Array.isArray(value)) return value.filter((item) => typeof item === "string");
  if (typeof value === "string") return value ? [value] : [];
  return [];
};

const CustomDropDownAutocomplete: React.FC<CustomDropDownAutocompleteProps> = ({
  value,
  isDisabled,
  multipleOptions = false,
  options,
  optionLabels = {},
  onChangeHandler,
  onBlurHandler,
  label,
  isRequired,
  isTabularEdit = false,
  validationMessage,
  validationDetail,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(normalizeToArray(value));
  const hasTriggeredBlurRef = useRef(false);

  useEffect(() => {
    setSelectedValues(normalizeToArray(value));
  }, [value]);

  const emitChange = (nextValues: string[]) => {
    const normalized = nextValues.map((val) => (val === texts.heb.emptyValue ? "" : val));

    setSelectedValues(normalized);

    if (multipleOptions) {
      onChangeHandler(normalized);
    } else {
      onChangeHandler(normalized[0] ?? "");
    }
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
  const autocompleteValue = multipleOptions ? displayedValue : (displayedValue[0] ?? null);

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

  return (
    <FormControl
      fullWidth
      variant="standard"
      sx={{
        direction: "rtl",
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
            sx: {
              p: "6px",
              direction: "rtl",

              "& .MuiAutocomplete-option": {
                minHeight: "36px",
                borderRadius: "8px",
                px: "10px",
                py: "7px",
                fontSize: "0.95rem",
                justifyContent: "flex-start",

                '&[aria-selected="true"]': {
                  fontWeight: 600,
                },
              },
            },
          },
          paper: {
            sx: {
              mt: "6px",
              borderRadius: "12px",
              boxShadow: "0 10px 30px rgba(15, 23, 42, 0.14)",
              border: "1px solid",
              borderColor: "divider",
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
        multiple={multipleOptions}
        options={options}
        value={autocompleteValue}
        onChange={(event: any, nextValue: any) => {
          hasTriggeredBlurRef.current = false;
          onSelectHandler(event, nextValue);
        }}
        onClose={() => {
          triggerBlurValidation();
        }}
        getOptionLabel={(option: any) => getLabel(String(option))}
        isOptionEqualToValue={(option, currentValue) => option === currentValue}
        size={isTabularEdit ? "small" : "medium"}
        sx={{
          width: "100%",

          "& .MuiAutocomplete-inputRoot": {
            minHeight: isTabularEdit ? "40px" : "46px",
            borderRadius: isTabularEdit ? "0" : "12px",
            backgroundColor: isTabularEdit ? "transparent" : "background.paper",
            border: isTabularEdit ? "none" : "1px solid",
            borderColor: validationMessage ? "error.main" : "divider",
            px: isTabularEdit ? "6px" : "12px",
            py: multipleOptions ? "6px" : "0",
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
            textAlign: isTabularEdit ? "center" : "right",
            fontSize: isTabularEdit ? "1rem" : "0.98rem",
            color: "text.primary",
            py: "8px !important",
          },

          "& .MuiAutocomplete-endAdornment": {
            left: "8px",
            right: "auto",
          },

          "& .MuiAutocomplete-clearIndicator, & .MuiAutocomplete-popupIndicator": {
            color: "text.secondary",
            p: "4px",

            "&:hover": {
              backgroundColor: "action.hover",
            },
          },

          ...(isTabularEdit && {
            "& .MuiAutocomplete-inputRoot": {
              minHeight: "40px !important",
              border: "none !important",
              borderRadius: "0 !important",
              boxShadow: "none !important",
              backgroundColor: "transparent !important",
            },

            "& .MuiInputBase-input": {
              textAlign: "center",
              padding: "8px 12px !important",
            },
          }),
        }}
        renderTags={(tagValue: any, getTagProps) =>
          tagValue.map((option: string, index: number) => {
            const { key, ...tagProps } = getTagProps({ index });

            return (
              <Chip
                key={key}
                label={option === texts.heb.emptyValue ? "" : getLabel(option)}
                {...tagProps}
                onDelete={() => onDeleteHandler(index)}
                size={isTabularEdit ? "small" : "medium"}
                sx={{
                  borderRadius: "8px",
                  fontSize: isTabularEdit ? "0.82rem" : "0.9rem",
                  fontWeight: 500,
                  height: isTabularEdit ? "24px" : "28px",
                  backgroundColor: "action.selected",
                  maxWidth: "140px",

                  "& .MuiChip-label": {
                    px: "8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  },

                  "& .MuiChip-deleteIcon": {
                    mx: "2px",
                    fontSize: "18px",
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
                multipleOptions || params.inputProps.value !== texts.heb.emptyValue
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
