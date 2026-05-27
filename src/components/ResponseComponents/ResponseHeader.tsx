import { Box, Button, CircularProgress, IconButton, Tooltip, Typography, useTheme } from "@mui/material";
import React from "react";
import styled from "styled-components";
import { permission } from "formula-gear";
import { Edit } from "@mui/icons-material";

const Header = styled(Box) <{ backgroundColor: string }>`
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

const HeaderCenter = styled(Box)`
  flex: 2;
  display: flex;
  justify-content: center;
  align-items: center;
`;

interface ResponseHeaderProps {
  formTitle: string;
  viewMode: boolean;
  permissionTypes: number[];
  saveDisabled: boolean;
  onEdit: () => void;
  onBack: () => void;
  onSaveAndClose: () => void;
}

const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  formTitle,
  viewMode,
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

  return (
    <Header px={3} py={1} backgroundColor={theme.palette.background.default}>
      <HeaderSection>
        {viewMode && canEdit && (
          <Tooltip title="עריכת תגובה">
            <IconButton onClick={onEdit} color="primary" size="small">
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
      </HeaderSection>

      <HeaderCenter>
        <Typography variant="h6" sx={{ fontWeight: 600, fontSize: "1.1rem" }}>
          {formTitle}
        </Typography>
      </HeaderCenter>

      <HeaderSection sx={{ justifyContent: "flex-end", gap: 1.5 }}>
        <Button onClick={onBack} variant="outlined" size="small" sx={{ borderRadius: "8px" }}>
          חזרה
        </Button>
        {!viewMode && (
          <Button
            onClick={onSaveAndClose}
            variant="contained"
            disabled={saveDisabled}
            size="small"
            sx={{ borderRadius: "8px", minWidth: "120px" }}
          >
            {saveDisabled ? <CircularProgress size={20} color="inherit" /> : "שמירה"}
          </Button>
        )}
      </HeaderSection>
    </Header>
  );
};

export default ResponseHeader;
