import { FormStructure, Section } from "./FormStructureContext";
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
      validationErrors: null,
    },
    sections: {
      [sectionId]: { ...INITIAL_SECTION },
    },
    orderedSectionIds: [sectionId],
    fields: {},
  };
}

export { getEmptyForm, PLACEHOLDER_FIELD_ID };