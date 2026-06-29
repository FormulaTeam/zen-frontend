import styles from "./style.module.css";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormSandbox } from "./FormSandbox";
import { FormEditorContext, FormEditorMode, FORM_EDITOR_MODE } from "./context/FormEditorContext";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useFormStructure } from "./hooks/useFormStructure";
import { FormStructureContext } from "./context/FormStructureContext";
import type { FormDto } from "../../types/shared";
import { clearFormDraft, getFormDraft } from "./utils/draftPersistence";
import DraftRecoveryBanner from "../../components/BasePopup/DraftRecoveryBanner";
import type { DuplicateFormRouteState } from "./utils/duplicateForm";

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
  const location = useLocation();
  const duplicateRouteState = mode === FORM_EDITOR_MODE.CREATE
    ? (location.state as Partial<DuplicateFormRouteState> | null)
    : null;
  const { setFormStructure, ...formStructure } = useFormStructure(
    editedForm,
    duplicateRouteState?.duplicateFormStructure,
  );
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  useEffect(() => {
    const draft = getFormDraft(editedForm?.id);
    if (draft) {
      setPendingDraft(draft.data);
      setShowRestoreBanner(true);
    }
  }, [editedForm?.id]);

  const handleRestore = () => {
    if (pendingDraft) {
      setFormStructure(pendingDraft);
    }
    setShowRestoreBanner(false);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    clearFormDraft(editedForm?.id);
    setShowRestoreBanner(false);
    setPendingDraft(null);
  };

  const hasChanges = formStructure.checkHasChanges();

  useEffect(() => {
    (window as any).hasUnsavedChanges = hasChanges;

    return () => {
      (window as any).hasUnsavedChanges = false;
    };
  }, [hasChanges]);

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
      <FormEditorContext.Provider
        value={{
          mode,
          originalFieldIds,
          duplicateSourceFormId: duplicateRouteState?.duplicateSourceFormId,
          duplicateCopyPermissions: !!duplicateRouteState?.duplicateCopyPermissions,
        }}>
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

      <DraftRecoveryBanner
        open={showRestoreBanner}
        onRestore={handleRestore}
        onDiscard={handleDiscardDraft}
      />
    </div>
  );
}

export { FormEditor };
