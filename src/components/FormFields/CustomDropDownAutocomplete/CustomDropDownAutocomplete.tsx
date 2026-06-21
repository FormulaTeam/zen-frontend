import { Chip, FormControl } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { texts } from "../../../utils/texts";
import FieldErrorText from "../FieldErrorText/FieldErrorText";
import {
  StyledFormHelperText,
  StyledInputLabel,
  StyledTextField,
  StyledAutocomplete,
  getAutocompleteSx,
  getFormControlSx,
  getHelperTextSx,
  autocompleteListboxProps,
  autocompletePaperSlotProps,
  getAutocompleteChipSx
} from "./styled";
import { selectionMode } from "formula-gear";
import { PaginatedAutocompleteListbox } from "@src/components/PaginatedAutocompleteListbox";

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
  noOptionsText = "אין אפשרויות",
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

  return (
    <FormControl
      fullWidth
      variant="standard"
      sx={getFormControlSx(isTabularEdit)}
    >
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
        ListboxComponent={PaginatedAutocompleteListbox}
        ListboxProps={{
          onLoadMore: onScrollToBottom,
          ...autocompleteListboxProps,
        } as any}
        slotProps={{
          paper: autocompletePaperSlotProps,
          clearIndicator: { title: "" },
          popupIndicator: { title: "" },
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
        sx={getAutocompleteSx(isTabularEdit, isMultiple, Boolean(validationMessage))}
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
                sx={getAutocompleteChipSx(isTabularEdit)}
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
        <StyledFormHelperText sx={getHelperTextSx(Boolean(validationMessage || validationDetail))}>
          <FieldErrorText message={validationMessage} detail={validationDetail} />
        </StyledFormHelperText>
      )}
    </FormControl>
  );
};

export default CustomDropDownAutocomplete;
