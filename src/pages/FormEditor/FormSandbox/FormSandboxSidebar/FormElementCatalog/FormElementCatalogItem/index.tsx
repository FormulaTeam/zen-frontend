import { useDraggable } from "@dnd-kit/core";
import styles from "./style.module.css";
import { FORM_ELEMENT_ICONS } from "../../../../../../components/FORM_ELEMENT_ICONS";
import { FORM_ELEMENTS, FormFieldTypeId } from "../../../../../../utils/interfaces";
import { Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { DraggableElementData } from "../../../context/FormSandboxContext";

interface Props {
  id: FormFieldTypeId;

  onClick?: () => void;
}

function FormElementCatalogItem({ id, onClick }: Props) {
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

  const [isClicking, setIsClicking] = useState(false);

  const style = useMemo(() => ({
    opacity: isDragging || isClicking ? 0.25 : 1,
  }), [isDragging, isClicking]);

  useEffect(() => {
    setIsClicking(false);
  }, [isDragging]);

  return (
    <div ref={setNodeRef}
         style={style}
         className={styles.catalogBlock}
         {...attributes}
         {...listeners}
         onClick={onClick}
         onMouseDown={() => setIsClicking(true)}
         onMouseUp={() => setIsClicking(false)}>
      {FORM_ELEMENT_ICONS[FORM_ELEMENTS[id].icon]}
      <Typography variant={"subtitle2"} align={"center"} sx={{ userSelect: "none" }}>
        {FORM_ELEMENTS[id].name}
      </Typography>
    </div>
  );
}

export { FormElementCatalogItem };