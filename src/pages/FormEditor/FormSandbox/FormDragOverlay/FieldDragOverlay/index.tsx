import styles from "./style.module.css";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import { FORM_ELEMENT_ICONS } from "../../../../../components/FORM_ELEMENT_ICONS";
import { FORM_ELEMENTS } from "../../../../../utils/interfaces";
import { Typography } from "@mui/material";
import { DraggingElement } from "../../../context/FormSandboxContext";
import { withDragOverlay } from "../withDragOverlay";

interface Props {
  draggingElement: DraggingElement;
}

function FieldDragOverlay({ draggingElement }: Props) {
  const { formStructure } = useFormStructureContext();
  const field = formStructure.fields[draggingElement.id];

  return (
    <div style={{
      position: "relative",
      paddingRight: "calc(50% + 10px)",
    }}>
      <div className={styles.dragOverlay}>
        <div className={styles.dragHandle} />
        <div className={styles.title}>
          {FORM_ELEMENT_ICONS[FORM_ELEMENTS[field.data.typeId].icon]}
          <Typography variant={"subtitle1"} align={"center"} sx={{ userSelect: "none" }}>
            {FORM_ELEMENTS[field.data.typeId].name}
          </Typography>
        </div>
      </div>
    </div>
  );
}

export default withDragOverlay(FieldDragOverlay);