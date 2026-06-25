import { createContext, useContext } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";

export type DraggableElementType = "field" | "section" | "catalogItem";
export type DroppableElementType = DraggableElementType | "sectionBottom" | "formStructure";

interface DraggingElement {
  type: DraggableElementType;
  id: UniqueIdentifier;
}

interface FormSandboxContext {
  isInternalNamesShown: boolean;
  toggleInternalNamesShown: () => void;
  isConditionsDialogOpen: boolean;
  setIsConditionsDialogOpen: (isOpen: boolean) => void;
}

interface DraggableElementData {
  elementType: DroppableElementType;
  sectionId?: string;
}

const FormSandboxContext = createContext<FormSandboxContext>({
  isInternalNamesShown: false,
  toggleInternalNamesShown: () => null,
  isConditionsDialogOpen: false,
  setIsConditionsDialogOpen: () => null,
});

function useFormSandboxContext() {
  const { ...restContext } = useContext(FormSandboxContext);

  return {
    ...restContext,
  };
}

export { FormSandboxContext, useFormSandboxContext };
export type { DraggingElement, DraggableElementData };
