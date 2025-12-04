import { FormStructure, Section } from "./FormStructureContext";
import { DraggingState } from "./FormSandboxContext";
import { texts } from "../../../utils/texts";
import { generateSectionId } from "../utils";

const PLACEHOLDER_FIELD_ID: string = "__PLACEHOLDER__" as const;

const INITIAL_SECTION: Section = {
  title: texts.heb.mainSection,
  expanded: true,
  fieldIds: [],
};

function getEmptyForm(): FormStructure {
  const sectionId = generateSectionId();

  return {
    metadata: {
      title: "",
    },
    sections: {
      [sectionId]: { ...INITIAL_SECTION },
    },
    orderedSectionIds: [sectionId],
    fields: {},
  };
}

const DEFAULT_DRAGGING_STATE: DraggingState = {
  isDragging: false,
  draggingElement: null,
};

export { getEmptyForm, DEFAULT_DRAGGING_STATE, PLACEHOLDER_FIELD_ID };