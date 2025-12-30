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

enum HebrewTitles {
  CANCEL = "ביטול",
  APPLY = "החלה",
  SAVE = "שמירה",
  SAVING = "שומר...",
  CREATE_VIEW = "יצירת תצוגה",
  UPDATE_VIEW = "עדכון תצוגה",
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
        {HebrewTitles.CANCEL}
      </Button>

      <Button variant="outlined" onClick={onApply} disabled={isSaving}>
        {HebrewTitles.APPLY}
      </Button>

      <Button
        disabled={!canSave}
        variant="contained"
        onClick={onSave}
        startIcon={isSaving ? <CircularProgress size={18} /> : null}>
        {isSaving
          ? HebrewTitles.SAVING
          : isCreatingNew
          ? HebrewTitles.CREATE_VIEW
          : HebrewTitles.UPDATE_VIEW}
      </Button>
    </ViewActionsContainer>
  );
};

export default ViewFormActions;
