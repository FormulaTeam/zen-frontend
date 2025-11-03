import { useCallback, useState } from "react";
import { DraggingElement, DraggingState } from "../context/FormSandboxContext";
import { DEFAULT_DRAGGING_STATE } from "../context/constants";

function useFormDraggingState() {
  const [draggingState, setDraggingState] = useState<DraggingState>({ ...DEFAULT_DRAGGING_STATE });

  const setDragging = useCallback((isDragging: boolean, draggingElement?: DraggingElement | null) => {
    setDraggingState((prev) => (
      {
        ...prev,
        isDragging,
        draggingElement: isDragging && draggingElement ?
          {
            ...draggingElement,
          } :
          null,
      }
    ));
  }, []);

  return { draggingState, setDragging };
}

export { useFormDraggingState };