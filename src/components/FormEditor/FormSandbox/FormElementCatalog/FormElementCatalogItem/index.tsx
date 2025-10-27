import { useDraggable } from "@dnd-kit/core";
import styles from "./style.module.css";
import { FORM_ELEMENT_ICONS } from "../../../../FORM_ELEMENT_ICONS";
import { FORM_ELEMENTS, FormElementTypeId } from "../../../../../utils/interfaces";
import { Typography } from "@mui/material";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo } from "react";

interface Props {
  id: FormElementTypeId;
}

function FormElementCatalogItem({ id }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id });

  const style = useMemo(() => ({
    transform: CSS.Translate.toString(transform),
    cursor: isDragging ? "unset" : "grab",
  }), [isDragging, transform]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "unset";
    }
  }, [isDragging]);

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