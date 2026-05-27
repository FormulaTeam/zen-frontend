import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "12px",
    maxWidth: "400px",
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
  backgroundColor: "rgba(239, 68, 68, 0.14)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ef4444",
  "& svg": {
    fontSize: "24px",
  },
}));

const TitleText = styled(Typography)({
  fontWeight: 600,
  fontSize: "1.25rem",
  color: "#1e293b",
});

interface ConfirmDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "מחיקה",
  cancelText = "ביטול",
}) => {
  const theme = useTheme();

  return (
    <StyledDialog open={open} onClose={onClose}>
      <StyledDialogTitle>
        <IconWrapper>
          <DeleteOutlineIcon />
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

      <DialogActions sx={{ flexDirection: "column", p: 3, pt: 1, gap: 1.5 }}>
        <Button
          onClick={onConfirm}
          variant="contained"
          fullWidth
          disableElevation
          sx={{
            borderRadius: "8px",
            height: "44px",
            textTransform: "none",
            fontWeight: 600,
            backgroundColor: "#ef4444",
            "&:hover": {
              backgroundColor: "#dc2626",
            },
          }}
        >
          {confirmText}
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            borderRadius: "8px",
            height: "44px",
            color: "#64748b",
            borderColor: "#e2e8f0",
            textTransform: "none",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "#f8fafc",
              borderColor: "#cbd5e0",
            },
          }}
        >
          {cancelText}
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ConfirmDeleteDialog;
