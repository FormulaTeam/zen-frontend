import { Box, styled, Typography, InputBase } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const MetadataContainer = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const SeamlessTitleInput = styled(InputBase)(({ theme }) => ({
  ...theme.typography.h5,
  fontWeight: 700,
  lineHeight: 1.2,
  padding: "0 8px",
  borderRadius: "4px",
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  transition: "background-color 0.2s, box-shadow 0.2s",
  width: "100%",
  maxWidth: "500px",
  boxSizing: "border-box",
  display: "block",
  "& .MuiInputBase-input": {
    padding: 0,
    height: "auto",
    lineHeight: 1.2,
  },
  "&.Mui-focused": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

export const SeamlessDescriptionInput = styled(InputBase)(({ theme }) => ({
  ...theme.typography.subtitle1,
  lineHeight: 1.4,
  padding: "0 8px",
  borderRadius: "4px",
  backgroundColor: "rgba(0, 0, 0, 0.02)",
  transition: "background-color 0.2s, box-shadow 0.2s",
  width: "100%",
  maxWidth: "500px",
  boxSizing: "border-box",
  marginTop: "2px",
  color: "rgba(0, 0, 0, 0.6)",
  display: "block",
  "& .MuiInputBase-input": {
    padding: 0,
    height: "auto",
    lineHeight: 1.4,
  },
  "&.Mui-focused": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
    boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
  },
}));

export const StyledTitleText = styled(Typography)({
  maxWidth: "500px",
  minWidth: 0,
  cursor: "pointer",
  padding: "0 8px",
  borderRadius: "4px",
  transition: "background-color 0.2s",
  fontWeight: 700,
  lineHeight: 1.2,
  boxSizing: "border-box",
  margin: 0,
  display: "block",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

export const StyledDescriptionText = styled(Typography)({
  maxWidth: "500px",
  minWidth: 0,
  cursor: "pointer",
  padding: "0 8px",
  borderRadius: "4px",
  transition: "background-color 0.2s",
  lineHeight: 1.4,
  color: "rgba(0, 0, 0, 0.6)",
  boxSizing: "border-box",
  margin: 0,
  marginTop: "2px",
  display: "block",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});
