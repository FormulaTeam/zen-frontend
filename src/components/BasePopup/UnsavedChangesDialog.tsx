import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "12px",
    maxWidth: "460px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "20px 24px",
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  backgroundColor: "rgba(245, 158, 11, 0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#f59e0b",
  "& svg": {
    fontSize: "24px",
  },
}));

const TitleText = styled(Typography)({
  fontWeight: 600,
  fontSize: "1.25rem",
  color: "#1e293b",
});

interface UnsavedChangesDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
  title?: string;
  message?: string;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onClose,
  onSave,
  onDiscard,
  title = "שינויים שלא נשמרו",
  message = "יש לך שינויים שלא נשמרו. האם ברצונך לשמור את השינויים לפני היציאה?",
}) => {
  const theme = useTheme();

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle>
        <IconWrapper>
          <WarningAmberIcon />
        </IconWrapper>
        <TitleText>{title}</TitleText>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent dividers sx={{ borderBottom: "none", py: 3 }}>
        <Typography variant="body1" sx={{ color: "#475569", fontWeight: 500, lineHeight: 1.6 }}>
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onDiscard}
          variant="outlined"
          sx={{
            borderRadius: "8px",
            px: 3,
            py: 1,
            color: "#ef4444",
            borderColor: "#e2e8f0",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "rgba(239, 68, 68, 0.04)",
              borderColor: "#ef4444",
            },
          }}
        >
          יציאה ללא שמירה
        </Button>
        <Button
          onClick={onSave}
          variant="contained"
          disableElevation
          sx={{
            borderRadius: "8px",
            px: 4,
            py: 1,
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}
        >
          שמירה ויציאה
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default UnsavedChangesDialog;
