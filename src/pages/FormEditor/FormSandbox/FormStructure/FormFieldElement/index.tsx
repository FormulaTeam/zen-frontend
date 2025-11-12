import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField } from "../../../context/FormStructureContext";
import { DraggableElementData } from "../../../context/FormSandboxContext";
import { DeleteOutlined, DragIndicator } from "@mui/icons-material";
import styles from "./style.module.css";
import { PLACEHOLDER_FIELD_ID } from "../../../context/constants";
import { FORM_ELEMENT_ICONS } from "../../../../../components/FORM_ELEMENT_ICONS";
import { FORM_ELEMENTS } from "../../../../../utils/interfaces";
import { Button, Typography } from "@mui/material";

interface Props {
  field: FormField;
  onDelete: () => void;
}

function FormFieldElement({ field, onDelete }: Props) {
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
    opacity: isDragging || field.id === PLACEHOLDER_FIELD_ID ? 0.25 : 1,
  };

  return (
    <div ref={setNodeRef} className={styles.container} style={style}>
      <div className={styles.dragHandle} ref={setActivatorNodeRef} {...listeners} {...attributes}>
        <DragIndicator />
      </div>
      <div className={styles.field}>
        <div className={styles.header}>
          <div className={styles.title}>
            {FORM_ELEMENT_ICONS[FORM_ELEMENTS[field.typeId].icon]}
            <Typography variant={"subtitle1"} align={"center"} sx={{ userSelect: "none" }}>
              {FORM_ELEMENTS[field.typeId].name}
            </Typography>
          </div>
          <Button className={styles.deleteButton}
                  onClick={onDelete}>
            <DeleteOutlined />
          </Button>
        </div>
      </div>
    </div>
  );
}

export { FormFieldElement };