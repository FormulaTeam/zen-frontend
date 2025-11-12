import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormStructureContext } from "../../context/FormStructureContext";
import { FormSection } from "./FormSection";
import styles from "./style.module.css";

function FormStructureContainer() {
  const { formStructure } = useFormStructureContext();

  return (
    <>
      <div className={styles.container}>
        <SortableContext items={formStructure.orderedSectionIds} strategy={verticalListSortingStrategy}>
          {
            formStructure.orderedSectionIds.map((sectionId) => <FormSection key={sectionId} id={sectionId}/>)
          }
        </SortableContext>
      </div>
    </>
  );
}

export { FormStructureContainer };