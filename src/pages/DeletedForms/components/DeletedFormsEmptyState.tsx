import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { SearchX } from "lucide-react";

interface DeletedFormsEmptyStateProps {
  onClearFilters: () => void;
}

const DeletedFormsEmptyState: React.FC<DeletedFormsEmptyStateProps> = ({ onClearFilters }) => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 8,
      textAlign: "center",
      backgroundColor: "#ffffff",
      borderRadius: "8px",
      border: "1px dashed #E2E8F0",
      marginTop: 4,
    }}
  >
    <Box sx={{ color: "#94A3B8", mb: 2 }}>
      <SearchX size={48} strokeWidth={1.5} />
    </Box>
    <Typography sx={{ fontWeight: 700, color: "#0F172B", mb: 1, fontFamily: "Heebo" }}>
      לא נמצאו פריטים תואמים
    </Typography>
    <Typography sx={{ color: "#62748E", mb: 3, maxWidth: "320px", fontFamily: "Heebo" }}>
      נסו לשנות את מילות החיפוש או לנקות את המסננים כדי לראות עוד תוצאות.
    </Typography>
    <Button
      variant="outlined"
      onClick={onClearFilters}
      sx={{
        borderColor: "#E2E8F0",
        color: "#0F172B",
        borderRadius: "4px",
        px: 3,
        fontWeight: 600,
        "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
      }}
    >
      ניקוי מסננים
    </Button>
  </Box>
);

export default DeletedFormsEmptyState;
