import { useDraggable } from "@dnd-kit/core";
import styles from "./style.module.css";
import { FORM_ELEMENT_ICONS } from "../../../../../components/FORM_ELEMENT_ICONS";
import { FORM_ELEMENTS, FormElementTypeId } from "../../../../../utils/interfaces";
import { Typography } from "@mui/material";
import { useEffect, useMemo } from "react";
import { DraggableElementData } from "../../../context/FormSandboxContext";

interface Props {
  id: FormElementTypeId;

  onDrag?: (elementId: FormElementTypeId) => void;
  onDrop?: () => void;
}

function FormElementCatalogItem({ id, onDrag, onDrop }: Props) {
  const {
          attributes,
          listeners,
          setNodeRef,
          isDragging,
        } = useDraggable({
                           id,
                           data: {
                             elementType: "catalogItem",
                           } as DraggableElementData,
                         });

  const style = useMemo(() => ({
    opacity: isDragging ? 0.25 : 1,
  }), [isDragging]);

  useEffect(() => {
    isDragging ? onDrag?.(id) : null;
  }, [isDragging, onDrag, onDrop]);

  return (
    <div ref={setNodeRef} style={style} className={styles.catalogBlock} {...attributes} {...listeners}>
      {FORM_ELEMENT_ICONS[FORM_ELEMENTS[id].icon]}
      <Typography variant={"subtitle2"} align={"center"} sx={{ userSelect: "none" }}>
        {FORM_ELEMENTS[id].name}
      </Typography>
    </div>
  );
}

export { FormElementCatalogItem };