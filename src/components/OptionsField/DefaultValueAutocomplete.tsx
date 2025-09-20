import React from "react";
import { Autocomplete } from "@mui/material";
import { FormSelectInput } from "../FormInFormField/styled";

interface DefaultValueAutocompleteProps {
  options: string[];
  defaultValue?: string;
  onChange: (val: string) => void;
}

const DefaultValueAutocomplete: React.FC<DefaultValueAutocompleteProps> = ({
  options,
  defaultValue = "",
  onChange,
}) => {
  // Disable dropdown if no options are available or all options are empty strings
  const isDisabled =
    !options ||
    options.length === 0 ||
    options.every((option) => !option || String(option)?.trim() === "");

  return (
    <Autocomplete
      disablePortal
      disabled={isDisabled}
      options={options || []}
      value={defaultValue}
      onChange={(e, val) => onChange(val ?? "")}
      getOptionLabel={(option) => option}
      isOptionEqualToValue={(option, value) => option === value}
      noOptionsText="אין אפשרויות"
      renderInput={(params) => (
        <FormSelectInput
          {...params}
          label="ערך ברירת מחדל"
          value={defaultValue}
          onChange={(e) => onChange(e.target.value)}
          slotProps={{
            inputLabel: {
              shrink: true,
            },
          }}
          sx={{ mt: 2, width: 250 }}
        />
      )}
    />
  );
};

export default DefaultValueAutocomplete;
