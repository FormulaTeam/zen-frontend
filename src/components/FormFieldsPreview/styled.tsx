import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export const PreviewFormContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2),
  padding: theme.spacing(1),
}));

export const FieldPreviewWrapper = styled(Box)`
  width: 200px;
`;
