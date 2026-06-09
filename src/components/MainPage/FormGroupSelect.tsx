import { Box, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { formsScopeOption, FormsScopeOption } from "../../types/enums/filtersAndSorts.enum";

interface FormGroupSelectProps {
  value: FormsScopeOption;
  onChange: (newValue: FormsScopeOption) => void;
  isSuperAdmin: boolean;
}

const StyledFormControl = styled(Box)(({ theme }) => ({
  width: 190,
  position: "relative",
}));

const StyledSelect = styled(Select<FormsScopeOption>)(({ theme }) => ({
  width: "100%",
  borderRadius: 8,
  height: 40,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,

  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#D1D1D1",
    borderWidth: 1,
  },

  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: "#62748E",
  },

  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: "#020618",
    borderWidth: 2,
  },

  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    fontSize: "16px",
    fontWeight: 600,
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: "32px !important", // Space for icon on the right
    paddingLeft: "8px !important",
  },

  "& .MuiSelect-icon": {
    right: "7px", // Position on the right
    left: "auto",
    fontSize: "24px",
    color: "#020618",
  },
}));

const FormGroupSelect = ({ value, onChange, isSuperAdmin }: FormGroupSelectProps) => {
  const handleChange = (event: SelectChangeEvent<FormsScopeOption>) => {
    onChange(event.target.value as FormsScopeOption);
  };

  return (
    <StyledFormControl>
      <StyledSelect
        id="form-group-select"
        value={value}
        onChange={handleChange}
        IconComponent={KeyboardArrowDownIcon}
      >
        <MenuItem value={formsScopeOption.AccessibleForms} sx={{ fontSize: "16px" }}>
          כל הטפסים
        </MenuItem>
        <MenuItem value={formsScopeOption.MyForms} sx={{ fontSize: "16px" }}>
          טפסים שלי
        </MenuItem>
        <MenuItem value={formsScopeOption.SharedWithMeForms} sx={{ fontSize: "16px" }}>
          טפסים ששותפו איתי
        </MenuItem>
        {isSuperAdmin && (
          <MenuItem value={formsScopeOption.AllForms} sx={{ fontSize: "16px" }}>
            🥺👉🏽👈🏽
          </MenuItem>
        )}
      </StyledSelect>
    </StyledFormControl>
  );
};

export default FormGroupSelect;
