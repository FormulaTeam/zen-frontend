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
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "540px",
    width: "calc(100% - 40px)",
    maxHeight: "min(620px, calc(100vh - 80px))",
    backgroundColor: "#ffffff",
    boxShadow: "0 20px 55px rgba(15, 23, 42, 0.18), 0 8px 22px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(() => ({
  position: "relative",
  padding: "28px 32px 12px",
}));

const CloseButton = styled(IconButton)(() => ({
  position: "absolute",
  right: "18px",
  top: "18px",
  color: "#64748b",
  padding: "6px",
  borderRadius: "10px",
  "&:hover": {
    backgroundColor: "rgba(100, 116, 139, 0.08)",
  },
  "& svg": {
    fontSize: "26px",
  },
}));

const HeaderText = styled(Box)(() => ({
  paddingInlineEnd: "42px",
}));

const TitleText = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: "1.28rem",
  lineHeight: 1.35,
  color: "#0f172a",
}));

const SubtitleText = styled(Typography)(() => ({
  marginTop: "8px",
  color: "#64748b",
  fontWeight: 400,
  fontSize: "0.96rem",
  lineHeight: 1.55,
}));

const Content = styled(DialogContent)(() => ({
  padding: "18px 32px 0",
  maxHeight: "280px",
  overflowY: "auto",
}));

const ErrorListItem = styled(ListItem)(({ theme }) => ({
  alignItems: "flex-start",
  padding: "14px 16px",
  marginBottom: "10px",
  backgroundColor: "#fffafa",
  borderRadius: "12px",
  border: "1px solid rgba(239, 68, 68, 0.26)",
  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.035)",
}));

const ErrorIconBox = styled(Box)(({ theme }) => ({
  width: "28px",
  height: "28px",
  borderRadius: "999px",
  backgroundColor: "rgba(239, 68, 68, 0.08)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: theme.palette.error.main,
  flexShrink: 0,
  "& svg": {
    fontSize: "21px",
  },
}));

const ErrorTitle = styled(Typography)(() => ({
  fontWeight: 650,
  fontSize: "0.98rem",
  lineHeight: 1.45,
  color: "#dc2626",
  wordBreak: "break-word",
}));

const ErrorDescription = styled(Typography)(() => ({
  marginTop: "4px",
  fontWeight: 400,
  fontSize: "0.9rem",
  lineHeight: 1.5,
  color: "#dc2626",
  opacity: 0.82,
  wordBreak: "break-word",
}));

const Actions = styled(DialogActions)(() => ({
  padding: "30px 32px 30px",
  gap: "10px",
  justifyContent: "flex-end",
}));

const CancelButton = styled(Button)(() => ({
  minWidth: "92px",
  height: "40px",
  borderRadius: "9px",
  fontSize: "0.95rem",
  fontWeight: 700,
  textTransform: "none",
  color: "#0f172a",
  borderColor: "#d8e2ef",
  backgroundColor: "#ffffff",
  boxShadow: "none",
  "&:hover": {
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    boxShadow: "none",
  },
}));

const ContinueButton = styled(Button)(({ theme }) => ({
  minWidth: "98px",
  height: "40px",
  borderRadius: "9px",
  fontSize: "0.95rem",
  fontWeight: 700,
  textTransform: "none",
  backgroundColor: theme.palette.primary.main,
  boxShadow: "none",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: "none",
  },
}));

export type ValidationError =
  | string
  | {
      fieldName?: string;
      message: string;
      detail?: string | null;
      validationDetail?: string | null;
      description?: string | null;
    };

interface ValidationErrorsDialogProps {
  open: boolean;
  onClose: () => void;
  errors: ValidationError[];
  title?: string;
  subtitle?: string;
  onCancel?: () => void;
  onContinue?: () => void;
  cancelText?: string;
  continueText?: string;
}

const getErrorParts = (error: ValidationError) => {
  if (typeof error === "string") {
    return {
      fieldName: null,
      message: error,
      detail: null,
    };
  }

  return {
    fieldName: error.fieldName ?? null,
    message: error.message,
    detail: error.detail ?? error.validationDetail ?? error.description ?? null,
  };
};

export const ValidationErrorsDialog: React.FC<ValidationErrorsDialogProps> = ({
  open,
  onClose,
  errors,
  title = "נמצאו שגיאות בטופס",
  subtitle = "יש לתקן את השדות הבאים לפני שמירה:",
  onCancel,
  onContinue,
  cancelText = "בטל",
  continueText = "המשך",
}) => {
  const handleCancel = onCancel ?? onClose;
  const handleContinue = onContinue ?? onClose;

  return (
    <StyledDialog open={open} onClose={onClose} scroll="paper">
      <StyledDialogTitle>
        <CloseButton aria-label="close" onClick={onClose}>
          <CloseIcon />
        </CloseButton>

        <HeaderText>
          <TitleText>{title}</TitleText>
          <SubtitleText>{subtitle}</SubtitleText>
        </HeaderText>
      </StyledDialogTitle>

      <Content>
        <List sx={{ p: 0 }}>
          {errors.map((error, index) => {
            const { fieldName, message, detail } = getErrorParts(error);

            return (
              <ErrorListItem key={index}>
                <ListItemIcon
                  sx={{
                    minWidth: "38px",
                    mt: "1px",
                  }}>
                  <ErrorIconBox>
                    <InfoOutlinedIcon />
                  </ErrorIconBox>
                </ListItemIcon>

                <ListItemText
                  sx={{ m: 0 }}
                  primary={
                    <Box>
                      <ErrorTitle>
                        {fieldName && (
                          <Box
                            component="span"
                            sx={{
                              fontWeight: 750,
                              marginInlineEnd: "4px",
                            }}>
                            {fieldName}:
                          </Box>
                        )}
                        {message}
                      </ErrorTitle>

                      {detail && <ErrorDescription>{detail}</ErrorDescription>}
                    </Box>
                  }
                />
              </ErrorListItem>
            );
          })}
        </List>
      </Content>

      <Actions>
        <CancelButton onClick={handleCancel} variant="outlined" disableElevation>
          {cancelText}
        </CancelButton>

        <ContinueButton onClick={handleContinue} variant="contained" disableElevation>
          {continueText}
        </ContinueButton>
      </Actions>
    </StyledDialog>
  );
};

export default ValidationErrorsDialog;
