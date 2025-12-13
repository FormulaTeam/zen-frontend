import { useCallback, useState } from "react";
import { FormField, FormMetadata, FormStructure, Section } from "../context/FormStructureContext";
import { getEmptyForm } from "../context/constants";
import { texts } from "../../../utils/texts";
import { FormFieldTypeId } from "../../../utils/interfaces";
import { generateFieldId, generateFieldName, generateSectionId } from "../utils";
import { FormFieldData, FormFieldSchema } from "../schemas/fields";
import { z } from "zod";
import { $ZodErrorTree } from "zod/v4/core";
import { FormMetadataSchema } from "../schemas/metadata";
import { FormConditions, FormConditionsSchema } from "../schemas/conditions";

function yieldFormStructure(form: object) {
  return form as FormStructure; // TODO change to actual logic that translates form json to form structure
}

function pickSharedKeysDeep<T extends object>(
  source: T,
  reference: T,
): $ZodErrorTree<FormFieldData>["properties"] {
  const result: any = {};

  for (const key in reference) {
    if (key in source) {
      const sourceValue = source[key as keyof T];
      const refValue = reference[key as keyof T];

      if (Array.isArray(sourceValue) && Array.isArray(refValue)) {
        // Copy arrays directly (or handle them specially if needed)
        result[key] = sourceValue;
      } else if (
        sourceValue !== null &&
        refValue !== null &&
        typeof sourceValue === "object" &&
        typeof refValue === "object"
      ) {
        result[key] = pickSharedKeysDeep(sourceValue, refValue);
      } else {
        result[key] = sourceValue;
      }
    }
  }

  return result;
}

const validateMetadata = (metadata: FormMetadata) => {
  const result = FormMetadataSchema.safeParse(metadata);

  if (!result.success) {
    return z.flattenError(result.error).fieldErrors;
  }

  return null;
};

const validateFieldData = <T extends FormFieldTypeId>(
  data: Partial<FormFieldData & { typeId: T }>,
) => {
  const result = FormFieldSchema.safeParse(data);

  if (!result.success) {
    return z.treeifyError(result.error)?.properties ?? {};
  }

  return {};
};

const validateField = (prev: FormStructure, fieldId: string) => {
  const result = FormFieldSchema.safeParse({
    ...prev.fields[fieldId].data,
    extra: prev.fields[fieldId].data.extra ?? {}, // empty object fallback is added to be able to validate required extra fields in case the extra object itself has yet to be defined
  });

  if (!result.success) {
    return z.treeifyError(result.error)?.properties ?? {};
  }

  return {};
};

const validateConditions = (conditions: FormConditions) => {
  const result = FormConditionsSchema.safeParse(conditions);

  if (!result.success) {
    return z.treeifyError(result.error) ?? null;
  }

  return null;
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

        const dataToValidate = {
          ...originalData,
          ...data,
          extra: {
            ...originalData.extra,
            ...data.extra,
          },
        } as FormFieldData & { typeId: T };

        const validationErrors =
          pickSharedKeysDeep(
            validateFieldData(dataToValidate),
            originalValidationErrors ?? {},
          );

        return {
          ...prev,
          fields: {
            ...fields,
            [fieldId]: {
              ...field,
              data: dataToValidate,
              validationErrors,
            },
          },
        };
      });
    }, []);

  const setFormMetadata = useCallback((metadata: Partial<FormMetadata>) => {
    let validationErrors: FormStructure["metadata"]["validationErrors"] = {};

    setFormStructure((prev) => {
      const { validationErrors: _, ...prevMetadata } = prev.metadata;

      const combinedMetadata = { ...prevMetadata, ...metadata };

      validationErrors = validateMetadata(combinedMetadata);

      return {
        ...prev,
        metadata: {
          ...combinedMetadata,
          validationErrors,
        },
      };
    });

    return !validationErrors;
  }, []);

  const deleteConditionAt = useCallback((index: number) => {
    setFormStructure((prev) => {
      const conditions = prev.conditions.toSpliced(index, 1);

      return {
        ...prev,
        conditions,
      };
    });
  }, []);

  // const setFormConditions = useCallback((conditions: FormConditions) => {
  //   let validationErrors = validateConditions(conditions);
  //
  //   if (!validationErrors) {
  //     setFormStructure((prev) => {
  //
  //       return {
  //         ...prev,
  //         conditions: [...conditions],
  //       };
  //     });
  //   }
  //
  //   return validationErrors;
  // }, []);

  const validateForm = useCallback(() => {
    setFormStructure((prev) => {
      const fields = { ...prev.fields };
      const { validationErrors: _, ...metadata } = { ...prev.metadata };

      Object.keys(fields).forEach((fieldId) => {
        fields[fieldId] = {
          ...fields[fieldId],
          validationErrors: validateField(prev, fieldId),
        };
      });

      return {
        ...prev,
        fields,
        metadata: {
          ...metadata,
          validationErrors: validateMetadata(metadata),
        },
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

    setFormMetadata,

    deleteConditionAt,

    validateForm,
  };
}

export { useFormStructure };