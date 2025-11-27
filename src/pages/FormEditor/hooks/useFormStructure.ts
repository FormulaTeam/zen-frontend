import { useCallback, useState } from "react";
import { FormField, FormStructure, Section } from "../context/FormStructureContext";
import { getEmptyForm } from "../context/constants";
import { texts } from "../../../utils/texts";
import { FormFieldTypeId } from "../../../utils/interfaces";
import { generateFieldId, generateFieldName, generateSectionId } from "../utils";
import { FormFieldData, FormFieldSchema } from "../schemas";
import { z } from "zod";

function yieldFormStructure(form: object) {
  return form as FormStructure; // TODO change to actual logic that translates form json to form structure
}

function mergeKeys(
  objA: object,
  objB: object,
  keys: (string | number)[],
) {
  return {
    ...objA,
    ...Object.fromEntries(keys.map(key => [key, objB[key]])),
  };
}

function pickFieldsFromSchema<T extends FormFieldTypeId>(
  union: typeof FormFieldSchema,
  discriminatorValue: T,
  fields: string[],
) {
  const options = union.options;
  const discriminatorKey = union.def.discriminator;

  const specificSchema = options.find(
    (option) => option.shape[discriminatorKey]!.value === discriminatorValue,
  )!;

  if (!specificSchema) {
    throw new Error(`No schema found for discriminator: ${discriminatorValue}`);
  }

  const pickMap = Object.fromEntries(
    fields.map(key => [key, true]),
  ) as Record<string, true>;

  return specificSchema.pick(pickMap);
}

const validateFieldData = <T extends FormFieldTypeId>(
  typeId: T,
  data: Partial<FormFieldData & { typeId: T }>,
) => {
  const result = pickFieldsFromSchema(FormFieldSchema, typeId, Object.keys(data)).safeParse(data);

  if (!result.success) {
    // @ts-ignore
    return z.treeifyError(result.error)?.properties ?? {};
  }

  return {};
};

const validateField = (prev: FormStructure, fieldId: string) => {
  const result = FormFieldSchema.safeParse(prev.fields[fieldId].data);

  if (!result.success) {
    return z.treeifyError(result.error)?.properties ?? {};
  }

  return {};
};

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

  const appendFieldToFirstSection = useCallback((elementTypeId: FormFieldTypeId) => {
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
      if (!(fieldId in prev.fields)) {
        return prev;
      }

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

  const setFieldData = useCallback(
    <T extends FormFieldTypeId>(fieldId: string, data: Partial<FormFieldData & { typeId: T }>) => {
      setFormStructure((prev) => {
        if (!(fieldId in prev.fields)) {
          return prev;
        }

        const fields = { ...prev.fields };
        const field = fields[fieldId];
        const originalData = field.data;
        const originalValidationErrors = field.validationErrors;

        const validationErrors = mergeKeys(
          originalValidationErrors ?? {} as Partial<FormFieldData>,
          validateFieldData(field.data.typeId, data) ?? {} as Partial<FormFieldData>,
          Object.keys(data) as (keyof FormFieldData)[],
        );

        console.log(
          {
            ...originalData.extra,
            ...data.extra,
          });

        return {
          ...prev,
          fields: {
            ...fields,
            [fieldId]: {
              ...field,
              data: {
                ...originalData,
                ...data,
                extra: data.extra ?
                  {
                    ...originalData.extra,
                    ...data.extra,
                  } :
                  undefined,
              } as FormFieldData & { typeId: T },
              validationErrors,
            },
          },
        };
      });
    }, []);

  const validateForm = useCallback(() => {
    setFormStructure((prev) => {
      const fields = { ...prev.fields };

      Object.keys(fields).forEach((fieldId) => {
        fields[fieldId] = {
          ...fields[fieldId],
          validationErrors: validateField(prev, fieldId),
        };
      });

      return {
        ...prev,
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
    setFieldData,
    validateForm,
  };
}

export { useFormStructure };