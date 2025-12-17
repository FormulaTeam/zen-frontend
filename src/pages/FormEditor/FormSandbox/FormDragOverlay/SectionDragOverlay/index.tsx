import styles from "./style.module.css";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import { DraggingElement } from "../../context/FormSandboxContext";
import { withDragOverlay } from "../withDragOverlay";

interface Props {
  draggingElement: DraggingElement;
}

function SectionDragOverlay({ draggingElement }: Props) {
  const { formStructure } = useFormStructureContext();

  return (
    <div className={styles.dragOverlay}>
      <div className={styles.title}>
        {formStructure.sections[draggingElement.id].title}
      </div>
      <div className={styles.body} />
    </div>
  );
}

export default withDragOverlay(SectionDragOverlay);