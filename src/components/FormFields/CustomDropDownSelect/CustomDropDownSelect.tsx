import { Autocomplete, Chip, FormControl, FormHelperText, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

interface CustomDropDownSelectProps {
  value: string | string[];
  multiple?: boolean;
  options: string[];
  label: string;
  isRequired: boolean;
  isDisabled: boolean;
  onChangeHandler: (value: string | string[]) => void;
  validationMessage?: string | null;
}

const CustomDropDownSelect: React.FC<CustomDropDownSelectProps> = ({
  value,
  isDisabled,
  multiple = false,
  options,
  onChangeHandler,
  label,
  isRequired,
  validationMessage,
}) => {
  const [selectedValues, setSelectedValues] = useState<string[]>(Array.isArray(value) ? value : []);
  const [selectedValue, setSelectedValue] = useState<string>(
    typeof value === "string" ? value : "",
  );
  const theme = useTheme();

  useEffect(() => {
    if (multiple) {
      if (Array.isArray(value)) {
        const validValues = value.filter((val) => options.includes(val));
        setSelectedValues(validValues);

        if (validValues.length !== value.length) {
          onChangeHandler(validValues);
        }
      } else {
        setSelectedValues([]);
      }
    } else {
      const newVal =
        typeof value === "string"
          ? value
          : Array.isArray(value) && value.length > 0
            ? value[0]
            : "";

      if (newVal && !options.includes(newVal)) {
        setSelectedValue("");
        onChangeHandler("");
      } else {
        setSelectedValue(newVal);
      }
    }
  }, [value, multiple, options, onChangeHandler]);

  const onAutocompleteChangeHandler = (
    _event: React.SyntheticEvent,
    newValue: string | string[] | null,
  ) => {
    if (multiple) {
      const normalizedValues = Array.isArray(newValue) ? newValue : [];
      setSelectedValues(normalizedValues);
      onChangeHandler(normalizedValues);
      return;
    }

    const singleValue = typeof newValue === "string" ? newValue : "";
    setSelectedValue(singleValue);
    onChangeHandler(singleValue);
  };

  return (
    <FormControl fullWidth variant="standard">
      <Autocomplete
        multiple={multiple}
        disabled={isDisabled}
        options={options}
        value={multiple ? selectedValues : selectedValue}
        onChange={onAutocompleteChangeHandler}
        renderInput={(params) => (
          <BaseFieldInput
            {...params}
            label={label}
            required={isRequired}
            error={Boolean(validationMessage)}
            helperText={validationMessage || " "}
            sx={{
              "& .MuiInputAdornment-root": {
                maxHeight: "1.5rem",
              },
              "& .MuiInputBase-root": {
                "::before": {
                  border: "1px solid",
                  borderColor: theme.palette.input?.border,
                  borderRadius: "8px",
                  top: 0,
                },
                "&.Mui-error::before": {
                  borderColor: theme.palette.error.main,
                },
                ":hover,:hover:not(.Mui-disabled, .Mui-error):before": {
                  borderRadius: "8px",
                  borderBottom: `1px solid ${theme.palette.primary.main}`,
                },
                "::after": {
                  top: 0,
                  borderRadius: "8px",
                  borderBottom: `1px solid ${theme.palette.primary.main}`,
                },
                padding: "0.5rem 1rem",
              },
            }}
          />
        )}
        renderValue={(selected, getItemProps) =>
          multiple && Array.isArray(selected)
            ? selected.map((option, index) => {
                const chipProps = getItemProps({ index });
                return <Chip label={option} {...chipProps} />;
              })
            : typeof selected === "string"
              ? selected
              : ""
        }
        sx={{
          "& .MuiInputAdornment-root": {
            maxHeight: "1.5rem",
          },
        }}
      />

      <FormHelperText error={Boolean(validationMessage)}>{validationMessage || " "}</FormHelperText>
    </FormControl>
  );
};

export default CustomDropDownSelect;
