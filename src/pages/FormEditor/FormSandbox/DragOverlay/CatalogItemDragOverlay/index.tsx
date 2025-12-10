import styles from "./style.module.css";
import { FORM_ELEMENT_ICONS } from "../../../../../components/FORM_ELEMENT_ICONS";
import { Add } from "@mui/icons-material";
import { FORM_ELEMENTS } from "../../../../../utils/interfaces";
import { DraggingElement } from "../../../context/FormSandboxContext";
import { withDragOverlay } from "../withDragOverlay";

interface Props {
  draggingElement: DraggingElement;
}

function CatalogItemDragOverlay({ draggingElement }: Props) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.dragOverlay}>
        <Add className={styles.overlayAdd} />
        <div className={styles.overlayItem}>
          {FORM_ELEMENT_ICONS[FORM_ELEMENTS[draggingElement.id].icon]}
        </div>
      </div>
    </div>
  );
}

export default withDragOverlay(CatalogItemDragOverlay);