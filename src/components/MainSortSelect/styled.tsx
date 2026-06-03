import { FormControl, Select } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: 220,
  backgroundColor: "transparent",
}));

export const StyledSelect = styled(Select<number>)(({ theme }) => ({
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
    paddingRight: "32px !important",
    paddingLeft: "8px !important",
  },

  "& .MuiSelect-icon": {
    right: "7px",
    left: "auto",
    fontSize: "24px",
    color: "#020618",
  },
}));
