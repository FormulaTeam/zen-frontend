import { useCallback, useState, useEffect } from "react";
import { z } from "zod";
import { $ZodErrorTree } from "zod/v4/core";
import { cloneDeep, isEqual } from "lodash";

import { fieldType } from "formula-gear";

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
  FormConditionPredicateGroups,
  FormConditions,
  FormConditionSummary,
  predicateGroupsSchema,
} from "../schemas/conditions";
import { ValueOf } from "../../../types/utils";
import type { FormDto, FormSectionDto } from "../../../types/shared";
import { saveFormDraft } from "../utils/draftPersistence";

type ExtendedFormDto = Partial<Omit<FormDto, "sections">> & {
  sections?: Partial<FormSectionDto>[];
};

type FieldValidationErrors = NonNullable<$ZodErrorTree<FormFieldData>["properties"]>;
type UniqueFieldProperty = "name" | "displayName";

const DUPLICATE_FIELD_ERROR_MESSAGES: Record<UniqueFieldProperty, string> = {
  name: "שם פנימי חייב להיות ייחודי בטופס",
  displayName: "שם תצוגה חייב להיות ייחודי בטופס",
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

  const sortedSections = [...(form?.sections || [])].sort(
    (a, b) => (a.index ?? 0) - (b.index ?? 0),
  );

  sortedSections.forEach((sectionData) => {
    const sectionId = sectionData.id?.toString() || generateSectionId();
    orderedSectionIds.push(sectionId);

    const sortedFields = [...(sectionData.fields || [])].sort(
      (a, b) => (a.index ?? 0) - (b.index ?? 0),
    );

    const fieldIds = sortedFields.map((fieldData) => {
      const fieldId = fieldData.id?.toString() || generateFieldId();

      const options = (fieldData as any).options || [];
      const extra = fieldData.extra || {};

      fields[fieldId] = {
        id: fieldId,
        parentSectionId: sectionId,
        data: {
          typeId: fieldData.fieldType as any,
          name: fieldData.name || "",
          displayName: fieldData.displayName || "",
          required: fieldData.isRequired || false,
          extra,
          options,
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
    conditions: (form?.conditions || []) as FormConditions,
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
    extra: prev.fields[fieldId].data.extra ?? {},
  });

  if (!result.success) {
    return z.treeifyError(result.error)?.properties ?? {};
  }

  return {};
};

const getDuplicateFieldIdsByProperty = (
  fields: Record<string, FormField>,
  propertyName: UniqueFieldProperty,
): Set<string> => {
  const fieldIdsByValue = new Map<string, string[]>();

  Object.values(fields).forEach((field) => {
    const value = String((field.data as Record<UniqueFieldProperty, string>)[propertyName] ?? "")
      .trim()
      .toLowerCase();

    if (!value) {
      return;
    }

    fieldIdsByValue.set(value, [...(fieldIdsByValue.get(value) ?? []), field.id]);
  });

  const duplicateFieldIds = new Set<string>();

  fieldIdsByValue.forEach((fieldIds) => {
    if (fieldIds.length > 1) {
      fieldIds.forEach((fieldId) => duplicateFieldIds.add(fieldId));
    }
  });

  return duplicateFieldIds;
};

const removeDuplicateFieldErrors = (
  validationErrors?: $ZodErrorTree<FormFieldData>["properties"] | null,
): FieldValidationErrors => {
  const nextValidationErrors: FieldValidationErrors = {
    ...(validationErrors ?? {}),
  };

  (["name", "displayName"] as UniqueFieldProperty[]).forEach((propertyName) => {
    const propertyError = (nextValidationErrors as any)[propertyName] as
      | { errors?: string[] }
      | undefined;

    if (!propertyError?.errors) {
      return;
    }

    const filteredErrors = propertyError.errors.filter(
      (error) => error !== DUPLICATE_FIELD_ERROR_MESSAGES[propertyName],
    );

    if (filteredErrors.length > 0) {
      (nextValidationErrors as any)[propertyName] = {
        ...propertyError,
        errors: filteredErrors,
      };

      return;
    }

    const { errors: _, ...propertyErrorWithoutErrors } = propertyError;

    if (Object.keys(propertyErrorWithoutErrors).length > 0) {
      (nextValidationErrors as any)[propertyName] = propertyErrorWithoutErrors;
      return;
    }

    delete (nextValidationErrors as any)[propertyName];
  });

  return nextValidationErrors;
};

const addDuplicateFieldError = (
  validationErrors: FieldValidationErrors,
  propertyName: UniqueFieldProperty,
): FieldValidationErrors => {
  const message = DUPLICATE_FIELD_ERROR_MESSAGES[propertyName];
  const propertyError = ((validationErrors as any)[propertyName] ?? {}) as {
    errors?: string[];
  };

  const existingErrors = propertyError.errors ?? [];

  return {
    ...validationErrors,
    [propertyName]: {
      ...propertyError,
      errors: existingErrors.includes(message) ? existingErrors : [...existingErrors, message],
    },
  };
};

const applyDuplicateFieldErrors = (
  fields: Record<string, FormField>,
): Record<string, FormField> => {
  const duplicateNameFieldIds = getDuplicateFieldIdsByProperty(fields, "name");
  const duplicateDisplayNameFieldIds = getDuplicateFieldIdsByProperty(fields, "displayName");

  const updatedFields: Record<string, FormField> = {};

  Object.entries(fields).forEach(([fieldId, field]) => {
    let validationErrors = removeDuplicateFieldErrors(field.validationErrors);

    if (duplicateNameFieldIds.has(fieldId)) {
      validationErrors = addDuplicateFieldError(validationErrors, "name");
    }

    if (duplicateDisplayNameFieldIds.has(fieldId)) {
      validationErrors = addDuplicateFieldError(validationErrors, "displayName");
    }

    updatedFields[fieldId] = {
      ...field,
      validationErrors,
    };
  });

  return updatedFields;
};

const hasFieldValidationErrors = (
  validationErrors?: $ZodErrorTree<FormFieldData>["properties"] | null,
) => !!validationErrors && Object.keys(validationErrors).length > 0;

const validateConditionPredicateGroups = (groups: FormConditionPredicateGroups) => {
  const result = predicateGroupsSchema.safeParse(groups);

  if (!result.success) {
    return z.treeifyError(result.error)?.items ?? null;
  }

  return null;
};

const validateConditionDependantComponents = (
  dependantComponents: FormConditionDependantComponents,
) => {
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

function applyComponentDeletionToConditionsDependantComponents(
  componentType: ValueOf<typeof FormComponentType>,
  componentId: string,
  conditions: FormConditions,
) {
  const modifiedConditions: FormConditions = [];

  conditions.forEach((condition) => {
    let isConditionKept: boolean;

    if (!condition.dependantComponents[componentType]?.length) {
      isConditionKept = true;
    } else {
      const componentIndex = condition.dependantComponents[componentType]?.findIndex(
        (id) => id === componentId,
      );

      if (componentIndex === -1) {
        isConditionKept = true;
      } else if (condition.dependantComponents[componentType]?.length > 1) {
        condition.dependantComponents[componentType]?.splice(componentIndex, 1);
        isConditionKept = true;
      } else {
        delete condition.dependantComponents[componentType];

        isConditionKept = Object.values(condition.dependantComponents).some(
          (dependants) => dependants?.length,
        );
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

function applyComponentDeletionToConditions(
  componentType: ValueOf<typeof FormComponentType>,
  componentId: string,
  conditions: FormConditions,
): FormConditions {
  if (!conditions.length) {
    return conditions;
  }

  let modifiedConditions: FormConditions = [...conditions];

  modifiedConditions = applyComponentDeletionToConditionsDependantComponents(
    componentType,
    componentId,
    modifiedConditions,
  );

  if (modifiedConditions.length) {
    switch (componentType) {
      case "field":
        modifiedConditions = applyFieldDeletionToConditionsPredicates(
          componentId,
          modifiedConditions,
        );
        break;
      default:
        break;
    }
  }

  return modifiedConditions;
}

function useFormStructure(editedForm?: ExtendedFormDto) {
  const [initialFormStructure, setInitialFormStructure] = useState<FormStructure>(() =>
    editedForm ? yieldFormStructure(editedForm) : { ...getEmptyForm() },
  );
  const [formStructure, setFormStructure] = useState<FormStructure>(initialFormStructure);

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
        let conditions = cloneDeep(prev.conditions);
        conditions = applyComponentDeletionToConditions("section", sectionId, conditions);

        sections[sectionId].fieldIds.forEach((fieldId) => {
          conditions = applyComponentDeletionToConditions("field", fieldId, conditions);
          delete fields[fieldId];
        });

        delete sections[sectionId];
        orderedSectionIds.splice(orderedSectionIds.indexOf(sectionId), 1);

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

  const renameSection = useCallback(
    (sectionId: string, title: string) => {
      setFormStructure((prev) => ({
        ...prev,
        sections: {
          ...prev.sections,
          [sectionId]: {
            ...prev.sections[sectionId],
            title,
          },
        },
      }));
    },
    [setFormStructure],
  );

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

  const appendFieldToLastSection = useCallback(
    (elementTypeId: FormFieldTypeId) => {
      setFormStructure((prev) => {
        if (prev.orderedSectionIds.length === 0) {
          return prev;
        }

        const lastSectionIndex = prev.orderedSectionIds.length - 1;
        const changedSectionId = prev.orderedSectionIds[lastSectionIndex];
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
    },
    [setFormStructure],
  );

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

        const validationErrors = pickSharedKeysDeep(
          validateFieldData(dataToValidate),
          originalValidationErrors ?? {},
        );

        const updatedFields = {
          ...fields,
          [fieldId]: {
            ...field,
            data: dataToValidate,
            validationErrors,
          },
        };

        return {
          ...prev,
          fields: applyDuplicateFieldErrors(updatedFields),
        };
      });
    },
    [],
  );

  const setFormMetadata = useCallback((metadata: Partial<FormMetadata>) => {
    let isValueValid = true;

    setFormStructure((prev) => {
      const { validationErrors: _, ...prevMetadata } = prev.metadata;
      const combinedMetadata = { ...prevMetadata, ...metadata };

      const isOnlyIconChange = Object.keys(metadata).length === 1 && "iconId" in metadata;

      let validationErrors = prev.metadata.validationErrors;

      if (!isOnlyIconChange) {
        validationErrors = validateMetadata(combinedMetadata);

        if (validationErrors && Object.keys(validationErrors).length > 0) {
          isValueValid = false;
        } else {
          validationErrors = null;
        }
      }

      return {
        ...prev,
        metadata: {
          ...combinedMetadata,
          validationErrors,
        },
      };
    });

    return isValueValid;
  }, []);

  const appendCondition = useCallback((condition: FormCondition) => {
    const validationErrors = validateCondition(condition);

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
    const validationErrors = validateCondition(condition);

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
    let fieldsValid = true;
    let fieldErrorsCount = 0;

    const fields = { ...formStructure.fields };
    const { validationErrors: _, ...metadata } = { ...formStructure.metadata };

    Object.keys(fields).forEach((fieldId) => {
      fields[fieldId] = {
        ...fields[fieldId],
        validationErrors: validateField(formStructure, fieldId),
      };
    });

    const fieldsWithDuplicateErrors = applyDuplicateFieldErrors(fields);

    Object.values(fieldsWithDuplicateErrors).forEach((field) => {
      if (hasFieldValidationErrors(field.validationErrors)) {
        fieldsValid = false;
        fieldErrorsCount++;
      }
    });

    let sectionsValid = true;
    const updatedSections = { ...formStructure.sections };

    Object.keys(updatedSections).forEach((sectionId) => {
      const section = updatedSections[sectionId];

      if (section.fieldIds.length === 0) {
        updatedSections[sectionId] = {
          ...section,
          validationErrors: [texts.heb.emptySectionAlert],
        };
        sectionsValid = false;
      } else {
        updatedSections[sectionId] = {
          ...section,
          validationErrors: null,
        };
      }
    });

    const metadataErrors = validateMetadata(metadata) || {};
    const hasMetadataErrors = Object.keys(metadataErrors).length > 0;
    const hasFields = Object.keys(fields).length > 0;

    const fieldValues = Object.values(fields);
    const hasOnlyFormInFormField = fieldValues.length === 1 && fieldValues[0].data?.typeId === fieldType.Form;

    const isValid = fieldsValid && sectionsValid && !hasMetadataErrors && hasFields && !hasOnlyFormInFormField;

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
        fields: applyDuplicateFieldErrors(updatedFields),
        sections: updatedSections,
        metadata: {
          ...prevMetadata,
          validationErrors: hasMetadataErrors ? metadataErrors : null,
        },
      };
    });

    return {
      isValid,
      fieldsValid: fieldsValid && sectionsValid,
      fieldErrorsCount,
      metadataErrors,
      hasFields,
    };
  }, [formStructure]);

  const checkHasChanges = useCallback(() => {
    return !isEqual(formStructure, initialFormStructure);
  }, [formStructure, initialFormStructure]);

  useEffect(() => {
    if (checkHasChanges()) {
      saveFormDraft(formStructure.metadata.id, formStructure);
    }
  }, [formStructure, checkHasChanges]);

  return {
    formStructure,
    setFormStructure,
    checkHasChanges,
    appendSection,
    deleteSection,
    renameSection,
    toggleSectionExpanded,

    appendFieldToLastSection,
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

export type { validateCondition };
