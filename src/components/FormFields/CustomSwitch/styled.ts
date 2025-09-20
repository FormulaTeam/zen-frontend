
import {
  FormControl,
  FormControlLabel,
  Typography,
  styled,
} from "@mui/material";

export const StyledFormControl = styled(FormControl, {
  shouldForwardProp: (prop) => prop !== 'isTabularEdit',
})<{ isTabularEdit: boolean }>(({ isTabularEdit }) => ({
  padding: isTabularEdit ? "0" : "1rem 0",
  display: "flex",
  flexDirection: isTabularEdit ? "column" : "row",
  alignItems: isTabularEdit ? "flex-start" : "center",
  width: "100%",
}));

export const StyledLabel = styled(Typography)(() => ({
  color: "rgba(0, 0, 0, 0.6)", // matches MUI's text.secondary
  fontSize: "0.7rem",
  marginBottom: "0.2rem",
  lineHeight: 1,
}));

export const StyledFormControlLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop) => prop !== 'isTabularEdit',
})<{ isTabularEdit: boolean }>(({ isTabularEdit }) => ({
  justifyContent: isTabularEdit ? "flex-start" : "flex-end",
  alignSelf: "start",
  padding: isTabularEdit ? "0" : "0 11px",
  margin: 0,
}));