import { CollisionDetection, DndContext, PointerSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core";
import { FormStructureContainer } from "./FormStructure";
import { DraggableElementType, FormSandboxContext } from "../context/FormSandboxContext";
import { useCallback, useState } from "react";
import { FormSandboxSidebar } from "./FormSandboxSidebar";
import { useFormDndHandlers } from "../hooks/useFormDndHandlers";
import { DRAG_OVERLAYS } from "./DragOverlay";

const COLLISION_DETECTION: Record<DraggableElementType, CollisionDetection> = {
  catalogItem: pointerWithin,
  section: pointerWithin,
  field: pointerWithin,
} as const;

function FormSandbox() {
  const [isInternalNamesShown, setIsInternalNamesShown] = useState(false);
  const { handleDragStart, handleDragOver, handleDragEnd, draggingElement } = useFormDndHandlers();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const toggleInternalNamesShown = useCallback(() => setIsInternalNamesShown((prev) => !prev), []);

  return (
    <FormSandboxContext.Provider value={{ isInternalNamesShown, toggleInternalNamesShown }}>
      <DndContext sensors={sensors}
                  collisionDetection={
                    draggingElement ?
                      COLLISION_DETECTION[draggingElement.type] :
                      pointerWithin
                  }
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}>
        <FormSandboxSidebar />
        <FormStructureContainer />
        {
          draggingElement &&
          DRAG_OVERLAYS[draggingElement.type]({ draggingElement })
        }
      </DndContext>
    </FormSandboxContext.Provider>
  );
}

export { FormSandbox };