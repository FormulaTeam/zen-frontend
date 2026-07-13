import React from "react";
import { Box, Typography, Stack, Button, CircularProgress } from "@mui/material";
import { XCircle, RotateCcw } from "lucide-react";

interface RecycleBinSelectionBarProps {
  selectedCount: number;
  activeTab: number;
  isBulkRestoring: boolean;
  onClearSelection: () => void;
  onBulkRestore: () => void;
}

const RecycleBinSelectionBar: React.FC<RecycleBinSelectionBarProps> = ({
  selectedCount,
  activeTab,
  isBulkRestoring,
  onClearSelection,
  onBulkRestore,
}) => {
  if (selectedCount === 0) return null;

  return (
    <Box
      sx={{
        position: "fixed",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "auto",
        minWidth: 500,
        bgcolor: "#F1F5F9",
        border: "1px solid #E2E8F0",
        borderRadius: "4px",
        p: 1.5,
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)",
        zIndex: 1000,
      }}
    >
      <Typography sx={{ color: "#020618", fontWeight: 500, fontSize: "14px", mr: 4 }}>
        {selectedCount} פריטים נבחרו
      </Typography>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          variant="text"
          onClick={onClearSelection}
          startIcon={<XCircle size={18} />}
          sx={{
            bgcolor: "#ffffff",
            color: "#0F172B",
            border: "1px solid #E2E8F0",
            borderRadius: "4px",
            height: "32px",
            fontWeight: 500,
            fontSize: "14px",
            textTransform: "none",
            gap: 1,
            boxShadow: "0px 1px 1px rgba(0, 0, 0, 0.05)",
            "&:hover": { bgcolor: "#f8fafc", borderColor: "#cbd5e1" },
          }}
        >
          ביטול בחירה
        </Button>

        <Button
          variant="contained"
          disabled={isBulkRestoring}
          onClick={onBulkRestore}
          startIcon={isBulkRestoring ? <CircularProgress size={18} color="inherit" /> : <RotateCcw size={18} />}
          sx={{
            bgcolor: "primary.main",
            borderRadius: "4px",
            height: "32px",
            fontWeight: 500,
            fontSize: "14px",
            textTransform: "none",
            gap: 1,
            "&:hover": { bgcolor: "primary.dark" },
          }}
        >
          שחזור {activeTab === 0 ? "טפסים" : "תגובות"}
        </Button>
      </Stack>
    </Box>
  );
};

export default RecycleBinSelectionBar;
