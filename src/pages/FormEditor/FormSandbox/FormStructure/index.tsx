import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { useFormStructureContext } from "../../context/FormStructureContext";
import { FORM_STRUCTURE_DROPPABLE_ID } from "../../context/constants";
import { DraggableElementData } from "../context/FormSandboxContext";
import { FormSectionElement } from "./FormSectionElement";
import { AddSectionButton } from "./AddSectionButton";
import styles from "./style.module.css";

function FormStructureContainer() {
  const { formStructure } = useFormStructureContext();
  const { setNodeRef } = useDroppable({
    id: FORM_STRUCTURE_DROPPABLE_ID,
    data: {
      elementType: "formStructure",
    } as DraggableElementData,
  });

  return (
    <div ref={setNodeRef} className={styles.container}>
      <SortableContext
        items={formStructure.orderedSectionIds}
        strategy={verticalListSortingStrategy}>
        {formStructure.orderedSectionIds.map((sectionId) => (
          <FormSectionElement key={sectionId} id={sectionId} />
        ))}
      </SortableContext>

      <AddSectionButton />
    </div>
  );
}

export { FormStructureContainer };
