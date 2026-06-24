
import {
  FormControl,
  FormControlLabel,
  Typography,
  styled,
} from "@mui/material";

export const StyledFormControl = styled(FormControl, {
  shouldForwardProp: (prop) => prop !== 'isTabularEdit',
})<{ isTabularEdit: boolean }>(({ isTabularEdit }) => ({
  padding: isTabularEdit ? "0" : "0.5rem 0",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  width: "100%",
  gap: isTabularEdit ? 0 : "8px",
}));

export const StyledLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: "1.3rem",
  fontWeight: 600,
  lineHeight: 1.2,
  display: "block",
  width: "100%",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
}));

export const StyledFormControlLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== 'isTabularEdit',
})<{ isTabularEdit: boolean }>(({ isTabularEdit }) => ({
  margin: 0,
  padding: isTabularEdit ? "0" : "4px 0",
  "& .MuiFormControlLabel-label": {
    display: "none",
  }
}));
