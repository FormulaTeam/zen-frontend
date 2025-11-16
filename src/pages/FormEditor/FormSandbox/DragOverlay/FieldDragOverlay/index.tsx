import styles from "./style.module.css";
import { DragOverlay } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import { useFormSandboxContext } from "../../../context/FormSandboxContext";
import { FORM_ELEMENT_ICONS } from "../../../../../components/FORM_ELEMENT_ICONS";
import { FORM_ELEMENTS } from "../../../../../utils/interfaces";
import { Typography } from "@mui/material";

function FieldDragOverlay() {
  const { formStructure } = useFormStructureContext();
  const { draggingState } = useFormSandboxContext();

  const field = formStructure.fields[draggingState.draggingElement?.id!];

  return (
    <DragOverlay zIndex={1500} modifiers={[snapCenterToCursor]}>
      <div className={styles.dragOverlay}>
        <div className={styles.title}>
          {FORM_ELEMENT_ICONS[FORM_ELEMENTS[field.data.typeId].icon]}
          <Typography variant={"subtitle1"} align={"center"} sx={{ userSelect: "none" }}>
            {FORM_ELEMENTS[field.data.typeId].name}
          </Typography>
        </div>
      </div>
    </DragOverlay>
  );
}

export { FieldDragOverlay };