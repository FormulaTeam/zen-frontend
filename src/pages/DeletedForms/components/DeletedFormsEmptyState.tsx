import React from "react";
import { Box, Typography, Button } from "@mui/material";
import trashRobot from "../../../images/trash_robot.png";
import notFoundRobot from "../../../images/not_found_trash_robot.png";

interface DeletedFormsEmptyStateProps {
  hasFilters: boolean;
  onClearFilters: () => void;
}

const DeletedFormsEmptyState: React.FC<DeletedFormsEmptyStateProps> = ({
  hasFilters,
  onClearFilters,
}) => (
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
    }}>
    <Box sx={{ mb: 2 }}>
      <img
        src={hasFilters ? notFoundRobot : trashRobot}
        alt={hasFilters ? "לא נמצאו תוצאות" : "סל מחזור ריק"}
        style={{ width: hasFilters ? "220px" : "250px", height: "auto" }}
      />
    </Box>
    <Typography sx={{ fontWeight: 700, color: "#0F172B", mb: 1, fontFamily: "Heebo" }}>
      {hasFilters ? "לא נמצאו פריטים תואמים" : "סל המחזור ריק"}
    </Typography>
    <Typography sx={{ color: "#62748E", mb: 3, maxWidth: "320px", fontFamily: "Heebo" }}>
      {hasFilters
        ? "כדאי לשנות את מילות החיפוש או לנקות מסננים כדי להניב תוצאות"
        : "כל הפריטים שימחקו יופיעו כאן ויהיו זמינים לשחזור"}
    </Typography>
    {hasFilters && (
      <Button
        variant="outlined"
        onClick={onClearFilters}
        sx={{
          borderColor: "#E2E8F0",
          color: "#0F172B",
          borderRadius: "4px",
          px: 3,
          fontWeight: 600,
          fontSize: "13px",
          "&:hover": { borderColor: "#cbd5e1", bgcolor: "#f8fafc" },
        }}>
        ניקוי כל המסננים
      </Button>
    )}
  </Box>
);

export default DeletedFormsEmptyState;
