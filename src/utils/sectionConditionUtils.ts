import { ConditionGroup } from "../utils/interfaces";
import moment from "moment";
import { FormFieldDto } from "../types/shared";

type SectionConditionFieldExtra = {
  sectionId?: string;
  conditions?: ConditionGroup[];
};

type EditorFormField = FormFieldDto & {
  extra?: SectionConditionFieldExtra;
};

/**
 * Utility functions for managing automatic condition inheritance in form sections
 */

// ————————————————————————————————————————————————————————————
// Helpers
// ————————————————————————————————————————————————————————————

const getFieldExtra = (field: EditorFormField): SectionConditionFieldExtra =>
  (field.extra as SectionConditionFieldExtra | undefined) ?? {};

const updateFieldExtra = (
  field: EditorFormField,
  patch: Partial<SectionConditionFieldExtra>,
): EditorFormField => ({
  ...field,
  extra: {
    ...getFieldExtra(field),
    ...patch,
  },
});

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

  if (mappedGroupsA.idMap.size !== mappedGroupsB.idMap.size) return false;
  for (const [id, groupA] of mappedGroupsA.idMap) {
    const groupB = mappedGroupsB.idMap.get(id);
    if (!groupB || !areConditionGroupsEqual(groupA, groupB)) return false;
  }

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
  for (let i = 0; i < aSignatures.length; i++) {
    if (aSignatures[i] !== bSignatures[i]) return false;
  }
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
 */
export const getSectionWideConditions = (
  fields: EditorFormField[],
  sectionId: string,
): ConditionGroup[] | null => {
  const fieldsInSection = fields.filter((field) => {
    const fieldSectionId = normalizeSectionId(getFieldExtra(field).sectionId);
    const targetSectionId = normalizeSectionId(sectionId);
    return fieldSectionId === targetSectionId;
  });

  if (fieldsInSection.length === 0) {
    return null;
  }

  const firstFieldConditions = getFieldExtra(fieldsInSection[0]).conditions;

  if (!firstFieldConditions || firstFieldConditions.length === 0) {
    return null;
  }

  const allFieldsHaveSameConditions = fieldsInSection.slice(1).every((field) => {
    const fieldConditions = getFieldExtra(field).conditions ?? [];
    return areGroupArraysEqual(firstFieldConditions, fieldConditions);
  });

  return allFieldsHaveSameConditions ? firstFieldConditions : null;
};

/**
 * Applies conditions to a field
 */
export const applyConditionsToField = (
  field: EditorFormField,
  conditions: ConditionGroup[],
): EditorFormField => {
  return updateFieldExtra(field, {
    conditions: conditions.length > 0 ? deepCloneConditionGroups(conditions) : undefined,
  });
};

/**
 * Removes specific conditions from a field based on condition set ID
 */
export const removeConditionsFromField = (
  field: EditorFormField,
  conditionSetId: string,
): EditorFormField => {
  const currentConditions = getFieldExtra(field).conditions;

  if (!currentConditions) {
    return field;
  }

  const remainingConditions = currentConditions.filter(
    (group) => group.conditionSetId !== conditionSetId,
  );

  return updateFieldExtra(field, {
    conditions: remainingConditions.length > 0 ? remainingConditions : undefined,
  });
};

/**
 * Checks if a field should inherit section conditions when added/moved to a section
 */
export const shouldInheritSectionConditions = (
  formFields: EditorFormField[],
  targetSectionId: string,
  fieldToCheck: EditorFormField,
): ConditionGroup[] | null => {
  const otherFieldsInSection = formFields.filter((field) => {
    const fieldSectionId = normalizeSectionId(getFieldExtra(field).sectionId);
    const cleanTargetSectionId = normalizeSectionId(targetSectionId);
    return fieldSectionId === cleanTargetSectionId && field.id !== fieldToCheck.id;
  });

  if (otherFieldsInSection.length === 0) {
    return null;
  }

  return getSectionWideConditions(otherFieldsInSection, targetSectionId);
};

/**
 * Checks if a field should have its conditions removed when moved from a section
 */
export const shouldRemoveConditionsFromField = (
  formFields: EditorFormField[],
  sourceSectionId: string,
  fieldToCheck: EditorFormField,
): string[] => {
  const fieldConditions = getFieldExtra(fieldToCheck).conditions;

  if (!fieldConditions || fieldConditions.length === 0) {
    return [];
  }

  const remainingFieldsInSection = formFields.filter((field) => {
    const fieldSectionId = normalizeSectionId(getFieldExtra(field).sectionId);
    const cleanSourceSectionId = normalizeSectionId(sourceSectionId);
    return fieldSectionId === cleanSourceSectionId && field.id !== fieldToCheck.id;
  });

  if (remainingFieldsInSection.length === 0) {
    return [];
  }

  const sectionConditions = getSectionWideConditions(remainingFieldsInSection, sourceSectionId);

  if (!sectionConditions) {
    return [];
  }

  const conditionSetsToRemove: string[] = [];

  fieldConditions.forEach((fieldConditionGroup) => {
    const matchingGroup = sectionConditions.find((sectionGroup) => {
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
 */
export const handleFieldAddedToSection = (
  formFields: EditorFormField[],
  newField: EditorFormField,
  targetSectionId: string,
): EditorFormField => {
  const conditionsToInherit = shouldInheritSectionConditions(formFields, targetSectionId, newField);

  if (conditionsToInherit) {
    return applyConditionsToField(newField, conditionsToInherit);
  }

  return newField;
};

/**
 * Handles automatic condition management when a field is moved between sections
 */
export const handleFieldMovedBetweenSections = (
  formFields: EditorFormField[],
  fieldToMove: EditorFormField,
  sourceSectionId: string,
  targetSectionId: string,
): EditorFormField => {
  let updatedField = { ...fieldToMove };

  const conditionSetsToRemove = shouldRemoveConditionsFromField(
    formFields,
    sourceSectionId,
    fieldToMove,
  );

  conditionSetsToRemove.forEach((conditionSetId) => {
    updatedField = removeConditionsFromField(updatedField, conditionSetId);
  });

  const conditionsToInherit = shouldInheritSectionConditions(
    formFields,
    targetSectionId,
    updatedField,
  );

  if (conditionsToInherit) {
    const existingConditions = getFieldExtra(updatedField).conditions || [];
    const merged = mergeConditionGroupsDedup(existingConditions, conditionsToInherit);
    updatedField = applyConditionsToField(updatedField, merged);
  }

  return updatedField;
};
