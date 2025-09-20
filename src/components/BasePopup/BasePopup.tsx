import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface ButtonConfig {
  text: string;
  onClick: () => void;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "error" | "success" | "info" | "warning";
  disabled?: boolean;
}

interface BasePopupProps {
  open: boolean;
  onClose?: () => void;
  title?: string;
  content?: React.ReactNode;
  image?: string;
  mainButton?: ButtonConfig;
  cancelButton?: ButtonConfig;
  minHeight?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
}

const BasePopup: React.FC<BasePopupProps> = ({
  open,
  onClose,
  title,
  content,
  image,
  mainButton,
  cancelButton,
  minHeight,
  minWidth,
  maxWidth,
}) => {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          minHeight: minHeight,
          minWidth: minWidth,
          maxWidth: maxWidth,
        }
      }}
    >
      {onClose !== undefined && (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          }}>
          <CloseIcon />
        </IconButton>
      )}

      {/* Image positioned at the top center */}
      {image && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
          }}>
          <img
            src={image}
            style={{
              width: 135,
              height: 135,
              objectFit: "contain",
            }}
          />
        </Box>
      )}

      {title && (
        <DialogTitle sx={{ textAlign: "center" }}>
          <Typography fontWeight={600} fontSize="24px">
            {title}
          </Typography>
        </DialogTitle>
      )}

      <DialogContent sx={{ padding: 2, textAlign: "center" }}>
        {content && (
          <Typography variant="body1" fontSize="24px">
            {content}
          </Typography>
        )}
      </DialogContent>

      {(mainButton || cancelButton) && (
        <DialogActions
          sx={{
            justifyContent: "center",
            gap: 2,
          }}>
          {cancelButton && (
            <Button
              variant={cancelButton.variant || "contained"}
              onClick={cancelButton.onClick}
              disabled={cancelButton.disabled}
              disableElevation
              sx={{
                backgroundColor: theme.palette.secondary.main,
                color: theme.palette.text.primary,
                padding: "4px 24px",
              }}>
              {cancelButton.text}
            </Button>
          )}
          {mainButton && (
            <Button
              variant={mainButton.variant || "contained"}
              onClick={mainButton.onClick}
              disabled={mainButton.disabled}
              disableElevation
              color={mainButton.color || "primary"}
              sx={{
                padding: "4px 24px",
              }}>
              {mainButton.text}
            </Button>
          )}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default BasePopup;
