import { Chip, FormControl } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { texts } from "../../../utils/texts";
import { v4 as uuidv4 } from "uuid";
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
  defaultValue,
  isTabularEdit = false,
  validationMessage,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(normalizeToArray(value));
  const hasTriggeredBlurRef = useRef(false);
  const didApplyDefaultRef = useRef(false);

  useEffect(() => {
    if (
      !didApplyDefaultRef.current &&
      defaultValue !== undefined &&
      location.pathname.includes("create")
    ) {
      const initialValues = normalizeToArray(defaultValue);
      didApplyDefaultRef.current = true;
      setSelectedValues(initialValues);

      if (multipleOptions) {
        onChangeHandler(initialValues);
      } else {
        onChangeHandler(initialValues[0] ?? "");
      }
    }
    // intentionally not depending on onChangeHandler to avoid render loops
  }, [defaultValue, multipleOptions]);

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
      variant="standard"
      sx={{
        ...(isTabularEdit && {
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
          listbox: { component: StyledListbox },
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
        renderTags={(tagValue: any, getTagProps) =>
          tagValue.map((option: string, index: number) => (
            <Chip
              label={option === texts.heb.emptyValue ? "" : getLabel(option)}
              {...getTagProps({ index })}
              key={uuidv4()}
              onDelete={() => onDeleteHandler(index)}
              size={isTabularEdit ? "small" : "medium"}
            />
          ))
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
            sx={{
              ...(isTabularEdit && {
                "& .MuiInputBase-root": {
                  fontSize: "1rem",
                  minHeight: "40px !important",
                  border: "none !important",
                  borderRadius: "0 !important",
                  backgroundColor: "transparent !important",
                  display: "flex",
                  alignItems: "center",
                  "&:before": {
                    display: "none !important",
                    border: "none !important",
                  },
                  "&:after": {
                    display: "none !important",
                    border: "none !important",
                  },
                  "&:hover:not(.Mui-disabled):before": {
                    display: "none !important",
                    border: "none !important",
                  },
                },
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  padding: "8px 12px !important",
                },
                "& .MuiAutocomplete-inputRoot": {
                  border: "none !important",
                  borderRadius: "0 !important",
                  minHeight: "40px !important",
                },
                "& .MuiInput-underline": {
                  "&:before": {
                    display: "none !important",
                  },
                  "&:after": {
                    display: "none !important",
                  },
                  "&:hover:not(.Mui-disabled):before": {
                    display: "none !important",
                  },
                },
              }),
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

      <StyledFormHelperText>{validationMessage || " "}</StyledFormHelperText>
    </FormControl>
  );
};

export default CustomDropDownAutocomplete;
