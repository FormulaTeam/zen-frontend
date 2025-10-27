import { DndContext, DragOverlay, PointerSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core";
import { FormManagementActions } from "./FormManagementActions";
import { FormElementCatalog } from "./FormElementCatalog";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { FormStructure } from "./FormStructure";
import { useState } from "react";
import { FormElementCatalogItem } from "./FormElementCatalog/FormElementCatalogItem";
import { FormElementTypeId } from "../../../utils/interfaces";

function FormSandbox() {
  const [activeItemId, setActiveItemId] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
  );

  return (
    <DndContext sensors={sensors}
                modifiers={[snapCenterToCursor]}
                collisionDetection={pointerWithin}
                onDragStart={(e) => setActiveItemId(+e.active.id)}
                onDragOver={() => null}
                onDragEnd={() => setActiveItemId(null)}>
      <div>
        <FormManagementActions />
        <FormElementCatalog />
      </div>
      <FormStructure />
      <DragOverlay>
        {activeItemId ? <FormElementCatalogItem id={activeItemId as FormElementTypeId} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

export { FormSandbox };