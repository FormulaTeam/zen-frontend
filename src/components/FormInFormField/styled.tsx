import Autocomplete, { AutocompleteProps } from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import BaseFormInput from "../BaseFormInput/BaseFormInput";
import { TextFieldProps } from "@mui/material/TextField";

export const LoadingContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "100%",
  padding: theme.spacing(2),
}));

export const FieldWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

export const FormSelectInput = styled(BaseFormInput)<TextFieldProps>({
  width: "300px",
});
