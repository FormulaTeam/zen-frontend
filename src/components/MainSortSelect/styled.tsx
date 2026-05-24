import Autocomplete from "@mui/material/Autocomplete";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

type SortOption = {
  label: string;
  value: number;
};

interface StyledAutocompleteProps {
  sortInputWidth: number;
}

/**
 * Breakdown of <Autocomplete<T, Multiple, DisableClearable, FreeSolo>>
 * Position 	Parameter	        Type	    Meaning
    T	        SortOption	        Object	    The shape of each option (you defined label and value).
    1st	        Multiple	        false	    The Autocomplete does NOT support selecting multiple values.
    2nd	        DisableClearable	false	    The clear icon (❌) is enabled, so users can clear the selection.
    3rd	        FreeSolo	        false	    The user can’t type custom values not in the list of options.
 */
export const StyledAutocomplete = styled(Autocomplete<SortOption, false, false, false>)(({ theme }) => ({
  width: '180px',
  borderRadius: '8px',
  fontSize: '15px',

  '& .MuiInputBase-root': {
    borderRadius: '8px',
    fontSize: '15px',
  },
}));

export const StyledTextField = styled(TextField)(({ theme }) => ({
  fieldset: { border: "1px solid " + theme.palette.primary.main },
  ".MuiInputBase-input": { fontSize: "15px", fontWeight: 600, cursor: "pointer" },
  "& .MuiSvgIcon-root": {
    color: (theme) => theme.palette.primary.main,
    "&:hover": {
      cursor: "pointer",
    },
  },
  ".MuiAutocomplete-input": {
    marginTop: "5px",
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.primary.main,
    fontWeight: 600,
  },
}));
