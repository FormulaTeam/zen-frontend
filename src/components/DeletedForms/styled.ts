import { Box, Typography } from "@mui/material";
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
  border: `1px solid ${theme.palette.divider}`,
}));

export const StyledListItem = styled(Box)(({ theme }) => ({
  padding: "16px 24px",
  margin: "0 0 12px 0",
  borderRadius: "12px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  width: "100%",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.divider}`,
  transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out, background-color 0.2s ease-in-out",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.05)",
    borderColor: theme.palette.primary.light,
    backgroundColor: theme.palette.action.hover,
  },
}));

export const FormInfo = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
  gap: "32px",
});

export const FormTitleBox = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: "250px",
});

export const MetadataBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "24px",
  flex: 1,
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
});
