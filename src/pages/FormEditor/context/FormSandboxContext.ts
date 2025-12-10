import { createContext, useContext } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";

export type DraggableElementType = "field" | "section" | "catalogItem";

interface DraggingElement {
  type: DraggableElementType;
  id: UniqueIdentifier;
}

interface FormSandboxContext {
  isInternalNamesShown: boolean;
  toggleInternalNamesShown: () => void;
}

interface DraggableElementData {
  elementType: DraggableElementType;
}

const FormSandboxContext = createContext<FormSandboxContext>({
  isInternalNamesShown: false,
  toggleInternalNamesShown: () => null,
});

function useFormSandboxContext() {
  const { isInternalNamesShown, toggleInternalNamesShown } = useContext(FormSandboxContext);

  return {
    isInternalNamesShown,
    toggleInternalNamesShown,
  };
}

export { FormSandboxContext, useFormSandboxContext };
export type { DraggingElement, DraggableElementData };