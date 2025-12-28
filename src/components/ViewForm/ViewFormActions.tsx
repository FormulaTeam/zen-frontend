import React from "react";
import { Button, CircularProgress } from "@mui/material";
import { ViewActionsContainer } from "../ViewManager/styled";

interface Props {
  isSaving: boolean;
  isCreatingNew: boolean;
  canSave: boolean;
  onCancel: () => void;
  onApply: () => void;
  onSave: () => void;
}

const ViewFormActions: React.FC<Props> = ({
  isSaving,
  isCreatingNew,
  canSave,
  onCancel,
  onApply,
  onSave,
}) => {
  return (
    <ViewActionsContainer>
      <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
        ביטול
      </Button>

      <Button variant="outlined" onClick={onApply} disabled={isSaving}>
        החל
      </Button>

      <Button
        variant="contained"
        onClick={onSave}
        disabled={!canSave}
        startIcon={isSaving ? <CircularProgress size={18} /> : null}>
        {isSaving ? "שומר..." : isCreatingNew ? "צור תצוגה" : "עדכן תצוגה"}
      </Button>
    </ViewActionsContainer>
  );
};

export default ViewFormActions;
