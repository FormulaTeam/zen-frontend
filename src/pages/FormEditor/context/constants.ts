import { FormStructure } from "./FormStructureContext";
import { DraggingState } from "./FormSandboxContext";

const EMPTY_FORM: FormStructure = {
  title: null,
  sections: [],
  fields: [],
};

const DEFAULT_DRAGGING_STATE: DraggingState = {
  origin: null,
  isDragging: false,
};

export { EMPTY_FORM, DEFAULT_DRAGGING_STATE };