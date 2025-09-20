import React from "react";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { PopoverContainer, MessageText, ButtonContainer } from "./styled";

interface ConfirmationPopoverProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: "error" | "primary" | "secondary" | "success" | "info" | "warning";
}

const ConfirmationPopover: React.FC<ConfirmationPopoverProps> = ({
  open,
  anchorEl,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "אישור",
  cancelText = "ביטול",
  confirmColor = "error",
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}>
      <PopoverContainer>
        {title && (
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            {title}
          </Typography>
        )}
        <MessageText variant="body2" color="text.secondary">
          {message}
        </MessageText>
        <ButtonContainer>
          <Button size="small" onClick={onClose} variant="outlined">
            {cancelText}
          </Button>
          <Button size="small" onClick={handleConfirm} variant="contained" color={confirmColor}>
            {confirmText}
          </Button>
        </ButtonContainer>
      </PopoverContainer>
    </Popover>
  );
};

export default ConfirmationPopover;
