import { createContext, useContext } from "react";
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
  isInternalNamesShown: boolean;
  toggleInternalNamesShown: () => void;
  draggingState: DraggingState;
}

interface DraggableElementData {
  elementType: DraggableElementType;
}

const FormSandboxContext = createContext<FormSandboxContext>({
  isInternalNamesShown: false,
  toggleInternalNamesShown: () => null,
  draggingState: { ...DEFAULT_DRAGGING_STATE },
});

function useFormSandboxContext() {
  const { draggingState, isInternalNamesShown, toggleInternalNamesShown } = useContext(FormSandboxContext);

  return {
    isInternalNamesShown,
    toggleInternalNamesShown,
    draggingState,
  };
}

export { FormSandboxContext, useFormSandboxContext };
export type { DraggingState, DraggingElement, DraggableElementData };