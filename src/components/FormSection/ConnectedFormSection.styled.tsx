import Box, { BoxProps } from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";

export const ConnectedFormFieldsWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  display: "flex",
  width: "100%",
  flexDirection: "column",
  gap: theme.spacing(3),
}));

export const ConnectedFormCard = styled(Box)<BoxProps>(({ theme }) => ({
  background: "#FFFFFF",
  border: "1px solid #e0e0e0",
  borderRadius: "12px",
  boxShadow: "0 4px 6px rgba(0,0,0,0.02)",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  width: "100%",
}));

export const CardHeaderContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: theme.spacing(2.5),
  paddingBottom: theme.spacing(1.5),
  borderBottom: "1px solid #f0f0f0",
}));

export const AddResponseButton = styled(Button)(({ theme }) => ({
  width: "100%",
  height: "60px",
  border: "2px dashed #1a73e8",
  background: "#f0f7ff",
  color: "#1a73e8",
  borderRadius: "12px",
  fontWeight: 700,
  fontSize: "1rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  transition: "all 0.2s ease",
  "&:hover": {
    background: "#e1effe",
    borderColor: "#1a73e8",
  },
}));

export const ConnectedFormTitle = styled(Typography)(({ theme }) => ({
  alignSelf: "flex-start",
  fontSize: "1.25rem",
  fontWeight: 600,
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(1),
}));
