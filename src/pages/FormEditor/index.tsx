import styles from "./style.module.css";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormSandbox } from "./FormSandbox";
import { FormEditorContext, FormEditorMode, FORM_EDITOR_MODE } from "./context/FormEditorContext";
import { useMemo } from "react";
import { ExtendedFormDto, useFormStructure } from "./hooks/useFormStructure";
import { FormStructureContext } from "./context/FormStructureContext";
import type { FormDto } from "../../types/shared";

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
  const { ...formStructure } = useFormStructure(editedForm as ExtendedFormDto | undefined);

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
          ...formStructure,
        }}>
          <FormEditorHeader />
          <div className={styles.sandboxContainer}>
            <FormSandbox />
          </div>
        </FormStructureContext.Provider>
      </FormEditorContext.Provider>
    </div>
  );
}

export { FormEditor };