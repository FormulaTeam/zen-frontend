import React from "react";
import { Box, Button, CircularProgress, IconButton, Typography } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { PERMISSION_TYPES } from "utils/utils";
import { useResponseStateContext } from "../context/ResponseStateProvider";

interface ResponseHeaderProps {
  viewMode: boolean;
  permissionTypes: number[];
  saveDisabled: boolean;
  onEdit: () => void;
  onBack: () => void;
  onSaveAndClose: () => void;
  isLoading: boolean;
}

const ResponseHeader: React.FC<ResponseHeaderProps> = ({
  viewMode,
  permissionTypes,
  saveDisabled,
  onEdit,
  onBack,
  onSaveAndClose,
  isLoading,
}) => {
  const { form } = useResponseStateContext();
  return (
    <Box className="response-header">
      {viewMode && permissionTypes.includes(PERMISSION_TYPES.EDIT_RESPONSE) && (
        <div className="edit-btn">
          <IconButton onClick={onEdit}>
            <Edit />
          </IconButton>
        </div>
      )}
      <Typography>{form?.name}</Typography>

      <Box gap={2} display="flex" justifyContent="flex-end">
        <Button onClick={onBack} variant="outlined">
          חזור
        </Button>
        {!viewMode && (
          <Button onClick={onSaveAndClose} variant="contained" disabled={saveDisabled || isLoading}>
            {saveDisabled ? <CircularProgress size={20} /> : "שמור וסגור"}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ResponseHeader;
