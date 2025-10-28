import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormStructureContext } from "../../context/FormStructureContext";
import { FormSection } from "./FormSection";
import { useMemo } from "react";
import styles from './style.module.css';

function FormStructure() {
  const { formStructure } = useFormStructureContext();
  const sectionIds = useMemo(() => Object.keys(formStructure.sections), [formStructure.sections]);

  return (
    <div className={styles.container}>
      <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
        {
          sectionIds.map((sectionId) => <FormSection id={sectionId} />)
        }
      </SortableContext>
    </div>
  );
}

export { FormStructure };