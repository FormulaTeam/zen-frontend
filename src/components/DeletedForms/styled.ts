import { Box, Paper, Typography, Button, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";

export const StyledListHeader = styled(Box)(({ theme }) => ({
  padding: "16px 24px",
  margin: "12px 0",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.04)",
  border: `1px solid ${theme.palette.divider}`,
}));

export const StyledListItem = styled(Paper)(({ theme }) => ({
  padding: "20px 24px",
  margin: "0 0 12px 0",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.03)",
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 6px 16px rgba(0, 0, 0, 0.08)",
    borderColor: theme.palette.primary.light,
  },
}));

export const FormInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
  gap: "4px",
});

export const FormTitleBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "12px",
});

export const RestoreButtonWrapper = styled(Box)({
  display: "flex",
  gap: "12px",
  alignItems: "center",
  justifyContent: "flex-end",
  minWidth: "220px",
});

export const Img = styled("img")({
  height: "24px",
  width: "24px",
  objectFit: "contain",
});

export const StrongText = styled("strong")<{ color?: string }>(({ color }) => ({
  color: color || "inherit",
  fontWeight: 600,
}));

export const HeaderWrapper = styled(Box)({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
});

export const CheckboxWrapper = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginRight: "16px",
});

export const FlexRowItem = styled(Box)({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "100%",
});

export const MetadataTypography = styled(Typography)(({ theme }) => ({
  fontSize: "0.85rem",
  color: theme.palette.text.secondary,
  display: "flex",
  alignItems: "center",
  gap: "6px",
}));

export const EmptyStateWrapper = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "400px",
  gap: "24px",
  opacity: 0.8,
});
