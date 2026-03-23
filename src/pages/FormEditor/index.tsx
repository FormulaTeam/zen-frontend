import styles from "./style.module.css";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormSandbox } from "./FormSandbox";
import { FormEditorContext, FormEditorMode, FORM_EDITOR_MODE } from "./context/FormEditorContext";
import { useFormStructure } from "./hooks/useFormStructure";
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
  const { ...formStructure } = useFormStructure(editedForm);

  return (
    <div className={styles.editorContainer}>
      <FormEditorContext.Provider value={{ mode }}>
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