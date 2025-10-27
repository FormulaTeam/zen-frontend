import styles from "./style.module.css";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormSandbox } from "./FormSandbox";
import { FormEditorMode } from "./context/FormEditorContext";
import { useState } from "react";
import { DEFAULT_DRAGGING_STATE, EMPTY_FORM } from "./context/constants";
import { FormContextProvider } from "./context/FormContextProvider";
import { FormStructure } from "./context/FormStructureContext";
import { DraggingState } from "./context/FormSandboxContext";

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

function yieldFormStructure(form: object) {
  return form as FormStructure; // TODO change to actual logic that translates form json to form structure
}

function FormEditor({ mode, editedForm }: Props) {
  const [form, setForm] = useState<FormStructure>(editedForm ? yieldFormStructure(editedForm) : { ...EMPTY_FORM });
  const [draggingState, setDraggingState] = useState<DraggingState>({ ...DEFAULT_DRAGGING_STATE });

  return (
    <div className={styles.editorContainer}>
      <FormContextProvider editorContext={{ mode }} structureContext={form} sandboxContext={{ draggingState }}>
        <FormEditorHeader />
        <div className={styles.sandboxContainer}>
          <FormSandbox />
        </div>
      </FormContextProvider>
    </div>
  );
}

export { FormEditor };