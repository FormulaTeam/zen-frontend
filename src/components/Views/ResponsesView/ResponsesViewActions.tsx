import { Button, CircularProgress } from "@mui/material";
import { ViewActionsContainer } from "../ViewManager/styled";

interface ResponsesViewActionsProps {
  isSaving: boolean;
  isCreatingNew: boolean;
  canSave: boolean;
  onCancel: () => void;
  onApply: () => void;
  onSave: () => void;
}

enum HebrewTitles {
  CANCEL = "ביטול",
  APPLY = "החל",
  SAVE = "שמירה",
  SAVING = "שומר...",
  CREATE_VIEW = "יצירת תצוגה",
  UPDATE_VIEW = "עדכון תצוגה",
}

export function ResponsesViewFormActions({
  isSaving,
  isCreatingNew,
  canSave,
  onCancel,
  onApply,
  onSave,
}: ResponsesViewActionsProps) {
  return (
    <ViewActionsContainer>
      <Button variant="outlined" onClick={onCancel} disabled={isSaving}>
        {HebrewTitles.CANCEL}
      </Button>

      <Button variant="outlined" onClick={onApply} disabled={isSaving}>
        {HebrewTitles.APPLY}
      </Button>

      <Button
        variant="contained"
        onClick={onSave}
        disabled={!canSave || isSaving}
        startIcon={isSaving ? <CircularProgress size={18} /> : null}>
        {isSaving
          ? HebrewTitles.SAVING
          : isCreatingNew
          ? HebrewTitles.CREATE_VIEW
          : HebrewTitles.UPDATE_VIEW}
      </Button>
    </ViewActionsContainer>
  );
}
