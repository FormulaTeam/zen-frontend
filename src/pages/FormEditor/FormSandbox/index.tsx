import { CollisionDetection, DndContext, PointerSensor, pointerWithin, useSensor, useSensors } from "@dnd-kit/core";
import { FormStructureContainer } from "./FormStructure";
import { DraggableElementType, FormSandboxContext } from "./context/FormSandboxContext";
import { useCallback, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FormSandboxSidebar } from "./FormSandboxSidebar";
import { useFormDndHandlers } from "../hooks/useFormDndHandlers";
import { DRAG_OVERLAYS } from "./FormDragOverlay";
import { FormConditionsModal } from "./FormConditionsModal";

const COLLISION_DETECTION: Record<DraggableElementType, CollisionDetection> = {
  catalogItem: pointerWithin,
  section: pointerWithin,
  field: pointerWithin,
} as const;

function FormSandbox() {
  const [isInternalNamesShown, setIsInternalNamesShown] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const isConditionsDialogOpen = searchParams.get("modal") === "conditions";

  const setIsConditionsDialogOpen = useCallback((isOpen: boolean) => {
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      if (isOpen) {
        updated.set("modal", "conditions");
      } else {
        updated.delete("modal");
      }
      return updated;
    }, { replace: true });
  }, [setSearchParams]);

  const { handleDragStart, handleDragOver, handleDragEnd, handleDragCancel, draggingElement } = useFormDndHandlers();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const toggleInternalNamesShown = useCallback(() => setIsInternalNamesShown((prev) => !prev), []);

  return (
    <FormSandboxContext.Provider value={{
      isInternalNamesShown,
      toggleInternalNamesShown,
      isConditionsDialogOpen,
      setIsConditionsDialogOpen,
    }}>
      <DndContext sensors={sensors}
                  collisionDetection={
                    draggingElement ?
                      COLLISION_DETECTION[draggingElement.type] :
                      pointerWithin
                  }
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDragEnd={handleDragEnd}
                  onDragCancel={handleDragCancel}>
        <FormSandboxSidebar />
        <FormStructureContainer />
        {
          draggingElement &&
          DRAG_OVERLAYS[draggingElement.type]({ draggingElement })
        }
      </DndContext>
      <FormConditionsModal />
    </FormSandboxContext.Provider>
  );
}

export { FormSandbox };
