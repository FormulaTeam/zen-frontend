import FormHelperText from "@mui/material/FormHelperText";
import Autocomplete from "@mui/material/Autocomplete";
import InputLabel from "@mui/material/InputLabel";
import TextField from "@mui/material/TextField";
import { styled } from "@mui/material/styles";

export const StyledFormHelperText = styled(FormHelperText)`
  color: ${({ theme }) => theme.palette.error.main};
  text-align: right;
  margin-top: 15px;
`;

export const StyledListbox = styled("ul")`
  .MuiAutocomplete-option:hover {
    background-color: ${({ theme }) => theme.palette.primary.main + " !important"};
    color: ${({ theme }) => theme.palette.white};
  }
`;

export const StyledInputLabel = styled(InputLabel)`
  top: -14px;
  left: 5px;
  font-size: 1.3rem;
  font-weight: 600;
  color: ${({ theme }) => theme.palette.text.primary};
  transform: translate(0, 0) scale(1) !important;
`;

export const StyledAutocomplete = styled(Autocomplete)`
  .MuiAutocomplete-endAdornment {
    left: 0;
    right: auto;
  }
  .MuiAutocomplete-inputRoot {
    padding-right: 10px !important;
  }
`;

export const StyledTextField = styled(TextField)`
  .MuiInputAdornment-root {
    max-height: 1.5rem;
  }
  .MuiInput-root {
    min-height: 50px;
    font-size: 1.2rem;
    ::before: {
      border: none !important;
    }
  }
  .MuiAutocomplete-inputRoot {
    top: 16px;
    border: 1px solid;
    border-color: ${({ theme }) => theme.palette.input?.border + " !important"};
    border-radius: 8px;
    font-size: 1.2rem;
  }

  .MuiAutocomplete-tag {
    margin-top: 0px;
  }

  .MuiChip-deleteIcon {
    margin: 0px;
    padding-left: 5px;
  }

  .MuiInputBase-root {
    min-height: 50px;

    .Mui-error::before {
      border-color: ${({ theme }) => theme.palette.error.main};
    }
    :hover,
    :hover:not(.Mui-disabled, .Mui-error):before {
      border-radius: 8px;
      border-bottom: "1px solid " + ${({ theme }) => theme.palette.primary?.main + " !important"};
    }
    ::after {
      top: 0;
      border-radius: 8px;
      border-bottom: "1px solid " + ${({ theme }) => theme.palette.primary?.main + " !important"};
    }
  }
`;
