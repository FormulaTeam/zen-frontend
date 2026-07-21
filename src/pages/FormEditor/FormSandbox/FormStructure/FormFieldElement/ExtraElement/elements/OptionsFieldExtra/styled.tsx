import { FormControl, FormControlLabel, FormLabel, styled } from "@mui/material";
import { Info } from "@mui/icons-material";

export const SourceFormControl = styled(FormControl)({
  gridColumn: "1 / -1",
});

export const SourceFormLabel = styled(FormLabel)(({ theme }) => ({
  color: theme.palette.text.secondary,
  "&.Mui-focused": {
    color: theme.palette.text.secondary,
  },
}));

export const SourceOptionLabel = styled("span")({
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
});

export const TooltipAnchor = styled("span")({
  display: "inline-flex",
  alignItems: "center",
});

export const InfoIcon = styled(Info)({
  cursor: "default",
});

export const MultipleSelectionControlLabel = styled(FormControlLabel)({
  gridColumn: "span 2",
});
