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
    padding: theme.spacing(1),
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },
}));

const ErrorHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  padding: theme.spacing(3, 2, 2),
  textAlign: "center",
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  width: "64px",
  height: "64px",
  borderRadius: "12px",
  backgroundColor: theme.palette.error.main + "14", // 8% opacity
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  "& svg": {
    fontSize: "36px",
    color: theme.palette.error.main,
  },
}));

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
      <Box sx={{ position: "absolute", right: 16, top: 16 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: "#94a3b8" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <ErrorHeader>
        <IconWrapper>
          <ErrorOutlineIcon />
        </IconWrapper>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
          {subtitle}
        </Typography>
      </ErrorHeader>

      <DialogContent sx={{ py: 0 }}>
        <List sx={{ pt: 1 }}>
          {errors.map((error, index) => {
            const message = typeof error === "string" ? error : error.message;
            const field = typeof error === "object" ? error.fieldName : null;

            return (
              <ListItem
                key={index}
                sx={{
                  px: 2,
                  py: 1.5,
                  mb: 1.5,
                  backgroundColor: "#f8fafc",
                  borderRadius: "10px",
                  border: "1.5px solid #e2e8f0",
                }}>
                <ListItemIcon sx={{ minWidth: "36px" }}>
                  <WarningAmberIcon sx={{ fontSize: "20px", color: theme.palette.error.main }} />
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

      <DialogActions sx={{ justifyContent: "center", p: 3, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          disableElevation
          fullWidth
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            borderRadius: "8px",
            height: "44px",
            fontSize: "1rem",
            fontWeight: 700,
            textTransform: "none",
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
