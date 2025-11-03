import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormStructureContext } from "../../context/FormStructureContext";
import { FormSection } from "./FormSection";
import { useMemo } from "react";
import styles from "./style.module.css";
import { useFormSandboxContext } from "../../context/FormSandboxContext";

function FormStructureElement() {
  const { formStructure } = useFormStructureContext();
  const { handleDrag, handleDrop } = useFormSandboxContext("section");
  const sectionIds = useMemo(() => (
    Object.keys(formStructure.sections)
          .sort((prevId, currentId) => (
            formStructure.sections[prevId].index - formStructure.sections[currentId].index
          ))
  ), [formStructure.sections]);

  return (
    <>
      <div className={styles.container}>
        <SortableContext items={sectionIds} strategy={verticalListSortingStrategy}>
          {
            sectionIds.map((sectionId) => <FormSection key={sectionId}
                                                       id={sectionId}
                                                       onDrag={handleDrag}
                                                       onDrop={handleDrop} />)
          }
        </SortableContext>
      </div>
    </>
  );
}

export { FormStructureElement };