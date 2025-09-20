import {Box, styled} from "@mui/material";

export const FormFieldWrapper = styled('div')`
  align-items: start;
  min-height: 93px;
  .MuiFormControl-root {
    width: 100%;
    textarea {
      max-height: 120px !important;
      overflow-y: auto !important;
    }
  }
`;


export const StyledBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  width: "100%",
  minHeight: "40px",
  "& .MuiFormControl-root": {
    marginBottom: 0,
    width: "100%",
  },
  "& > *": {
    width: "100%",
  },
}));