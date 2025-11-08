import { FormStructure, Section } from "./FormStructureContext";
import { DraggingState } from "./FormSandboxContext";
import { texts } from "../../../utils/texts";
import { v4 as uuid4 } from "uuid";

const INITIAL_SECTION: Section = {
  title: texts.heb.mainSection,
  index: 0,
  collapsed: false,
  fieldIds: [],
};

const EMPTY_FORM: FormStructure = {
  title: null,
  sections: {
    [`section_${uuid4()}`]: { ...INITIAL_SECTION },
  },
  fields: {},
};


const DEFAULT_DRAGGING_STATE: DraggingState = {
  isDragging: false,
  draggingElement: null,
};

export { EMPTY_FORM, DEFAULT_DRAGGING_STATE };