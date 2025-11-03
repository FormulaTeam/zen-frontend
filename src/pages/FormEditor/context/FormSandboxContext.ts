import { createContext, useCallback, useContext } from "react";
import { DEFAULT_DRAGGING_STATE } from "./constants";
import { UniqueIdentifier } from "@dnd-kit/core";

export type DraggableElementType = "field" | "section" | "catalogItem";

interface DraggingElement {
  type: DraggableElementType;

  id?: UniqueIdentifier | null;
}

interface DraggingState {
  isDragging: boolean;
  draggingElement: DraggingElement | null;
}

interface FormSandboxContext {
  draggingState: DraggingState;
  setDragging: (isDragging: boolean, draggingElement?: DraggingElement | null) => void;
}

interface DraggableElementData {
  elementType: DraggableElementType;
}

const FormSandboxContext = createContext<FormSandboxContext>({
                                                               draggingState: { ...DEFAULT_DRAGGING_STATE },
                                                               setDragging: () => null,
                                                             });

function useFormSandboxContext(elementType: DraggableElementType) {
  const { draggingState, setDragging } = useContext(FormSandboxContext);

  const handleDrag = useCallback((elementId: UniqueIdentifier) => {
    setDragging(true, { id: elementId, type: elementType });
  }, [setDragging]);

  const handleDrop = useCallback(() => {
    elementType === draggingState.draggingElement?.type && setDragging(false);
  }, [draggingState.draggingElement?.type, setDragging]);

  return {
    draggingState,
    handleDrag,
    handleDrop,
  };
}

export { FormSandboxContext, useFormSandboxContext };
export type { DraggingState, DraggingElement, DraggableElementData };