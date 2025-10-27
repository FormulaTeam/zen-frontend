import { verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useFormEditorContext } from "../../context/FormEditorContext";

function FormStructure() {
  const {} = useFormEditorContext();

  return (
    <SortableContext items={[]} strategy={verticalListSortingStrategy}>

    </SortableContext>
  );
}

export { FormStructure };