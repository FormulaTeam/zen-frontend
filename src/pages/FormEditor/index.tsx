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
  const isDuplicateCreate = !!duplicateRouteState?.duplicateSourceFormId;
  const draftEnabled = !isDuplicateCreate;
  const formDraftKey = editedForm?.id;
  const duplicateInitialStructure = useMemo(() => {
    if (!duplicateRouteState?.duplicateFormStructure) {
      return undefined;
    }

    return {
      ...duplicateRouteState.duplicateFormStructure,
      duplicate: {
        sourceFormId:
          duplicateRouteState.duplicateFormStructure.duplicate?.sourceFormId
          ?? (duplicateRouteState.duplicateSourceFormId as number),
        selections:
          duplicateRouteState.duplicateFormStructure.duplicate?.selections
          ?? duplicateRouteState.duplicateSelections,
        fieldIdMap:
          duplicateRouteState.duplicateFormStructure.duplicate?.fieldIdMap
          ?? duplicateRouteState.duplicateFieldIdMap,
        optionIdMap:
          duplicateRouteState.duplicateFormStructure.duplicate?.optionIdMap
          ?? duplicateRouteState.duplicateOptionIdMap,
      },
    };
  }, [duplicateRouteState]);
  const { setFormStructure, ...formStructure } = useFormStructure(
    editedForm,
    duplicateInitialStructure,
    formDraftKey,
    draftEnabled,
  );
  const [showRestoreBanner, setShowRestoreBanner] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<any>(null);

  useEffect(() => {
    if (!draftEnabled) {
      return;
    }

    const draft = getFormDraft(formDraftKey);
    if (draft) {
      setPendingDraft(draft.data);
      setShowRestoreBanner(true);
    }
  }, [draftEnabled, formDraftKey]);

  const handleRestore = () => {
    if (pendingDraft) {
      setFormStructure({
        ...pendingDraft,
        duplicate: pendingDraft.duplicate ?? duplicateInitialStructure?.duplicate,
      });
    }
    setShowRestoreBanner(false);
    setPendingDraft(null);
  };

  const handleDiscardDraft = () => {
    if (!draftEnabled) {
      return;
    }

    clearFormDraft(formDraftKey);
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

  const originalSectionIds = useMemo<Set<string>>(() => {
    if (!editedForm?.sections) {
      return new Set<string>();
    }

    return new Set<string>(editedForm.sections.map((s) => s.id?.toString() ?? ""));
  }, [editedForm]);

  return (
    <div className={styles.editorContainer}>
      <FormEditorContext.Provider
        value={{
          mode,
          originalFieldIds,
          formDraftKey,
          draftEnabled,
          duplicateSourceFormId: duplicateRouteState?.duplicateSourceFormId,
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
        open={draftEnabled && showRestoreBanner}
        onRestore={handleRestore}
        onDiscard={handleDiscardDraft}
      />
    </div>
  );
}

export { FormEditor };
