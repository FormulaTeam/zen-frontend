import { generateSectionId } from "../utils";
import { FormStructure, Section } from "./FormStructureContext";
import { texts } from "../../../utils/texts";

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
      validationErrors: null,
    },
    sections: {
      [sectionId]: { ...INITIAL_SECTION },
    },
    orderedSectionIds: [sectionId],
    fields: {},
    conditions: [],
  };
}

export { getEmptyForm };