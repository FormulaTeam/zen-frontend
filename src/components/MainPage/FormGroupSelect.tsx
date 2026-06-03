import { Box, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { styled } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { formsTabs } from "../../utils/utils";
import { FormsTab } from "../../utils/interfaces";

interface FormGroupSelectProps {
  value: FormsTab | null;
  onChange: (newValue: FormsTab) => void;
  isSuperAdmin: boolean;
}

const StyledFormControl = styled(Box)(({ theme }) => ({
  width: 220,
  position: "relative",
}));

const StyledSelect = styled(Select<FormsTab>)(({ theme }) => ({
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
  const handleChange = (event: SelectChangeEvent<FormsTab>) => {
    onChange(event.target.value as FormsTab);
  };

  return (
    <StyledFormControl>
      <StyledSelect
        id="form-group-select"
        value={value ?? formsTabs.currentUserCreated}
        onChange={handleChange}
        IconComponent={KeyboardArrowDownIcon}
      >
        <MenuItem value={formsTabs.currentUserCreated} sx={{ fontSize: "16px" }}>
          טפסים שלי
        </MenuItem>
        <MenuItem value={formsTabs.sharedWithUser} sx={{ fontSize: "16px" }}>
          טפסים ששותפו איתי
        </MenuItem>
        {isSuperAdmin && (
          <MenuItem value={formsTabs.allForms} sx={{ fontSize: "16px" }}>
            כל הטפסים
          </MenuItem>
        )}
      </StyledSelect>
    </StyledFormControl>
  );
};

export default FormGroupSelect;
