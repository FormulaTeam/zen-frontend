import styles from "./style.module.css";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormSandbox } from "./FormSandbox";
import { FormEditorContext, FormEditorMode, FORM_EDITOR_MODE } from "./context/FormEditorContext";
import { useEffect, useMemo, useState } from "react";
import { useFormStructure } from "./hooks/useFormStructure";
import { FormStructureContext } from "./context/FormStructureContext";
import type { FormDto } from "../../types/shared";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from "@mui/material";
import { clearFormDraft, getFormDraft } from "./utils/draftPersistence";

interface EditorProps {
  mode: FormEditorMode;
  editedForm?: FormDto;
}

interface EditModeProps extends EditorProps {
  mode: typeof FORM_EDITOR_MODE.EDIT;
  editedForm: FormDto;
}

interface CreateModeProps extends EditorProps {
  mode: typeof FORM_EDITOR_MODE.CREATE;
  editedForm?: never;
}

type Props = CreateModeProps | EditModeProps;

function FormEditor({ mode, editedForm }: Props) {
  const { setFormStructure, ...formStructure } = useFormStructure(editedForm);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  useEffect(() => {
    const draft = getFormDraft(editedForm?.id);
    if (draft) {
      setPendingDraft(draft.data);
      setShowRestoreDialog(true);
    }
  }, [editedForm?.id]);

  const handleRestore = () => {
    if (pendingDraft) {
      setFormStructure(pendingDraft);
    }
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearFormDraft(editedForm?.id);
    setShowRestoreDialog(false);
    setPendingDraft(null);
  };

  const originalFieldIds = useMemo<Set<string>>(() => {
    if (!editedForm?.sections) {
      return new Set<string>();
    }

    const ids: string[] = [];
    editedForm.sections.forEach(section => {
      if (section?.fields) {
        section.fields.forEach(field => {
          if (field?.id) ids.push(field.id.toString());
        });
      }
    });

    return new Set<string>(ids);
  }, [editedForm]);

  return (
    <div className={styles.editorContainer}>
      <FormEditorContext.Provider value={{ mode, originalFieldIds }}>
        <FormStructureContext.Provider value={{
          setFormStructure,
          ...formStructure,
        }}>
          <FormEditorHeader />
          <div className={styles.sandboxContainer}>
            <FormSandbox />
          </div>
        </FormStructureContext.Provider>
      </FormEditorContext.Provider>

      <Dialog
        open={showRestoreDialog}
        onClose={handleDiscardDraft}
        aria-labelledby="restore-draft-title"
        aria-describedby="restore-draft-description"
      >
        <DialogTitle id="restore-draft-title">שחזור שינויים שלא נשמרו</DialogTitle>
        <DialogContent>
          <DialogContentText id="restore-draft-description">
            מצאנו טיוטה של הטופס הזה עם שינויים שלא נשמרו. האם תרצה לשחזר את ההתקדמות שלך?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDiscardDraft} color="inherit">
            התעלם והסר טיוטה
          </Button>
          <Button onClick={handleRestore} color="primary" variant="contained" autoFocus>
            שחזר טיוטה
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export { FormEditor };