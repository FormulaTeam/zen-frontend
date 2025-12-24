import React from "react";
import { Typography, IconButton, Box } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { ViewDisplayMode } from "../../hooks/useViewMode";
import { ArrowBackIos } from "@mui/icons-material";

interface ViewModeHeaderProps {
  mode: ViewDisplayMode;
  onBack: () => void;
}

const ViewModeHeader: React.FC<ViewModeHeaderProps> = ({ mode, onBack }) => {
  const getTitle = () => {
    switch (mode) {
      case "create":
        return "יצירת תצוגה חדשה";
      case "edit":
        return "עריכת תצוגה";
      default:
        return "";
    }
  };

  const showBackButton = mode !== "list";

  return (
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      <Typography variant="h6" gutterBottom sx={{ mb: 0, flex: 1 }}>
        {getTitle()}
      </Typography>{" "}
      {showBackButton && (
        <IconButton onClick={onBack} size="small" sx={{ mr: 1 }}>
          <ArrowBackIos />
        </IconButton>
      )}
    </Box>
  );
};

export default ViewModeHeader;
