import { Autocomplete, Chip, FormControl } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import { texts } from "../../../utils/texts";
import { v4 as uuidv4 } from "uuid";
import {
  StyledFormHelperText,
  StyledInputLabel,
  StyledListbox,
  StyledTextField,
  StyledAutocomplete,
} from "./styled";

interface CustomDropDownAutocompleteProps extends CustomInputFormFieldProps {
  value: string | string[];
  multipleOptions?: boolean;
  options: string[];
  defaultValue?: string | string[];
  isTabularEdit?: boolean;
}

const CustomDropDownAutocomplete: React.FC<CustomDropDownAutocompleteProps> = ({
  value,
  isDisabled,
  multipleOptions = false,
  options,
  onChangeHandler,
  isValid,
  label,
  isRequired,
  defaultValue,
  isTabularEdit = false,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(value) ? value : value ? [value] : [],
  );

  useEffect(() => {
    if (defaultValue && location.pathname.includes("create")) {
      const initialValues = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
      setSelectedValues(initialValues);
      onChangeHandler(initialValues, isValid);
    }
  }, []);

  const onSelectHandler = (
    event: React.SyntheticEvent<Element, Event>,
    newValue: string | string[] | null,
  ) => {
    const normalized = newValue == null ? [""] : Array.isArray(newValue) ? newValue : [newValue]; // if null (emptying with x button), should act the same as picking texts.heb.emptyValue
    const reportedValue = normalized.map((val) => (val === texts.heb.emptyValue ? "" : val));
    setSelectedValues(reportedValue);
    onChangeHandler(reportedValue, isValid);
  };

  const displayedValue = selectedValues.map((val) => (val === "" ? texts.heb.emptyValue : val));

  const onDeleteHandler = (index: number) => {
    const newSelected = [...selectedValues];
    newSelected.splice(index, 1);
    setSelectedValues(newSelected);
    onChangeHandler(newSelected, !isRequired || newSelected.length > 0);
  };

  const getValue = () =>
    multipleOptions
      ? displayedValue.filter(
          (val) =>
            (typeof val === "string" || typeof val === "number") && val !== texts.heb.emptyValue,
        )
      : typeof displayedValue[0] === "string" || typeof displayedValue[0] === "number"
      ? displayedValue[0]
      : "";

  useEffect(() => {
    if (Array.isArray(value)) {
      setSelectedValues(value);
    } else if (typeof value === "string") {
      setSelectedValues(value ? [value] : []);
    }
  }, [value]);

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
          error={!isValid}
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
        value={getValue()}
        onChange={(event: any, value: any) => onSelectHandler(event, value)}
        getOptionLabel={(option: any) => (option === "" ? "ערך ריק" : String(option))}
        isOptionEqualToValue={(option, value) => option === value}
        size={isTabularEdit ? "small" : "medium"}
        renderTags={(value: any, getTagProps) =>
          value.map((option, index) => (
            <Chip
              label={option === texts.heb.emptyValue ? "" : option}
              {...getTagProps({ index })}
              key={uuidv4()}
              onDelete={(index) => onDeleteHandler(index)}
              size={isTabularEdit ? "small" : "medium"}
            />
          ))
        }
        renderInput={(params) => (
          <StyledTextField
            {...params}
            required={isRequired}
            error={!isValid}
            variant="standard"
            size={isTabularEdit ? "medium" : undefined}
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
      <StyledFormHelperText>
        {(!isValid && texts.heb.listChooseRequired) || " "}
      </StyledFormHelperText>
    </FormControl>
  );
};

export default CustomDropDownAutocomplete;
