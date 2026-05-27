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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    padding: theme.spacing(1),
    maxWidth: "460px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
  },
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(4, 2, 2),
  textAlign: "center",
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "72px",
  height: "72px",
  borderRadius: "24px",
  backgroundColor: "rgba(245, 158, 11, 0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(3),
  "& svg": {
    fontSize: "44px",
    color: "#f59e0b",
  },
}));

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
  message = "יש לך שינויים שלא נשמרו",
}) => {
  return (
    <StyledDialog open={open} onClose={onClose}>
      <Box sx={{ position: "absolute", right: 16, top: 16 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: "#64748b" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Header>
        <IconWrapper>
          <WarningAmberIcon />
        </IconWrapper>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#020618", mb: 1.5 }}>
          {title}
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "#475569", fontWeight: 500, lineHeight: 1.6, px: 2 }}>
          {message}
        </Typography>
      </Header>

      <DialogActions sx={{ flexDirection: "column", gap: 1.5, p: 3, pt: 2 }}>
        <Button
          onClick={onSave}
          variant="contained"
          fullWidth
          sx={{
            backgroundColor: "#020618",
            color: "#fff",
            borderRadius: "10px",
            height: "48px",
            fontSize: "1rem",
            fontWeight: 700,
            textTransform: "none",
            "&:hover": {
              backgroundColor: "#1e293b",
            },
          }}>
          שמירה ויציאה
        </Button>

        <Box sx={{ display: "flex", gap: 1.5, width: "100%" }}>
          <Button
            onClick={onDiscard}
            variant="outlined"
            fullWidth
            sx={{
              borderColor: "#e2e8f0",
              color: "#ef4444",
              borderRadius: "10px",
              height: "44px",
              fontSize: "0.95rem",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                borderColor: "#ef4444",
                backgroundColor: "rgba(239, 68, 68, 0.04)",
              },
            }}>
            יציאה ללא שמירה
          </Button>

          <Button
            onClick={onClose}
            variant="text"
            fullWidth
            sx={{
              color: "#64748b",
              borderRadius: "10px",
              height: "44px",
              fontSize: "0.95rem",
              fontWeight: 600,
              textTransform: "none",
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
            }}>
            ביטול
          </Button>
        </Box>
      </DialogActions>
    </StyledDialog>
  );
};

export default UnsavedChangesDialog;
