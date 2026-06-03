import {
  Box,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import { permission } from "formula-gear";
import { Edit, ChevronLeft as ChevronLeftIcon } from "@mui/icons-material";
import saveIcon from "../../icons/save-icon.png";
import { Header, HeaderSection, HeaderButton } from "../../pages/Response/styled";

interface ResponseHeaderProps {
  formTitle: string;
  viewMode: boolean;
  isEdit?: boolean;
  isCopy?: boolean;
  permissionTypes: number[];
  saveDisabled: boolean;
  onEdit: () => void;
  onBack: () => void;
  onSaveAndClose: () => void;
}

const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  formTitle,
  viewMode,
  isEdit,
  isCopy,
  permissionTypes,
  saveDisabled,

  onEdit,
  onBack,
  onSaveAndClose,
}) => {
  const theme = useTheme();

  const canEdit =
    permissionTypes.includes(permission.UpdateAnyResponse) ||
    permissionTypes.includes(permission.UpdateMyResponse);

  const modeLabel = viewMode
    ? "תצוגת תגובה"
    : isCopy
      ? "שכפול תגובה"
      : isEdit
        ? "עריכת תגובה"
        : "תגובה חדשה";

  return (
    <Header>
      <HeaderSection sx={{ gap: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem", color: "#020618" }}>
          {formTitle}
          <Box component="span" sx={{ mx: 1.5, color: "#94a3b8", fontWeight: 400 }}>
            ←
          </Box>
          <Box component="span" sx={{ fontWeight: 500, color: "#475569" }}>
            {modeLabel}
          </Box>
        </Typography>
      </HeaderSection>

      <HeaderSection sx={{ justifyContent: "flex-end", gap: 2 }}>
        {viewMode ? (
          canEdit && (
            <Tooltip title="עריכת תגובה">
              <HeaderButton onClick={onEdit} size="small" sx={{ minWidth: "50px", p: 0 }}>
                <Edit sx={{ fontSize: "22px" }} />
              </HeaderButton>
            </Tooltip>
          )
        ) : (
          <HeaderButton
            onClick={onSaveAndClose}
            disabled={saveDisabled}
            size="small"
            startIcon={
              saveDisabled ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <img src={saveIcon} style={{ width: 22, height: 22 }} alt="save" />
              )
            }
            sx={{ minWidth: "120px", px: 3 }}>
            שמירה
          </HeaderButton>
        )}
        <HeaderButton onClick={onBack} size="small" sx={{ minWidth: "50px", p: 0 }}>
          <ChevronLeftIcon sx={{ fontSize: "28px" }} />
        </HeaderButton>
      </HeaderSection>
    </Header>
  );
};

export default ResponseHeader;
