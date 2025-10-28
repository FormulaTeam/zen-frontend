import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Typography } from "@mui/material";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import styles from "./style.module.css";

interface Props {
  id: string;
}

function FormSection({ id }: Props) {
  const { formStructure } = useFormStructureContext();
  const self = formStructure.sections[id];

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div className={styles.container} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Typography variant={"body1"}>
        {self.title}
      </Typography>
      <SortableContext items={formStructure.sections[id].fieldIds} strategy={verticalListSortingStrategy}>
      </SortableContext>
    </div>
  );
}

export { FormSection };