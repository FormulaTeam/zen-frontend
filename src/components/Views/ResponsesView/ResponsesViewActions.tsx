import { Button, CircularProgress } from "@mui/material";
import { ViewActionsContainer } from "../ViewManager/styled";

interface ResponsesViewActionsProps {
  isSaving: boolean;
  isCreatingNew: boolean;
  canSave: boolean;
  onApply: () => void;
  onSave: () => void;
}

enum HebrewTitles {
  APPLY = "החלה",
  SAVE = "שמירה",
  SAVING = "שומר...",
  CREATE_VIEW = "יצירת תצוגה",
  UPDATE_VIEW = "עדכון תצוגה",
}

export function ResponsesViewFormActions({
  isSaving,
  isCreatingNew,
  canSave,
  onApply,
  onSave,
}: ResponsesViewActionsProps) {
  const buttonSx = {
    height: 44,
    borderRadius: "12px",
    textTransform: "none",
    fontWeight: 700,
    fontSize: "0.95rem",
    flex: 1,
  };

  return (
    <ViewActionsContainer sx={{ display: "flex", gap: 1.5, mt: 3 }}>
      <Button variant="outlined" onClick={onApply} disabled={isSaving} sx={buttonSx}>
        {HebrewTitles.APPLY}
      </Button>

      <Button
        variant="contained"
        onClick={onSave}
        disabled={!canSave || isSaving}
        startIcon={isSaving ? <CircularProgress size={18} color="inherit" /> : null}
        sx={buttonSx}>
        {isSaving
          ? HebrewTitles.SAVING
          : isCreatingNew
            ? HebrewTitles.CREATE_VIEW
            : HebrewTitles.UPDATE_VIEW}
      </Button>
    </ViewActionsContainer>
  );
}
