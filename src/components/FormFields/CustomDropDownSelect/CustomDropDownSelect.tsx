import { Autocomplete, Chip, FormControl, FormHelperText, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import { CustomInputFormFieldProps } from "../../../utils/interfaces";
import BaseFieldInput from "../BaseFieldInput/BaseFieldInput";

interface CustomDropDownSelectProps extends CustomInputFormFieldProps {
  value: string | string[];
  multiple?: boolean;
  options: any[];
}

const CustomDropDownSelect: React.FC<CustomDropDownSelectProps> = ({
  value,
  isDisabled,
  multiple = false,
  options,
  onChangeHandler,
  isValid,
  label,
  isRequired,
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
          onChangeHandler(validValues, validValues.length > 0 || !isRequired);
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
        onChangeHandler([""], !isRequired);
      } else {
        setSelectedValue(newVal);
      }
    }
  }, [value, multiple, isRequired]);

  const onAutocompleteChangeHandler = (event: any, newValue: string | string[] | null) => {
    let normalizedValues: string[];

    if (multiple) {
      normalizedValues = Array.isArray(newValue) ? newValue : [];
      setSelectedValues(normalizedValues);
    } else {
      const singleValue = typeof newValue === "string" ? newValue : "";
      normalizedValues = singleValue ? [singleValue] : [];
      setSelectedValue(singleValue);
    }
    onChangeHandler(normalizedValues, normalizedValues.length > 0 || !isRequired);
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
            error={!isValid}
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
        renderValue={(value, getTagProps) =>
          Array.isArray(value)
            ? value.map((option, index) => (
                <Chip deleteIcon={<></>} label={option} {...getTagProps({ index })} />
              ))
            : value || ""
        }
        sx={{
          "& .MuiInputAdornment-root": {
            maxHeight: "1.5rem",
          },
        }}
      />
      <FormHelperText error={!isValid}>
        {(!isValid && "חובה לבחור פריט מהרשימה") || " "}
      </FormHelperText>
    </FormControl>
  );
};

export default CustomDropDownSelect;
