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

export const ConnectedFormSegmentBox = styled(Box)(({ theme }) => ({
  background: "#FFFFFF",
  border: "1px solid #e0e0e0",
  borderRadius: "16px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  padding: theme.spacing(2.5),
  marginBottom: theme.spacing(4),
  width: "100%",
}));

export const SegmentHeaderContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  cursor: "pointer",
  paddingBottom: theme.spacing(1.5),
  borderBottom: "1px solid #f9f9f9",
  marginBottom: theme.spacing(2.5),
}));

export const ResponseCountBadge = styled(Box)(({ theme }) => ({
  background: "#f0f0f0",
  color: "#666",
  padding: "2px 10px",
  borderRadius: "12px",
  fontSize: "0.75rem",
  fontWeight: 600,
  marginLeft: theme.spacing(1.5),
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
  height: "50px",
  border: "1px solid #1a73e8",
  background: "#FFFFFF",
  color: "#1a73e8",
  borderRadius: "8px",
  fontWeight: 500,
  fontSize: "0.9375rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1),
  textTransform: "none",
  transition: "all 0.2s ease",
  "&:hover": {
    background: "#f0f7ff",
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
