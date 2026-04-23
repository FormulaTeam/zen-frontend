import { useCallback, useState, useEffect } from "react";
import { z } from "zod";
import { $ZodErrorTree } from "zod/v4/core";
import { isEqual } from "lodash";

import { FormField, FormMetadata, FormStructure, Section } from "../context/FormStructureContext";
import { getEmptyForm } from "../context/utils";
import { texts } from "@utils/texts";
import { FormFieldTypeId } from "@utils/interfaces";
import { generateFieldId, generateNewFieldData, generateSectionId } from "../utils";
import { FormFieldData, FormFieldSchema } from "../schemas/fields";
import { FormMetadataSchema } from "../schemas/metadata";
import {
  conditionDependantComponentsSchema,
  conditionSchema,
  conditionSummarySchema,
  FormComponentType,
  FormCondition,
  FormConditionDependantComponents,
  FormConditionPredicateGroups, FormConditions,
  FormConditionSummary,
  predicateGroupsSchema,
} from "../schemas/conditions";
import { ValueOf } from "../../../types/utils";
import type { FormDto, FormSectionDto } from "../../../types/shared";

type ExtendedFormDto = Partial<Omit<FormDto, 'sections'>> & {
  conditions?: FormConditions;
  sections?: Partial<FormSectionDto>[];
};

