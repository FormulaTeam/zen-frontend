import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField } from "../../../context/FormStructureContext";
import { DraggableElementData } from "../../../context/FormSandboxContext";
import { DragIndicator } from "@mui/icons-material";
import styles from "./style.module.css";

interface Props {
  field: FormField;
}

function FormFieldElement({ field }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id, data: { elementType: "field" } as DraggableElementData });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <div ref={setNodeRef} className={styles.container} style={style}>
      <div className={styles.dragHandle} ref={setActivatorNodeRef} {...listeners} {...attributes}>
        <DragIndicator />
      </div>
      <div className={styles.field}>
        {field.typeId}
      </div>
    </div>
  );
}

export { FormFieldElement };