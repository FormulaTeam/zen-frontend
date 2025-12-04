import { Box, Button, CircularProgress, IconButton, Typography, useTheme } from "@mui/material";
import React from "react";
import styled from "styled-components";
import { PERMISSION_TYPES } from "../../../utils/utils";
import { Edit } from "@mui/icons-material";

const Header = styled(Box)<{ backgroundColor: string }>`
  position: sticky;
  top: 0;
  zindex: 1000;
  background-color: ${({ backgroundColor }) => backgroundColor} !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1301;
`;

interface ResponseHeaderProps {
  formTitle: string;
  viewMode: boolean;
  permissionTypes: number[];
  saveIsLoading: boolean;
  onEdit: () => void;
  onBack: () => void;
  onSaveAndClose: () => void;
}

const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  formTitle,
  viewMode,
  permissionTypes,
  saveIsLoading,
  onEdit,
  onBack,
  onSaveAndClose,
}) => {
  const theme = useTheme();
  return (
    <Header p={2} backgroundColor={theme.palette.background.default}>
      {viewMode && permissionTypes.includes(PERMISSION_TYPES.EDIT_RESPONSE) && (
        <div className="edit-btn">
          <IconButton onClick={onEdit}>
            <Edit />
          </IconButton>
        </div>
      )}
      <Typography>{formTitle}</Typography>

      <Box gap={2} display="flex" justifyContent="flex-end">
        <Button onClick={onBack} variant="outlined">
          חזור
        </Button>
        {!viewMode && (
          <Button onClick={onSaveAndClose} variant="contained" disabled={saveIsLoading}>
            {saveIsLoading ? <CircularProgress size={20} /> : "שמור וסגור"}
          </Button>
        )}
      </Box>
    </Header>
  );
};

export default ResponseHeader;
