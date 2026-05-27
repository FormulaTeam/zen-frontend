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
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

const StyledDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    padding: theme.spacing(1),
    maxWidth: "500px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
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
  borderRadius: "20px",
  backgroundColor: "rgba(239, 68, 68, 0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  "& svg": {
    fontSize: "40px",
    color: "#ef4444",
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
  subtitle? ,
}) => {
  return (
    <StyledDialog open={open} onClose={onClose} scroll="paper">
      <Box sx={{ position: "absolute", right: 16, top: 16 }}>
        <IconButton onClick={onClose} size="small" sx={{ color: "#64748b" }}>
          <CloseIcon />
        </IconButton>
      </Box>

      <ErrorHeader>
        <IconWrapper>
          <ErrorOutlineIcon />
        </IconWrapper>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "#020618", mb: 0.5 }}>
          {title}
        </Typography>
        subtitle && {
        <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
          {subtitle}
        </Typography>}
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
                  py: 1,
                  mb: 1,
                  backgroundColor: "rgba(239, 68, 68, 0.02)",
                  borderRadius: "10px",
                  border: "1px solid rgba(239, 68, 68, 0.08)",
                }}>
                <ListItemIcon sx={{ minWidth: "36px" }}>
                  <WarningAmberIcon sx={{ fontSize: "20px", color: "#ef4444" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#020618" }}>
                      {field && (
                        <Box component="span" sx={{ color: "#ef4444", mr: 0.5 }}>
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
      <DialogActions sx={{ justifyContent: "center", p: 3, pt: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          fullWidth
          sx={{
            borderColor: "#020618",
            color: "#020618",
            borderRadius: "10px",
            height: "44px",
            fontSize: "1rem",
            fontWeight: 700,
            textTransform: "none",

            "&:hover": {
              borderColor: "#1e293b",
              backgroundColor: "rgba(2, 6, 24, 0.06)",
            },
          }}>
          חזרה לתיקון השדות
        </Button>
      </DialogActions>
    </StyledDialog>
  );
};

export default ValidationErrorsDialog;
