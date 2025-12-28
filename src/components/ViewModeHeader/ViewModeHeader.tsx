import React from "react";
import { Typography, IconButton, Box } from "@mui/material";
import { ViewDisplayMode } from "../../hooks/useViewMode";
import { ArrowForwardIos } from "@mui/icons-material";

interface ViewModeHeaderProps {
  mode: ViewDisplayMode;
  onBack: () => void;
}

const TITLE_BY_MODE: Record<ViewModeHeaderProps["mode"], string> = {
  create: "יצירת תצוגה חדשה",
  edit: "עריכת תצוגה",
  list: "",
};

const ViewModeHeader: React.FC<ViewModeHeaderProps> = ({ mode, onBack }) => {
  const title = TITLE_BY_MODE[mode];
  const showBackButton = mode !== "list";

  return (
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      {showBackButton && (
        <IconButton onClick={onBack} size="small" aria-label="Back">
          <ArrowForwardIos />
        </IconButton>
      )}

      <Typography variant="h6" sx={{ flex: 1 }}>
        {title}
      </Typography>
    </Box>
  );
};

export default ViewModeHeader;
