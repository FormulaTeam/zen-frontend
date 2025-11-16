import styles from "./style.module.css";
import { DragOverlay } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import { useFormSandboxContext } from "../../../context/FormSandboxContext";

function FieldDragOverlay() {
  const { formStructure } = useFormStructureContext();
  const { draggingState } = useFormSandboxContext();

  return (
    <DragOverlay zIndex={1500} modifiers={[snapCenterToCursor]}>
      <div className={styles.dragOverlay}>
        {formStructure.fields[draggingState.draggingElement?.id!].data.displayName}
      </div>
    </DragOverlay>
  );
}

export { FieldDragOverlay };