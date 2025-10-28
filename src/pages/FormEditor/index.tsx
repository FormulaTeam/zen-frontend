import styles from "./style.module.css";
import { FormEditorHeader } from "./FormEditorHeader";
import { FormSandbox } from "./FormSandbox";
import { FormEditorMode } from "./context/FormEditorContext";
import { useState } from "react";
import { DEFAULT_DRAGGING_STATE } from "./context/constants";
import { FormContextProvider } from "./context/FormContextProvider";
import { DraggingState } from "./context/FormSandboxContext";
import { useFormStructure } from "./hooks/useFormStructure";

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
  const { formStructure, appendSection } = useFormStructure(editedForm);
  const [draggingState, setDraggingState] = useState<DraggingState>({ ...DEFAULT_DRAGGING_STATE });

  return (
    <div className={styles.editorContainer}>
      <FormContextProvider editorContext={{ mode }}
                           structureContext={{ formStructure, appendSection }}
                           sandboxContext={{ draggingState }}>
        <FormEditorHeader />
        <div className={styles.sandboxContainer}>
          <FormSandbox />
        </div>
      </FormContextProvider>
    </div>
  );
}

export { FormEditor };