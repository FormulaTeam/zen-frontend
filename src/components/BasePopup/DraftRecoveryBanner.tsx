import React from "react";
import { Snackbar, Alert, Button, Box, Typography, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";

import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

const StyledAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: "#fff",
  color: theme.palette.text.primary,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  padding: "8px 16px",
  position: "relative",
  overflow: "visible",

  "& .MuiAlert-icon": {
    color: theme.palette.primary.main,
    fontSize: "24px",
    alignItems: "center",
  },

  "& .MuiAlert-message": {
    padding: "4px 32px 4px 0",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },

  "& .MuiAlert-action": {
    padding: "0 8px 0 0",
    marginRight: 0,
    display: "flex",
    alignItems: "center",
  },
}));

interface DraftRecoveryBannerProps {
  open: boolean;
  onRestore: () => void;
  onDiscard: () => void;
  message?: string;
}

const DraftRecoveryBanner: React.FC<DraftRecoveryBannerProps> = ({
  open,
  onRestore,
  onDiscard,
  message = "מצאנו טיוטה עם שינויים שלא נשמרו",
}) => {
  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ top: { xs: 16, sm: 24 } }}>
      <StyledAlert
        icon={<HistoryIcon />}
        severity="info"
        action={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Button
              size="small"
              variant="contained"
              onClick={onRestore}
              sx={{
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                px: 2,
                order: 1,
              }}>
              שחזר טיוטה
            </Button>
          </Box>
        }>
        <IconButton
          size="small"
          onClick={onDiscard}
          sx={{
            position: "absolute",
            top: -10,
            left: -10,

            width: 26,
            height: 26,
            padding: 0,

            color: "#64748b",
            backgroundColor: "#fff",
            border: "1px solid #e2e8f0",
            zIndex: 2,

            transition: "transform 120ms ease, background-color 120ms ease",
            transform: "scale(1)",

            "&:hover": {
              backgroundColor: "#f8fafc",
              transform: "scale(1.1)",
            },

            "& svg": {
              fontSize: 16,
            },
          }}>
          <CloseIcon fontSize="small" />
        </IconButton>

        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            color: "#1e293b",
            mr: "10px",
          }}>
          {message}
        </Typography>
      </StyledAlert>
    </Snackbar>
  );
};

export default DraftRecoveryBanner;
