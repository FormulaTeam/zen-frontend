import { FormStructure, Section } from "./FormStructureContext";
import { DraggingState } from "./FormSandboxContext";
import { texts } from "../../../utils/texts";

const INITIAL_SECTION: Section = {
  title: texts.heb.mainSection,
  index: 0,
  collapsed: false,
  fieldIds: [],
};

const EMPTY_FORM: FormStructure = {
  title: null,
  sections: {
    [`section_${Date.now()}`]: { ...INITIAL_SECTION }, //TODO change section id to UUID
  },
  fields: {},
};

const DEFAULT_DRAGGING_STATE: DraggingState = {
  isDragging: false,
  draggingElement: null,
};

export { EMPTY_FORM, DEFAULT_DRAGGING_STATE };