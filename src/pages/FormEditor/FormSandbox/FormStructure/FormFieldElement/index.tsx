import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { FormField } from "../../../context/FormStructureContext";
import { DraggableElementData, useFormSandboxContext } from "../../context/FormSandboxContext";
import { DeleteOutlined, DragIndicator } from "@mui/icons-material";
import styles from "./style.module.css";
import { PLACEHOLDER_FIELD_ID } from "../../../context/constants";
import { FORM_ELEMENT_ICONS } from "../../../../../components/FORM_ELEMENT_ICONS";
import { FieldTypeIds, FORM_ELEMENTS } from "../../../../../utils/interfaces";
import { Button, FormControlLabel, Switch, TextField, Typography } from "@mui/material";
import { useEffect, useRef } from "react";
import { ExtraElement } from "./ExtraElement";
import { FormFieldData } from "../../../schemas/fields";

interface Props {
  field: FormField;
  onDataChange: (data: Partial<FormFieldData>) => void;
  onDelete: () => void;
}

function FormFieldElement({ field, onDelete, onDataChange }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    active,
  } = useSortable({ id: field.id, data: { elementType: "field" } as DraggableElementData });

  const { isInternalNamesShown } = useFormSandboxContext();

  const containerRef = useRef<HTMLDivElement>(null);

  const isPlaceholder = field.id === PLACEHOLDER_FIELD_ID;

  const isInputDisabled = !!active;

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
          {field.data.typeId !== FieldTypeIds.checkbox && (
            <FormControlLabel sx={{ marginInlineEnd: "2px" }}
              control={<Switch checked={field.data.required}
                disabled={isInputDisabled}
                onChange={(e) => {
                  onDataChange({ required: e.target.checked });
                }} />}
              label="שדה חובה" />
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.baseData}>
            <TextField value={field.data.displayName}
              className={styles.input}
              variant={"standard"}
              label={"שם תצוגה"}
              error={!!field.validationErrors?.displayName}
              helperText={field.validationErrors?.displayName?.errors[0]}
              disabled={isInputDisabled}
              slotProps={{
                htmlInput: {
                  maxLength: 255,
                },
              }}
              onChange={(e) => onDataChange({ displayName: e.target.value.trimStart() })}
              onBlur={(e) => onDataChange({ displayName: e.target.value.trim() })}
            />
            {
              (isInternalNamesShown && field.data.typeId !== FieldTypeIds.linkedForm) &&
              <TextField value={field.data.name}
                className={styles.input}
                variant={"standard"}
                label={"שם פנימי"}
                error={!!field.validationErrors?.name}
                helperText={field.validationErrors?.name?.errors[0]}
                disabled={isInputDisabled}
                onChange={(e) => onDataChange({ name: e.target.value.trimStart() })}
                onBlur={(e) => onDataChange({ name: e.target.value.trim() })}
              />
            }
          </div>
          <ExtraElement fieldId={field.id}
            typeId={field.data.typeId}
            extra={field.data.extra ?? {}}
            validationErrors={field.validationErrors?.extra}
            onChange={(extra) => onDataChange({ extra })}
            disabled={isInputDisabled} />
        </div>
      </div>
      <div className={styles.deleteButtonContainer}>
        {
          !isPlaceholder &&
          <Button className={styles.deleteButton}
            onClick={onDelete}
            disabled={isInputDisabled}>
            <DeleteOutlined />
          </Button>
        }
      </div>
    </div>
  );
}

export { FormFieldElement };