import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack, Typography, IconButton } from "@mui/material";
import { Trash2, LogOut } from "lucide-react";

const RecycleBinHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ py: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box sx={{ color: "#0F172B", display: "flex", alignItems: "center" }}>
          <Trash2 size={28} strokeWidth={2.2} />
        </Box>
        <Typography
          variant="h5"
          sx={{ fontWeight: 700, color: "#0F172B", fontFamily: "Heebo, sans-serif", lineHeight: 1 }}
        >
          סל מחזור
        </Typography>
      </Stack>

      <IconButton
        onClick={() => navigate("/forms")}
        sx={{
          width: "50px",
          height: "50px",
          bgcolor: "#ffffff",
          borderRadius: "10px",
          color: "#1a1a24",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
          "&:hover": { bgcolor: "#ffffff", boxShadow: "0 6px 12px rgba(15, 23, 42, 0.08)" },
        }}
      >
        <LogOut size={24} strokeWidth={2.4} />
      </IconButton>
    </Box>
  );
};

export default RecycleBinHeader;
