import { useCallback, useState } from "react";
import { FormStructure, Section } from "../context/FormStructureContext";
import { EMPTY_FORM } from "../context/constants";
import { texts } from "../../../utils/texts";

function yieldFormStructure(form: object) {
  return form as FormStructure; // TODO change to actual logic that translates form json to form structure
}

function useFormStructure(editedForm?: object) { //TODO consider making singleton
  const [formStructure, setFormStructure] = useState<FormStructure>(editedForm ? yieldFormStructure(editedForm) : { ...EMPTY_FORM });

  const appendSection = useCallback(() => {
    setFormStructure((prev) => {
      const newSectionId = `section_${Date.now()}`;
      const newSection: Section = {
        title: texts.heb.undefinedSection,
        index: Object.keys(prev.sections).length,
        collapsed: false,
        fieldIds: [],
      };

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [newSectionId]: newSection,
        },
      };
    });
  }, [setFormStructure]);

  const deleteSection = useCallback((sectionId: string) => {
    setFormStructure((prev) => {
      const remainingSections = { ...prev.sections };

      if (Object.keys(remainingSections).length > 1) { // TODO show error popup when trying to delete the last section
        delete remainingSections[sectionId];

        return {
          ...prev,
          sections: { ...remainingSections },
        };
      }

      return prev;
    });
  }, []);

  const renameSection = useCallback((sectionId: string, title: string) => {
    setFormStructure((prev) => {
      const changedSection = prev.sections[sectionId];
      changedSection.title = title;

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: changedSection,
        },
      };
    });
  }, [setFormStructure]);

  return {
    formStructure,
    setFormStructure,
    appendSection,
    deleteSection,
    renameSection,
  };
}

export { useFormStructure };