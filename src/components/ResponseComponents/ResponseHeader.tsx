import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import React from "react";
import styled from "styled-components";
import { permission } from "formula-gear";
import { Edit, ChevronLeft as ChevronLeftIcon } from "@mui/icons-material";
import saveIcon from "../../icons/save-icon.png";

const Header = styled(Box)<{ backgroundColor: string }>`
  position: sticky;
  top: 0;
  background-color: ${({ backgroundColor }) => backgroundColor} !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1100;
  min-height: 64px;
  border-bottom: 1px solid #e2e8f0;
`;

const HeaderSection = styled(Box)`
  flex: 1;
  display: flex;
  align-items: center;
`;

const HeaderButton = styled(Button)`
  background-color: #ffffff !important;
  color: #1a1a24 !important;
  border: none !important;
  border-radius: 10px !important;
  font-weight: 600 !important;
  text-transform: none !important;
  height: 42px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03) !important;
  display: flex;
  align-items: center;
  transition: all 0.2s ease-in-out !important;
  padding: 0 16px !important;

  &:hover {
    background-color: #ffffff !important;
  }

  &.Mui-disabled {
    background-color: #f8fafc !important;
    color: #94a3b8 !important;
    box-shadow: none !important;
  }

  & .MuiButton-startIcon {
    margin-left: 10px;
    margin-right: -4px;
  }
`;

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
    <Header px={3} py={1} backgroundColor={theme.palette.background.default}>
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
