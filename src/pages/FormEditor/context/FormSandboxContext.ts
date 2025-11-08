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

function useFormSandboxContext() {
  const { draggingState } = useContext(FormSandboxContext);

  return {
    draggingState,
  };
}

export { FormSandboxContext, useFormSandboxContext };
export type { DraggingState, DraggingElement, DraggableElementData };