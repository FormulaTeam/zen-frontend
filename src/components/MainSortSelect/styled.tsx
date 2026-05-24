import { FormControl, Select } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  width: "220px",
  backgroundColor: theme.palette.background.paper,
  "& .MuiInputLabel-root": {
    color: theme.palette.primary.main,
    fontWeight: 600,
    fontSize: "14px",
    backgroundColor: theme.palette.background.paper,
    padding: "0 4px",
    "&.Mui-focused": {
      color: theme.palette.primary.main,
    },
  },
}));

export const StyledSelect = styled(Select<number>)(({ theme }) => ({
  borderRadius: "8px",
  fontSize: "14px",
  fontWeight: 600,
  height: "40px",
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    borderWidth: "1px",
  },
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
    borderWidth: "2px",
  },
  "& .MuiSelect-select": {
    display: "flex",
    alignItems: "center",
    paddingTop: "8px",
    paddingBottom: "8px",
    cursor: "pointer",
  },
  "& .MuiSvgIcon-root": {
    color: theme.palette.primary.main,
  },
}));
