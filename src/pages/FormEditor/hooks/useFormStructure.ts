import { useCallback, useState } from "react";
import { FormStructure, Section } from "../context/FormStructureContext";
import { EMPTY_FORM } from "../context/constants";
import { texts } from "../../../utils/texts";
import {v4 as uuid4} from "uuid";
import { FormElementTypeId } from "../../../utils/interfaces";

function yieldFormStructure(form: object) {
  return form as FormStructure; // TODO change to actual logic that translates form json to form structure
}

function useFormStructure(editedForm?: object) { //TODO consider making singleton
  const [formStructure, setFormStructure] = useState<FormStructure>(editedForm ? yieldFormStructure(editedForm) : { ...EMPTY_FORM });

  const appendSection = useCallback(() => {
    setFormStructure((prev) => {
      const newSectionId = `section_${uuid4()}`;
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
    // TODO add orderedSectionIds to formStructure that makes sure the ids stay on track and will also make stuff
    //  like updating indexes on section delete and to append a field to the first section
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

  const appendFieldToMainSection = useCallback((elementTypeId: FormElementTypeId) => {
    // setFormStructure((prev) => {
    //   const changedSection = prev.sections[sectionId];
    //   changedSection.title = title;
    //
    //   return {
    //     ...prev,
    //     sections: {
    //       ...prev.sections,
    //       [sectionId]: changedSection,
    //     },
    //   };
    // });
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