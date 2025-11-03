import styles from "./style.module.css";
import { defaultDropAnimationSideEffects, DragOverlay } from "@dnd-kit/core";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { FORM_ELEMENT_ICONS } from "../../../../../components/FORM_ELEMENT_ICONS";
import { Add } from "@mui/icons-material";
import { useFormSandboxContext } from "../../../context/FormSandboxContext";
import { FORM_ELEMENTS } from "../../../../../utils/interfaces";

function CatalogItemDragOverlay() {
  const { draggingState, handleDrop } = useFormSandboxContext("catalogItem");

  return (
    <DragOverlay zIndex={1500}
                 modifiers={[snapCenterToCursor]}
                 dropAnimation={{
                   duration: 250,
                   sideEffects: (elements) => {
                     defaultDropAnimationSideEffects({
                                                       className: {
                                                         dragOverlay: styles.fadeOut,
                                                       },
                                                       styles: {
                                                         dragOverlay: {
                                                           animationDuration: "250ms",
                                                         },
                                                       },
                                                     })(elements);
                     setTimeout(handleDrop, 125);
                   },
                 }}>
      <div className={styles.dragOverlay}>
        <div className={styles.overlayItem}>
          {FORM_ELEMENT_ICONS[FORM_ELEMENTS[draggingState.draggingElement?.id!].icon]}
        </div>
        <Add className={styles.overlayAdd} />
      </div>
    </DragOverlay>
  );
}

export { CatalogItemDragOverlay };