import { useCallback, useState } from "react";
import { FormField, FormStructure, Section } from "../context/FormStructureContext";
import { getEmptyForm } from "../context/constants";
import { texts } from "../../../utils/texts";
import { FormElementTypeId } from "../../../utils/interfaces";
import { generateFieldId, generateFieldName, generateSectionId } from "../utils";

function yieldFormStructure(form: object) {
  return form as FormStructure; // TODO change to actual logic that translates form json to form structure
}

function useFormStructure(editedForm?: object) { //TODO consider making singleton
  const [formStructure, setFormStructure] = useState<FormStructure>(editedForm ? yieldFormStructure(editedForm) : { ...getEmptyForm() });

  const appendSection = useCallback(() => {
    setFormStructure((prev) => {
      const newSectionId = generateSectionId();
      const newSection: Section = {
        title: texts.heb.undefinedSection,
        expanded: true,
        fieldIds: [],
      };

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [newSectionId]: newSection,
        },
        orderedSectionIds: [...prev.orderedSectionIds, newSectionId],
      };
    });
  }, [setFormStructure]);

  const deleteSection = useCallback((sectionId: string) => {
    setFormStructure((prev) => {
      const sections = { ...prev.sections };
      const fields = { ...prev.fields };
      const orderedSectionIds = [...prev.orderedSectionIds];

      if (Object.keys(sections).length > 1) {
        sections[sectionId].fieldIds.forEach((fieldId) => delete fields[fieldId]);
        delete sections[sectionId];

        orderedSectionIds.splice(orderedSectionIds.indexOf(sectionId), 1);

        return {
          ...prev,
          sections,
          fields,
          orderedSectionIds,
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

  const toggleSectionExpanded = useCallback((sectionId: string) => {
    setFormStructure((prev) => {
      if (sectionId in prev.sections) {
        const editedSection = { ...prev.sections[sectionId] };

        return {
          ...prev,
          sections: {
            ...prev.sections,
            [sectionId]: {
              ...editedSection,
              expanded: !editedSection.expanded,
            },
          },
        };
      }

      return prev;
    });
  }, []);

  const appendFieldToFirstSection = useCallback((elementTypeId: FormElementTypeId) => {
    setFormStructure((prev) => {
      const changedSectionId = prev.orderedSectionIds[0];
      const changedSection = prev.sections[changedSectionId];

      const newField: FormField = {
        id: generateFieldId(),
        parentSectionId: changedSectionId,
        data: {
          typeId: elementTypeId,
          name: generateFieldName(elementTypeId),
          displayName: "",
          required: false,
        },
      };

      const fieldIds = [...changedSection.fieldIds, newField.id];

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [changedSectionId]: {
            ...changedSection,
            fieldIds,
          },
        },
        fields: {
          ...prev.fields,
          [newField.id]: newField,
        },
      };
    });
  }, [setFormStructure]);

  const deleteField = useCallback((fieldId: string) => {
    setFormStructure((prev) => {
      const fields = { ...prev.fields };
      const sectionId = fields[fieldId].parentSectionId;
      const section = { ...prev.sections[sectionId] };

      section.fieldIds.splice(section.fieldIds.indexOf(fieldId), 1);

      delete fields[fieldId];

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: section,
        },
        fields,
      };
    });
  }, []);

  return {
    formStructure,
    setFormStructure,
    appendSection,
    deleteSection,
    renameSection,
    toggleSectionExpanded,

    appendFieldToFirstSection,
    deleteField,
  };
}

export { useFormStructure };