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
  height: "400px",
  minHeight: "400px",
  overflowY: "auto",
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

export const GridIcon = styled(Box)<GridIconProps>(({ theme, selected, hidePointer = false }) => ({
  display: "inline-flex",
  padding: "8px",
  borderRadius: "8px",
  cursor: hidePointer ? "default" : "pointer",
  backgroundColor: selected ? theme.palette.action.selected : "transparent",
  border: selected ? `1px solid ${theme.palette.primary.main}` : "1px solid transparent",
  color: selected ? theme.palette.primary.main : theme.palette.text.primary,
  transition: "all 0.2s ease-in-out",
  "&:hover": {
    backgroundColor: theme.palette.action.hover,
    border: `1px solid ${theme.palette.primary.light}`,
    color: theme.palette.primary.main,
    "& svg": {
      opacity: 1,
    }
  },
  "& svg": {
    opacity: selected ? 1 : 0.6,
    transition: "all 0.2s ease-in-out",
  }
}));