import { FunctionComponent } from "react";
import { snapCenterToCursor } from "@dnd-kit/modifiers";
import { DragOverlay } from "@dnd-kit/core";
import { DraggingElement } from "../../context/FormSandboxContext";

interface DragOverlayProps {
  draggingElement: DraggingElement;
}

function withDragOverlay(overlayComponent: FunctionComponent<DragOverlayProps>) {
  return (
    ({ draggingElement }: DragOverlayProps) => (
      <DragOverlay zIndex={1500} modifiers={[snapCenterToCursor]}>
        {overlayComponent({ draggingElement })}
      </DragOverlay>
    )
  );
}

export { withDragOverlay };