import styles from "./style.module.css";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormSandbox } from "./FormSandbox";
import { FormEditorContext, FormEditorMode } from "./context/FormEditorContext";
import { useFormStructure } from "./hooks/useFormStructure";
import { FormStructureContext } from "./context/FormStructureContext";

interface EditorProps {
  mode: FormEditorMode;
  editedForm?: object;
}

interface EditModeProps extends EditorProps {
  mode: "edit";
  editedForm: object;
}

interface CreateModeProps extends EditorProps {
  mode: "create";
  editedForm?: never;
}

type Props = CreateModeProps | EditModeProps;

function FormEditor({ mode, editedForm }: Props) {
  const {
    formStructure,
    setFormStructure,
    appendSection,
    deleteSection,
    renameSection,
    toggleSectionExpanded,
    appendFieldToFirstSection,
    deleteField,
    setFieldData,
    deleteConditionAt,
    validateForm,
    setFormMetadata,
  } = useFormStructure(editedForm);

  return (
    <div className={styles.editorContainer}>
      <FormEditorContext.Provider value={{ mode }}>
        <FormStructureContext.Provider value={{
          formStructure,
          setFormStructure,
          appendSection,
          deleteSection,
          renameSection,
          toggleSectionExpanded,
          appendFieldToFirstSection,
          deleteField,
          setFieldData,
          deleteConditionAt,
          validateForm,
          setFormMetadata,
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