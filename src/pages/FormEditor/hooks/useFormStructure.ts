import { useCallback, useEffect, useState } from "react";
import { FormStructure, Section } from "../context/FormStructureContext";
import { EMPTY_FORM } from "../context/constants";
import { texts } from "../../../utils/texts";

function yieldFormStructure(form: object) {
  return form as FormStructure; // TODO change to actual logic that translates form json to form structure
}

function useFormStructure(editedForm?: object) { //TODO consider making singleton
  const [formStructure, setFormStructure] = useState<FormStructure>(editedForm ? yieldFormStructure(editedForm) : { ...EMPTY_FORM });

  useEffect(() => {
    console.log(formStructure.sections);
  }, [formStructure.sections]);

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

  return {
    formStructure,
    appendSection,
  };
}

export { useFormStructure };