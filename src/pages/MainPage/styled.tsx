import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/material/styles";

export const RowBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  width: "100%",
});

export const GreetingBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  flex: 1,
});

export const TabsBox = styled(Box)({
  display: "flex",
  justifyContent: "center",
  flexShrink: 0,
});

export const SortControlsBox = styled(Box)({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: "16px",
  flex: 1,
  justifyContent: "flex-end",
});

export const StyledTypography = styled(Typography)(({ theme }) => ({
  fontSize: "20px !important",
  fontWeight: 600,
}));

export const CreateFormButton = styled("button")<{ $bgc?: string }>(({ theme, $bgc }) => ({
  backgroundColor: $bgc,
  color: "white",
  padding: "5px 10px",
  fontSize: "16px",
  fontFamily: "inherit",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  width: "140px",
}));

export const PrimaryBlueButton = styled("button")(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: "white",
  height: "40px",
  padding: "0 30px",
  fontSize: "16px",
  fontFamily: "inherit",
  fontWeight: 700,
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark || "#1565c0",
  },
}));

export const EmptyStateContainer = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "flex-start",
  width: "100%",
  padding: "10vh 20px 2vh",
  boxSizing: "border-box",
  minHeight: "60vh",
});

export const EmptyStateImage = styled("img")({
  margin: "0 0 4vh 0",
  width: "auto",
  maxHeight: "35vh",
  maxWidth: "100%",
  borderRadius: "40px",
  objectFit: "contain",
  flexShrink: 1,
});

export const EmptyStateTextContent = styled(Box)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "1vh",
  padding: "0 10px",
  width: "100%",
});

export const EmptyStateTitle = styled(Typography)({
  textAlign: "center",
  width: "100%",
  fontSize: "clamp(1.5rem, 5vh, 3.5rem)",
  fontWeight: 800,
  lineHeight: 1.2,
  color: "#1a237e",
});

export const EmptyStateSubtitle = styled(Typography)({
  textAlign: "center",
  width: "100%",
  fontSize: "clamp(1rem, 2.5vh, 1.8rem)",
  fontWeight: 400,
  lineHeight: 1.4,
  color: "#666666",
});

export const EmptyStateActions = styled(Box)({
  marginTop: "5vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  width: "100%",
});