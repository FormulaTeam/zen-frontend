import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { DialogTitle, DialogContent, DialogActions } from "@mui/material";

interface GridIconProps {
  selected?: boolean;
  hidePointer?: boolean;
}

export const StyledDialogTitle = styled(DialogTitle)(() => ({
  textAlign: "center",
  paddingBottom: "8px",
}));

export const SearchContainer = styled(Box)(() => ({
  padding: "0 24px 8px 24px",
}));

export const StyledDialogContent = styled(DialogContent)(() => ({
  minHeight: "30vh",
  alignContent: "flex-start",
}));

export const StyledDialogActions = styled(DialogActions)(() => ({
  justifyContent: "center",
  padding: "16px",
  gap: "16px",
  "& .MuiButton-root": {
    width: "50%",
  },
}));

export const GridIconContainer = styled(Box)(() => ({
  textAlign: "center",
  padding: "8px",
}));

export const IconImage = styled("img")(() => ({
  width: 40,
  height: 40,
  objectFit: "contain",
  transition: "all 0.2s ease-in-out",
}));

export const loadingContainer = styled(Box)(() => ({
  minHeight: "50vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

export const GridIcon = styled(Box)<GridIconProps>(({ theme, selected, hidePointer = false }) => ({
  display: "inline-flex",
  padding: "8px",
  borderRadius: "8px",
  cursor: hidePointer ? "default" : "pointer",
  backgroundColor: selected ? theme.palette.action.selected : "transparent",
  border: selected ? `1px solid ${theme.palette.primary.main}` : "1px solid transparent",
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    border: `1px solid ${theme.palette.primary.light}`,
    "& img": {
      filter: "grayscale(0%)",
      opacity: 1,
    }
  },
  "& img": {
    filter: selected ? "grayscale(0%)" : "grayscale(100%)",
    opacity: selected ? 1 : 0.6,
  }
}));