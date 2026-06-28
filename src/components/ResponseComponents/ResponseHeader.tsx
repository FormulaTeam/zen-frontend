import { Box, CircularProgress, Tooltip, Typography } from "@mui/material";
import React from "react";
import { permission } from "formula-gear";
import { Edit } from "@mui/icons-material";
import { Save } from "lucide-react";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
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
        <Typography variant="h5" sx={{ fontSize: "1.5rem" }}>
          <Box component="span" sx={{ fontWeight: 400, color: "#64748b" }}>
            {formTitle}
          </Box>
          <Box component="span" sx={{ mx: 2, color: "#020618", fontWeight: 400 }}>
            ←
          </Box>
          <Box component="span" sx={{ fontWeight: 700, color: "#020618" }}>
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
                <Save size={22} strokeWidth={2.4} />
              )
            }
            sx={{ minWidth: "120px", px: 3 }}>
            שמירה
          </HeaderButton>
        )}

        <HeaderButton onClick={onBack} size="small" sx={{ minWidth: "50px", p: 0 }}>
          <LogoutRoundedIcon sx={{ fontSize: "28px" }} />
        </HeaderButton>
      </HeaderSection>
    </Header>
  );
};

export default ResponseHeader;
