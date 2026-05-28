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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "12px",
    maxWidth: "500px",
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

export type ValidationError =
  | string
  | {
      fieldName?: string;
      message: string;
    };

interface ValidationErrorsDialogProps {
  open: boolean;
  onClose: () => void;
  errors: ValidationError[];
  title?: string;
  subtitle?: string;
}

export const ValidationErrorsDialog: React.FC<ValidationErrorsDialogProps> = ({
  open,
  onClose,
  errors,
  title = "נמצאו שגיאות בטופס",
  subtitle = "יש לתקן את השדות הבאים לפני שמירה:",
}) => {
  const theme = useTheme();

  return (
    <StyledDialog open={open} onClose={onClose} scroll="paper">
      <StyledDialogTitle>
        <IconWrapper>
          <ErrorOutlineIcon />
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

      <DialogContent dividers sx={{ borderBottom: "none", py: 2 }}>
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500, mb: 2, px: 1 }}>
          {subtitle}
        </Typography>
        <List sx={{ pt: 0 }}>
          {errors.map((error, index) => {
            const message = typeof error === "string" ? error : error.message;
            const field = typeof error === "object" ? error.fieldName : null;

            return (
              <ListItem
                key={index}
                sx={{
                  px: 2,
                  py: 1,
                  mb: 1,
                  backgroundColor: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}>
                <ListItemIcon sx={{ minWidth: "32px" }}>
                  <WarningAmberIcon sx={{ fontSize: "18px", color: theme.palette.error.main }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {field && (
                        <Box component="span" sx={{ color: theme.palette.error.main, mr: 0.5 }}>
                          {field}:
                        </Box>
                      )}
                      {message}
                    </Typography>
                  }
                />
              </ListItem>
            );
          })}
        </List>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          fullWidth
          sx={{
            borderRadius: "8px",
            height: "44px",
            fontSize: "1rem",
            fontWeight: 600,
            textTransform: "none",
            backgroundColor: theme.palette.primary.main,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          }}>
          חזרה לתיקון
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ValidationErrorsDialog;
