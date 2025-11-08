import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useRef } from "react";
import { FormField } from "../../../context/FormStructureContext";
import { DraggableElementData } from "../../../context/FormSandboxContext";

interface Props {
  field: FormField;
}

function FormFieldElement({ field }: Props) {
  const {
          attributes,
          listeners,
          setNodeRef,
          setActivatorNodeRef,
          transform,
          transition,
          isDragging,
        } = useSortable({ id: field.id, data: { elementType: "field" } as DraggableElementData });

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNodeRef(ref.current);
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.25 : 1,
  };

  return (
    <div ref={ref} style={style} {...attributes} {...listeners}>
      {field.typeId}
    </div>
  );
}

export { FormFieldElement };