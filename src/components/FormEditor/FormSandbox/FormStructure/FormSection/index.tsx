import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";

function FormSection() {
  return (
    <div>
      <SortableContext items={[]} strategy={verticalListSortingStrategy}>
      </SortableContext>
    </div>
  );
}

export { FormSection };