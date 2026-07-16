import React from "react";
import {
  Dialog,
  DialogContent,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
} from "@mui/material";
import { X, RotateCcw, MessageSquareOff } from "lucide-react";

interface RestoreFormDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (restoreResponses: boolean) => void;
  responseCount: number;
  isBulk?: boolean;
  selectedCount?: number;
}

const RestoreFormDialog: React.FC<RestoreFormDialogProps> = ({
  open,
  onClose,
  onConfirm,
  responseCount,
  isBulk,
  selectedCount,
}) => {
  const title = isBulk ? `שחזור ${selectedCount} טפסים` : "שחזור טופס";
  const description = isBulk
    ? `הטפסים שנבחרו כוללים ${responseCount} תגובות שנמחקו איתם. האם לשחזר גם אותן?`
    : `הטופס כלל ${responseCount} תגובות. האם לשחזר גם אותן?`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: "4px",
          bgcolor: "#f1f5f9",
          border: "1px solid #e2e8f0",
          boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1), 0px 4px 6px -2px rgba(0,0,0,0.05)",
          maxWidth: "550px",
          width: "100%",
          p: 0,
        },
      }}>
      <Box sx={{ position: "relative", p: 3 }}>
        <IconButton
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: "#62748e",
            "&:hover": { bgcolor: "rgba(0,0,0,0.04)" },
          }}>
          <X size={18} />
        </IconButton>

        <Stack spacing={1} sx={{ mb: 4, alignItems: "center" }}>
          <Typography
            sx={{
              fontFamily: "Heebo, sans-serif",
              fontWeight: 600,
              fontSize: "20px",
              color: "#020618",
              textAlign: "center",
            }}>
            {title}
          </Typography>
          <Typography
            sx={{
              fontFamily: "Heebo, sans-serif",
              fontWeight: 400,
              fontSize: "16px",
              color: "#62748e",
              textAlign: "center",
            }}>
            {description}
          </Typography>
        </Stack>

        <Stack direction="row-reverse" spacing={1.5} justifyContent="center">
          <Button
            onClick={() => onConfirm(true)}
            variant="contained"
            startIcon={<RotateCcw size={18} />}
            sx={{
              bgcolor: "#1e88e5",
              color: "#f8fafc",
              borderRadius: "4px",
              fontWeight: 500,
              fontSize: "14px",
              height: "36px",
              px: 2,
              textTransform: "none",
              boxShadow: "none",
              gap: 1,
              "&:hover": { bgcolor: "#1976d2", boxShadow: "none" },
            }}>
            שחזור הטופס והתגובות
          </Button>

          <Button
            onClick={() => onConfirm(false)}
            variant="outlined"
            startIcon={<MessageSquareOff size={18} />}
            sx={{
              bgcolor: "#ffffff",
              color: "#0f172b",
              border: "1px solid #e2e8f0",
              borderRadius: "4px",
              fontWeight: 500,
              fontSize: "14px",
              height: "36px",
              px: 2,
              textTransform: "none",
              boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
              gap: 1,
              "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
            }}>
            שחזור ללא תגובות
          </Button>
        </Stack>
      </Box>
    </Dialog>
  );
};

export default RestoreFormDialog;
