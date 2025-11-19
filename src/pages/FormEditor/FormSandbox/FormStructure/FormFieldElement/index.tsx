import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField } from "../../../context/FormStructureContext";
import { DraggableElementData } from "../../../context/FormSandboxContext";
import { DeleteOutlined, DragIndicator } from "@mui/icons-material";
import styles from "./style.module.css";
import { PLACEHOLDER_FIELD_ID } from "../../../context/constants";
import { FORM_ELEMENT_ICONS } from "../../../../../components/FORM_ELEMENT_ICONS";
import { ElementTypeIds, FORM_ELEMENTS } from "../../../../../utils/interfaces";
import { Button, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { DateFieldExtra } from "./elementExtras";
import { DefaultDateValues } from "../../../schemas/dateSchema";

interface Props {
  field: FormField;
  // onEdit: (changedField: Partial<FormField>, value?: string | number) => void;
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

  const containerRef = useRef<HTMLDivElement>(null);

  const isPlaceholder = field.id === PLACEHOLDER_FIELD_ID;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isPlaceholder ? 0.5 : 1,
    filter: isPlaceholder ? "sepia(100%) brightness(90%) hue-rotate(170deg) saturate(500%)" : "none",
  };

  useEffect(() => {
    setNodeRef(containerRef.current);

    field.id !== PLACEHOLDER_FIELD_ID &&
    containerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  return (
    <div ref={containerRef} className={styles.container} style={style}>
      <div className={styles.dragHandle} ref={setActivatorNodeRef} {...listeners} {...attributes}>
        <DragIndicator />
      </div>
      <div className={styles.field}>
        <div className={styles.header}>
          <div className={styles.title}>
            {FORM_ELEMENT_ICONS[FORM_ELEMENTS[field.data.typeId].icon]}
            <Typography variant={"subtitle1"} align={"center"} sx={{ userSelect: "none" }}>
              {FORM_ELEMENTS[field.data.typeId].name}
            </Typography>
          </div>
          <FormControlLabel sx={{ marginInlineEnd: "2px" }} control={<Switch checked={field.data.required} />}
                            label="שדה חובה" />
        </div>
        <div className={styles.body}>
          <TextField value={field.data.name}
                     className={styles.input}
                     variant={"standard"}
                     label={"שם פנימי"}
                     disabled={isDragging}
            // onChange={(e) => onEdit(e.target.value)}
          />
          <TextField value={field.data.displayName}
                     className={styles.input}
                     variant={"standard"}
                     label={"שם תצוגה"}
                     disabled={isDragging}
            // onChange={(e) => onEdit(e.target.value)}
          />
          {
            field.data.typeId === ElementTypeIds.date &&
            <DateFieldExtra extra={field.data.extra ?? { defaultValue: DefaultDateValues.EMPTY }} disabled={isDragging} />
          }
        </div>
      </div>
      <div className={styles.deleteButtonContainer}>
        {
          !isPlaceholder &&
          <Button className={styles.deleteButton}
                  onClick={onDelete}>
            <DeleteOutlined />
          </Button>
        }
      </div>
    </div>
  );
}

export { FormFieldElement };