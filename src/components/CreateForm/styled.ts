import { styled } from "@mui/material/styles";
import { Box, Typography } from "@mui/material";

export const ToolbarContainer = styled(Box)(({ theme }) => ({
  width: "100%",
  display: "flex",
  gap: "1rem",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

export const EditDetailsBox = styled(Box)({
  display: "flex",
  gap: 4,
  alignItems: "center",
});

export const InputRow = styled(Box)({
  display: "flex",
  alignItems: "center",
});

export const DisplayRow = styled(Box)({
  display: "flex",
  gap: 16,
  alignItems: "center",
});

export const SavedStatus = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: 8,
});

export const CaptionError = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  display: "block",
  marginTop: theme.spacing(0.5),
}));
