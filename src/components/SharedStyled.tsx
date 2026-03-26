import { Box, styled, TextField } from "@mui/material";

export const StyledLoadingContainer = styled(Box)({
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "20px",
  width: "100%",
});

export const FormSelectInput = styled(TextField)(() => ({
  marginTop: "16px",
  background: "#fdfdfd",
  marginRight: "6px",
  label: {
    color: "#6c6c6c",
  },
}));
