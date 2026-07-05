import { Typography, IconButton, Box } from "@mui/material";
import { ChevronRight } from "lucide-react";
import { ViewDisplayMode } from "../../../hooks/useViewMode";

interface ViewModeHeaderProps {
  mode: ViewDisplayMode;
  onBack?: () => void;
}

const TITLE_BY_MODE: Record<ViewDisplayMode, string> = {
  create: "יצירת תצוגה חדשה",
  edit: "עריכת תצוגה",
  list: "תצוגות שמורות",
};

export function ViewModeHeader({ mode, onBack }: ViewModeHeaderProps) {
  const title = TITLE_BY_MODE[mode];
  const showBackButton = mode !== "list";

  return (
    <Box display="flex" alignItems="center" gap={1} mb={2}>
      {showBackButton && (
        <IconButton onClick={onBack} size="small" aria-label="Back">
          <ChevronRight size={20} strokeWidth={2.4} />
        </IconButton>
      )}

      <Typography variant="h6" sx={{ flex: 1 }}>
        {title}
      </Typography>
    </Box>
  );
}