function yieldFormStructure(form?: ExtendedFormDto): FormStructure {
  const metadata = {
    id: form?.id,
    title: form?.name || "",
    description: form?.description || undefined,
    iconId: typeof form?.icon === "string" ? form.icon : undefined,
    validationErrors: null,
  };

  const sections: Record<string, Section> = {};
  const orderedSectionIds: string[] = [];
  const fields: Record<string, FormField> = {};

  const sortedSections = [...(form?.sections || [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

  sortedSections.forEach((sectionData) => {
    const sectionId = sectionData.id?.toString() || generateSectionId();
    orderedSectionIds.push(sectionId);

    const sortedFields = [...(sectionData.fields || [])].sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const fieldIds = sortedFields.map((fieldData) => {
      const fieldId = fieldData.id?.toString() || generateFieldId();

      fields[fieldId] = {
        id: fieldId,
        parentSectionId: sectionId,
        data: {
          typeId: fieldData.fieldType as any,
          name: fieldData.name || "",
          displayName: fieldData.displayName || "",
          required: fieldData.isRequired || false,
          extra: fieldData.extra || {},
        },
        validationErrors: null,
      };

      return fieldId;
    });

    sections[sectionId] = {
      title: sectionData.name || "",
      expanded: true,
      fieldIds,
    };
  });

  return {
    metadata,
    sections,
    orderedSectionIds,
    fields,
    conditions: form?.conditions || [],
  };
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

const validateConditionPredicateGroups = (groups: FormConditionPredicateGroups) => {
  const result = predicateGroupsSchema.safeParse(groups);

  if (!result.success) {
    return z.treeifyError(result.error)?.items ?? null;
  }

  return null;
};

const validateConditionDependantComponents = (dependantComponents: FormConditionDependantComponents) => {
  const result = conditionDependantComponentsSchema.safeParse(dependantComponents);

  if (!result.success) {
    return z.treeifyError(result.error)?.errors ?? null;
  }

  return null;
};

const validateConditionSummary = (summary: FormConditionSummary) => {
  const result = conditionSummarySchema.safeParse(summary);

  if (!result.success) {
    return z.treeifyError(result.error)?.properties ?? null;
  }

  return null;
};

const validateCondition = (condition: FormCondition) => {
  const result = conditionSchema.safeParse(condition);

  if (!result.success) {
    return z.treeifyError(result.error)?.properties ?? null;
  }

  return null;
};

function applyComponentDeletionToConditionsDependantComponents(componentType: ValueOf<typeof FormComponentType>, componentId: string, conditions: FormConditions) {
  const modifiedConditions: FormConditions = [];

  conditions.forEach((condition) => {
    let isConditionKept: boolean;

    if (!condition.dependantComponents[componentType]?.length) {
      isConditionKept = true;
    } else {

      const componentIndex = condition.dependantComponents[componentType]?.findIndex((id) => id === componentId);

      if (componentIndex === -1) {
        isConditionKept = true;
      } else if (condition.dependantComponents[componentType]?.length > 1) {
        condition.dependantComponents[componentType]?.splice(componentIndex, 1);
        isConditionKept = true;
      } else {
        delete condition.dependantComponents[componentType];

        isConditionKept = Object.values(condition.dependantComponents).some((dependants) => dependants?.length);
      }
    }

    isConditionKept && modifiedConditions.push(condition);
  });

  return modifiedConditions;
}

function applyFieldDeletionToConditionsPredicates(fieldId: string, conditions: FormConditions) {
  const modifiedConditions: FormConditions = [];

  conditions.forEach((condition) => {
    condition.groups = condition.groups.filter((group) => {
      group.predicates = group.predicates.filter(({ field }) => field.id !== fieldId);

      const isGroupKept = group.predicates.length;

      if (isGroupKept) {
        delete group.predicates[0].operator;
      }

      return isGroupKept;
    });

    const isConditionKept = condition.groups.length;

    if (isConditionKept) {
      delete condition.groups[0].operator;
    }

    isConditionKept && modifiedConditions.push(condition);
  });

  return modifiedConditions;
}

function applyComponentDeletionToConditions(componentType: ValueOf<typeof FormComponentType>, componentId: string, conditions: FormConditions): FormConditions {
  if (!conditions.length) {
    return conditions;
  }

  let modifiedConditions: FormConditions = [...conditions];

  modifiedConditions = applyComponentDeletionToConditionsDependantComponents(componentType, componentId, modifiedConditions);

  if (modifiedConditions.length) {
    switch (componentType) {
      case "field":
        modifiedConditions = applyFieldDeletionToConditionsPredicates(componentId, modifiedConditions);
        break;
      default:
        break;
    }
  }

  return modifiedConditions;
}

function useFormStructure(editedForm?: ExtendedFormDto) {
  const [initialFormStructure, setInitialFormStructure] = useState<FormStructure>(() => editedForm ? yieldFormStructure(editedForm) : { ...getEmptyForm() });
  const [formStructure, setFormStructure] = useState<FormStructure>(initialFormStructure);

  // When editedForm updates from external fetching properly sync the visual state
  useEffect(() => {
    if (editedForm) {
      const newStructure = yieldFormStructure(editedForm);
      setInitialFormStructure(newStructure);
      setFormStructure(newStructure);
    }
  }, [editedForm]);

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

        const conditions = applyComponentDeletionToConditions("section", sectionId, prev.conditions);

        return {
          ...prev,
          sections,
          fields,
          orderedSectionIds,
          conditions,
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
        data: generateNewFieldData(elementTypeId),
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

      const conditions = applyComponentDeletionToConditions("field", fieldId, prev.conditions);

      return {
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: section,
        },
        fields,
        conditions,
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
    let isValid = true;

    setFormStructure((prev) => {
      const { validationErrors: _, ...prevMetadata } = prev.metadata;

      const combinedMetadata = { ...prevMetadata, ...metadata };

      const validationErrors = validateMetadata(combinedMetadata);
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        isValid = false;
        return {
          ...prev,
          metadata: {
            ...prevMetadata,
            validationErrors,
          },
        };
      }

      return {
        ...prev,
        metadata: {
          ...combinedMetadata,
          validationErrors: {},
        },
      };
    });

    return isValid;
  }, []);

  const appendCondition = useCallback((condition: FormCondition) => {
    let validationErrors = validateCondition(condition);

    if (!validationErrors) {
      setFormStructure((prev) => {
        return {
          ...prev,
          conditions: [...prev.conditions, condition],
        };
      });
    }

    return validationErrors;
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

  const setConditionDataAt = useCallback((index: number, condition: FormCondition) => {
    let validationErrors = validateCondition(condition);

    if (!validationErrors) {
      setFormStructure((prev) => {
        const conditions = prev.conditions.toSpliced(index, 1, condition);

        return {
          ...prev,
          conditions,
        };
      });
    }

    return validationErrors;
  }, []);

  const validateForm = useCallback(() => {
    let isValid = true;

    const fields = { ...formStructure.fields };
    const { validationErrors: _, ...metadata } = { ...formStructure.metadata };

    Object.keys(fields).forEach((fieldId) => {
      const fieldValidationErrors = validateField(formStructure, fieldId);
      if (Object.keys(fieldValidationErrors).length > 0) isValid = false;
    });

    const metadataValidationErrors = validateMetadata(metadata);
    if (metadataValidationErrors && Object.keys(metadataValidationErrors).length > 0) isValid = false;

    setFormStructure((prev) => {
      const updatedFields = { ...prev.fields };
      const { validationErrors: __, ...prevMetadata } = { ...prev.metadata };

      Object.keys(updatedFields).forEach((fieldId) => {
        updatedFields[fieldId] = {
          ...updatedFields[fieldId],
          validationErrors: validateField(prev, fieldId),
        };
      });

      return {
        ...prev,
        fields: updatedFields,
        metadata: {
          ...prevMetadata,
          validationErrors: validateMetadata(prevMetadata),
        },
      };
    });

    return isValid;
  }, [formStructure]);

  const checkHasChanges = useCallback(() => {
    return !isEqual(formStructure, initialFormStructure);
  }, [formStructure, initialFormStructure]);

  return {
    formStructure,
    setFormStructure,
    checkHasChanges,
    appendSection,
    deleteSection,
    renameSection,
    toggleSectionExpanded,

    appendFieldToFirstSection,
    deleteField,
    setFieldData,

    setFormMetadata,

    appendCondition,
    deleteConditionAt,
    setConditionDataAt,

    validateForm,
  };
}

export {
  useFormStructure,
  validateConditionPredicateGroups,
  validateConditionDependantComponents,
  validateConditionSummary,
};

export type {
  validateCondition,
};