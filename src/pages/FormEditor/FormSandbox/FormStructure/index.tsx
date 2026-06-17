import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormStructureContext } from "../../context/FormStructureContext";
import { FormSectionElement } from "./FormSectionElement";
import { AddSectionButton } from "./AddSectionButton";
import styles from "./style.module.css";

function FormStructureContainer() {
  const { formStructure } = useFormStructureContext();

  return (
    <div className={styles.container}>
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
