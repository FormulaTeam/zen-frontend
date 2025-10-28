import { createContext, useContext } from "react";
import { DEFAULT_DRAGGING_STATE } from "./constants";

export type DragOrigin = "form" | "catalog";

interface DraggingState {
  isDragging: boolean;
  origin: DragOrigin | null;
}

interface FormSandboxContext {
  draggingState: DraggingState;
}

const FormSandboxContext = createContext<FormSandboxContext>({ draggingState: { ...DEFAULT_DRAGGING_STATE } });

function useFormSandboxContext() {
  return useContext(FormSandboxContext);
}

export { FormSandboxContext, useFormSandboxContext };
export type { DraggingState };