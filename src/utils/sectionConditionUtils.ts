import { FormField, ConditionGroup } from "../utils/interfaces";
import moment from "moment";

/**
 * Utility functions for managing automatic condition inheritance in form sections
 */

// ————————————————————————————————————————————————————————————
// Helpers
// ————————————————————————————————————————————————————————————

// Normalize a section id by stripping a known prefix, if present
const normalizeSectionId = (id?: string): string | undefined => id?.replace(/^formFields_/, "");

// Deep, stable string for values (order-insensitive for object keys)
const stableValueString = (value: unknown): string => {
  const type = typeof value;
  if (value === null || type === "number" || type === "string" || type === "boolean") {
    return JSON.stringify(value);
  }
  if (value instanceof Date) {
    const momentValue = moment(value);
    if (!momentValue.isValid()) {
      return "";
    }
    return `"${momentValue.toISOString()}"`;
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableValueString(item)).join(",")}]`;
  }
  if (type === "object" && value) {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    const entries = keys.map((key) => `${JSON.stringify(key)}:${stableValueString(obj[key])}`);
    return `{${entries.join(",")}}`;
  }
  // Functions/undefined/symbols etc - fallback
  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
};

// Clone values safely for our known JSON-like shapes
const cloneValue = <T>(value: T): T => {
  if (value === null || typeof value !== "object") return value;
  if (value instanceof Date) return new Date(value.getTime()) as unknown as T;
  if (Array.isArray(value)) return value.map((item) => cloneValue(item)) as unknown as T;
  const cloned: Record<string, unknown> = {};
  for (const key of Object.keys(value as Record<string, unknown>)) {
    cloned[key] = cloneValue((value as Record<string, unknown>)[key]);
  }
  return cloned as T;
};

// Sort conditions deterministically by (field, operator, value)
const sortConditions = (
  conditions: NonNullable<ConditionGroup["conditions"]>,
): NonNullable<ConditionGroup["conditions"]> => {
  return [...conditions].sort((a, b) => {
    const aField = a.field ?? "";
    const bField = b.field ?? "";
    if (aField !== bField) return aField < bField ? -1 : 1;
    const aOperator = a.operator ?? "";
    const bOperator = b.operator ?? "";
    if (aOperator !== bOperator) return aOperator < bOperator ? -1 : 1;
    const aValue = stableValueString(a.value);
    const bValue = stableValueString(b.value);
    return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
  });
};

// Normalize a group for comparison (without mutating original)
const normalizeGroupForCompare = (group: ConditionGroup) => {
  return {
    conditionSetId: group.conditionSetId ?? undefined,
    logicalOperator: group.logicalOperator,
    parentLogicalOperator: group.parentLogicalOperator,
    conditions: sortConditions(group.conditions ?? []),
  };
};

// Compare two groups for equality (order-insensitive for inner conditions)
const areConditionGroupsEqual = (groupA: ConditionGroup, groupB: ConditionGroup): boolean => {
  const normalizedA = normalizeGroupForCompare(groupA);
  const normalizedB = normalizeGroupForCompare(groupB);

  if (
    normalizedA.conditionSetId !== normalizedB.conditionSetId ||
    normalizedA.logicalOperator !== normalizedB.logicalOperator ||
    normalizedA.parentLogicalOperator !== normalizedB.parentLogicalOperator ||
    normalizedA.conditions.length !== normalizedB.conditions.length
  ) {
    return false;
  }

  for (let i = 0; i < normalizedA.conditions.length; i++) {
    const aCondition = normalizedA.conditions[i];
    const bCondition = normalizedB.conditions[i];
    if (
      (aCondition.field ?? "") !== (bCondition.field ?? "") ||
      (aCondition.operator ?? "") !== (bCondition.operator ?? "") ||
      stableValueString(aCondition.value) !== stableValueString(bCondition.value)
    ) {
      return false;
    }
  }
  return true;
};

// Compare arrays of groups, order-insensitive. Prefer matching by conditionSetId when present.
const areGroupArraysEqual = (groupsA: ConditionGroup[], groupsB: ConditionGroup[]): boolean => {
  if (groupsA.length !== groupsB.length) return false;

  const mapById = (groups: ConditionGroup[]) => {
    const idMap = new Map<string, ConditionGroup>();
    const noId: ConditionGroup[] = [];
    for (const group of groups) {
      if (group.conditionSetId) idMap.set(group.conditionSetId, group);
      else noId.push(group);
    }
    return { idMap, noId };
  };

  const mappedGroupsA = mapById(groupsA);
  const mappedGroupsB = mapById(groupsB);

  // Compare by ids first
  if (mappedGroupsA.idMap.size !== mappedGroupsB.idMap.size) return false;
  for (const [id, groupA] of mappedGroupsA.idMap) {
    const groupB = mappedGroupsB.idMap.get(id);
    if (!groupB || !areConditionGroupsEqual(groupA, groupB)) return false;
  }

  // Compare no-id groups by multiset of canonical signatures
  const groupSignature = (group: ConditionGroup) => {
    const normalized = normalizeGroupForCompare(group);
    const formattedConditions = normalized.conditions
      .map(
        (condition) =>
          `${condition.field ?? ""}|${condition.operator ?? ""}|${stableValueString(
            condition.value,
          )}`,
      )
      .join(";");
    return `${normalized.logicalOperator}|${normalized.parentLogicalOperator}|${formattedConditions}`;
  };

  const aSignatures = mappedGroupsA.noId.map(groupSignature).sort();
  const bSignatures = mappedGroupsB.noId.map(groupSignature).sort();
  if (aSignatures.length !== bSignatures.length) return false;
  for (let i = 0; i < aSignatures.length; i++) if (aSignatures[i] !== bSignatures[i]) return false;
  return true;
};

// Deep clone of condition groups (no references shared)
const deepCloneConditionGroups = (groups: ConditionGroup[]): ConditionGroup[] =>
  groups.map((group) => ({
    id: group.id,
    name: group.name,
    conditionSetId: group.conditionSetId,
    logicalOperator: group.logicalOperator,
    parentLogicalOperator: group.parentLogicalOperator,
    conditions: (group.conditions ?? []).map((condition) => ({
      id: condition.id,
      field: condition.field,
      operator: condition.operator,
      value: cloneValue(condition.value),
    })),
  }));

// Merge with de-duplication by structural signature (keeps the first identical group only)
const mergeConditionGroupsDedup = (
  existing: ConditionGroup[],
  incoming: ConditionGroup[],
): ConditionGroup[] => {
  const processedSignatures = new Set<string>();
  const merged: ConditionGroup[] = [];
  const signatureOfGroup = (group: ConditionGroup) => {
    const normalized = normalizeGroupForCompare(group);
    const conditionsSignature = normalized.conditions
      .map(
        (condition) =>
          `${condition.field ?? ""}|${condition.operator ?? ""}|${stableValueString(
            condition.value,
          )}`,
      )
      .join(";");
    return `${normalized.conditionSetId ?? "_"}|${normalized.logicalOperator}|${
      normalized.parentLogicalOperator ?? "_"
    }|${conditionsSignature}`;
  };
  const addIfNotSeen = (group: ConditionGroup) => {
    const signature = signatureOfGroup(group);
    if (processedSignatures.has(signature)) return;
    processedSignatures.add(signature);
    merged.push(group);
  };
  existing.forEach(addIfNotSeen);
  incoming.forEach(addIfNotSeen);
  return merged;
};

/**
 * Checks if all fields in a section have the same conditions
 * @param fields - Array of form fields
 * @param sectionId - Section ID to check
 * @returns The common conditions if all fields have the same conditions, null otherwise
 */
export const getSectionWideConditions = (
  fields: FormField[],
  sectionId: string,
): ConditionGroup[] | null => {
  const fieldsInSection = fields.filter((field) => {
    const fieldSectionId = normalizeSectionId(field.sectionId);
    const targetSectionId = normalizeSectionId(sectionId);
    return fieldSectionId === targetSectionId;
  });

  if (fieldsInSection.length === 0) {
    return null;
  }

  // Get conditions from the first field
  const firstFieldConditions = fieldsInSection[0]?.conditions;

  if (!firstFieldConditions || firstFieldConditions.length === 0) {
    return null;
  }

  // Check if all other fields have the same conditions (order-insensitive, deep compare)
  const allFieldsHaveSameConditions = fieldsInSection.slice(1).every((field) => {
    const fieldConditions = field.conditions ?? [];
    return areGroupArraysEqual(firstFieldConditions, fieldConditions);
  });

  return allFieldsHaveSameConditions ? firstFieldConditions : null;
};

/**
 * Applies conditions to a field
 * @param field - The field to apply conditions to
 * @param conditions - The conditions to apply
 * @returns Updated field with conditions applied
 */
export const applyConditionsToField = (
  field: FormField,
  conditions: ConditionGroup[],
): FormField => {
  return {
    ...field,
    conditions: conditions.length > 0 ? deepCloneConditionGroups(conditions) : undefined,
  };
};

/**
 * Removes specific conditions from a field based on condition set ID
 * @param field - The field to remove conditions from
 * @param conditionSetId - The condition set ID to remove
 * @returns Updated field with specified conditions removed
 */
export const removeConditionsFromField = (field: FormField, conditionSetId: string): FormField => {
  if (!field.conditions) {
    return field;
  }

  const remainingConditions = field.conditions.filter(
    (group) => group.conditionSetId !== conditionSetId,
  );

  return {
    ...field,
    conditions: remainingConditions.length > 0 ? remainingConditions : undefined,
  };
};

/**
 * Checks if a field should inherit section conditions when added/moved to a section
 * @param formFields - All form fields
 * @param targetSectionId - The section the field is being added/moved to
 * @param fieldToCheck - The field being added/moved
 * @returns Conditions to apply if section has uniform conditions, null otherwise
 */
export const shouldInheritSectionConditions = (
  formFields: FormField[],
  targetSectionId: string,
  fieldToCheck: FormField,
): ConditionGroup[] | null => {
  // Get all fields in the target section except the field being moved/added
  const otherFieldsInSection = formFields.filter((field) => {
    const fieldSectionId = normalizeSectionId(field.sectionId);
    const cleanTargetSectionId = normalizeSectionId(targetSectionId);
    return fieldSectionId === cleanTargetSectionId && field.uniqueId !== fieldToCheck.uniqueId;
  });

  if (otherFieldsInSection.length === 0) {
    return null;
  }

  // Check if all existing fields in the section have the same conditions
  return getSectionWideConditions(otherFieldsInSection, targetSectionId);
};

/**
 * Checks if a field should have its conditions removed when moved from a section
 * @param formFields - All form fields
 * @param sourceSectionId - The section the field is being moved from
 * @param fieldToCheck - The field being moved
 * @returns Array of condition set IDs to remove, empty array if no removal needed
 */
export const shouldRemoveConditionsFromField = (
  formFields: FormField[],
  sourceSectionId: string,
  fieldToCheck: FormField,
): string[] => {
  if (!fieldToCheck.conditions || fieldToCheck.conditions.length === 0) {
    return [];
  }

  // Get all OTHER fields that remain in the source section
  const remainingFieldsInSection = formFields.filter((field) => {
    const fieldSectionId = normalizeSectionId(field.sectionId);
    const cleanSourceSectionId = normalizeSectionId(sourceSectionId);
    return fieldSectionId === cleanSourceSectionId && field.uniqueId !== fieldToCheck.uniqueId;
  });

  // If no other fields remain in the section, don't remove conditions
  if (remainingFieldsInSection.length === 0) {
    return [];
  }

  // Check if all remaining fields have the same conditions as the field being moved
  const sectionConditions = getSectionWideConditions(remainingFieldsInSection, sourceSectionId);

  if (!sectionConditions) {
    return [];
  }

  // Find which condition sets from the field match the section-wide conditions
  const conditionSetsToRemove: string[] = [];

  fieldToCheck.conditions.forEach((fieldConditionGroup) => {
    const matchingGroup = sectionConditions.find((sectionGroup) => {
      // Require the same conditionSetId (preserves current semantics),
      // but compare contents order-insensitively
      if (fieldConditionGroup.conditionSetId !== sectionGroup.conditionSetId) return false;
      return areConditionGroupsEqual(fieldConditionGroup, sectionGroup);
    });

    if (matchingGroup && fieldConditionGroup.conditionSetId) {
      conditionSetsToRemove.push(fieldConditionGroup.conditionSetId);
    }
  });

  return conditionSetsToRemove;
};

/**
 * Handles automatic condition management when a field is added to a section
 * @param formFields - All form fields
 * @param newField - The field being added
 * @param targetSectionId - The section the field is being added to
 * @returns Updated field with conditions applied if needed
 */
export const handleFieldAddedToSection = (
  formFields: FormField[],
  newField: FormField,
  targetSectionId: string,
): FormField => {
  const conditionsToInherit = shouldInheritSectionConditions(formFields, targetSectionId, newField);

  if (conditionsToInherit) {
    return applyConditionsToField(newField, conditionsToInherit);
  }

  return newField;
};

/**
 * Handles automatic condition management when a field is moved between sections
 * @param formFields - All form fields
 * @param fieldToMove - The field being moved
 * @param sourceSectionId - The section the field is being moved from
 * @param targetSectionId - The section the field is being moved to
 * @returns Updated field with conditions managed appropriately
 */
export const handleFieldMovedBetweenSections = (
  formFields: FormField[],
  fieldToMove: FormField,
  sourceSectionId: string,
  targetSectionId: string,
): FormField => {
  let updatedField = { ...fieldToMove };

  // Remove section-wide conditions from source section if applicable
  const conditionSetsToRemove = shouldRemoveConditionsFromField(
    formFields,
    sourceSectionId,
    fieldToMove,
  );

  conditionSetsToRemove.forEach((conditionSetId) => {
    updatedField = removeConditionsFromField(updatedField, conditionSetId);
  });

  // Apply section-wide conditions from target section if applicable
  const conditionsToInherit = shouldInheritSectionConditions(
    formFields,
    targetSectionId,
    updatedField,
  );

  if (conditionsToInherit) {
    const existingConditions = updatedField.conditions || [];
    const merged = mergeConditionGroupsDedup(existingConditions, conditionsToInherit);
    updatedField = applyConditionsToField(updatedField, merged);
  }

  return updatedField;
};
