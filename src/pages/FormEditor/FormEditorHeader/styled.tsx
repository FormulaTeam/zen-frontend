import { Box, styled, Typography, DialogTitle, DialogContent, DialogContentText, DialogActions, TextField } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const MetadataContainer = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const SeamlessTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    padding: "4px 8px",
    borderRadius: "4px",
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    transition: "background-color 0.2s, box-shadow 0.2s",
    "&:before, &:after": {
      display: "none", // Remove standard underline
    },
    "&.Mui-focused": {
      backgroundColor: "rgba(0, 0, 0, 0.04)",
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.3)}`,
    },
  },
  "& .MuiInputBase-input": {
    padding: 0,
  },
  "& .MuiFormHelperText-root": {
    marginLeft: 8,
    marginRight: 8,
  }
}));

export const StyledTitleText = styled(Typography)({
  maxWidth: "500px",
  minWidth: 0,
  cursor: "pointer",
  padding: "2px 8px",
  borderRadius: "4px",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

export const StyledDescriptionText = styled(Typography)({
  maxWidth: "500px",
  minWidth: 0,
  cursor: "pointer",
  padding: "2px 8px",
  borderRadius: "4px",
  transition: "background-color 0.2s",
  "&:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
});

export const ExitAlertMsgDialog = styled(Box)(({ theme }) => ({
  padding: '2% 5%',
  minHeight: '300px',
  width: '45vw',
  maxWidth: '600px',
  borderRadius: '20px',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: 'gray 0 0 10px 0',
  backgroundColor: '#f5f5f5',
  position: 'relative',
}));

export const ExitAlertMsgCloseIcon = styled('span')({
  position: 'absolute',
  top: 15,
  left: 15,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const ExitAlertMsgDialogTitle = styled(DialogTitle)({
  textAlign: 'center',
  paddingTop: 0,
  paddingBottom: 8,
});

export const ExitAlertMsgDialogContent = styled(DialogContent)({
  paddingBottom: 8,
  padding: 0,
  textAlign: 'center',
});

export const ExitAlertMsgDialogContentText = styled(DialogContentText)({
  fontSize: '1.5rem',
  color: 'inherit',
  direction: 'ltr',
});

export const ExitAlertMsgDialogActions = styled(DialogActions)({
  justifyContent: 'center',
  marginTop: 24,
  padding: 0,
  gap: '10px',
  flexDirection: 'row-reverse',
});
