import React from "react";
import { Snackbar, Alert, Button, Box, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import HistoryIcon from "@mui/icons-material/History";

const StyledAlert = styled(Alert)(({ theme }) => ({
  backgroundColor: "#fff",
  color: theme.palette.text.primary,
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  padding: "8px 16px",
  "& .MuiAlert-icon": {
    color: theme.palette.primary.main,
    fontSize: "24px",
    alignItems: "center",
  },
  "& .MuiAlert-message": {
    padding: "4px 0",
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  "& .MuiAlert-action": {
    padding: 0,
    marginRight: 0,
  }
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
  message = "מצאנו טיוטה עם שינויים שלא נשמרו.",
}) => {
  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      sx={{ top: { xs: 16, sm: 24 } }}
    >
      <StyledAlert
        icon={<HistoryIcon />}
        severity="info"
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button 
              size="small" 
              onClick={onDiscard} 
              sx={{ 
                color: "#64748b", 
                fontWeight: 600,
                "&:hover": { backgroundColor: "#f1f5f9" } 
              }}
            >
              התעלם
            </Button>
            <Button 
              size="small" 
              variant="contained" 
              onClick={onRestore}
              sx={{ 
                borderRadius: "8px",
                textTransform: "none",
                fontWeight: 700,
                px: 2
              }}
            >
              שחזר טיוטה
            </Button>
          </Box>
        }
      >
        <Typography variant="body2" sx={{ fontWeight: 500, color: "#1e293b" }}>
          {message}
        </Typography>
      </StyledAlert>
    </Snackbar>
  );
};

export default DraftRecoveryBanner;
