import { v4 as uuidv4 } from "uuid";
import type { AffectedTarget, Condition, ConditionGroup, ConditionsRoot } from "./interfaces";
import { ALLOWED_FIELD_TYPES_FOR_CONDITION, connectionTypes, FieldTypeIds } from "./interfaces";
import { FormFieldDto } from "../types/shared";

type ConditionFieldExtra = {
  connectionType?: string | number;
  conditions?: ConditionGroup[];
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

export type ConditionalFormField = FormFieldDto & {
  extra?: ConditionFieldExtra;
};

const getFieldExtra = (field: ConditionalFormField): ConditionFieldExtra =>
  (field.extra as ConditionFieldExtra | undefined) ?? {};

// Condition operators enum for better type safety
export const ConditionOperators = {
  equals: "equals",
  not_equals: "not_equals",
  empty: "empty",
  not_empty: "not_empty",
  contains: "contains",
  not_contains: "not_contains",
  greater_than: "greater_than",
  less_than: "less_than",
  greater_than_or_equal: "greater_than_or_equal",
  less_than_or_equal: "less_than_or_equal",
} as const;

// Type from the enum values
export type ConditionOperatorType = (typeof ConditionOperators)[keyof typeof ConditionOperators];

// Display names for operators (Hebrew)
export const conditionOperatorLabels: Record<ConditionOperatorType, string> = {
  equals: "שווה ל",
  not_equals: "שונה מ",
  empty: "ריק",
  not_empty: "לא ריק",
  contains: "מכיל",
  not_contains: "לא מכיל",
  greater_than: "גדול מ",
  less_than: "קטן מ",
  greater_than_or_equal: "גדול או שווה ל",
  less_than_or_equal: "קטן או שווה ל",
};

export const DEFAULT_OPERATOR: ConditionOperatorType = ConditionOperators.equals;

// Logical operators for combining conditions
export const LogicalOperators = {
  and: "and",
  or: "or",
} as const;

export type LogicalOperatorType = (typeof LogicalOperators)[keyof typeof LogicalOperators];

// Display names for logical operators (Hebrew)
export const logicalOperatorLabels: Record<LogicalOperatorType, string> = {
  and: "וגם",
  or: "או",
};

export const DEFAULT_LOGICAL_OPERATOR: LogicalOperatorType = LogicalOperators.and;

export const conditionDisplayModes = {
  list: "list",
  edit: "edit",
};

export type ConditionDisplayMode =
  (typeof conditionDisplayModes)[keyof typeof conditionDisplayModes];

// Utility functions for condition handling
export const ConditionUtils = {
  /**
   * Check if a condition is valid
   */
  isConditionValid: (condition: Condition, formField?: ConditionalFormField): boolean => {
    if (!condition.field || !condition.operator) return false;

    if (
      condition.operator === ConditionOperators.empty ||
      condition.operator === ConditionOperators.not_empty
    ) {
      return true;
    }

    if (!condition.value || (Array.isArray(condition.value) && condition.value.length === 0)) {
      return false;
    }

    return true;
  },

  /**
   * Get operators that work with multiple values (arrays)
   */
  getMultiValueOperators: (): ConditionOperatorType[] => {
    return [ConditionOperators.contains, ConditionOperators.not_contains];
  },

  /**
   * Check if an operator expects multiple values
   */
  isMultiValueOperator: (operator: ConditionOperatorType): boolean => {
    return ConditionUtils.getMultiValueOperators().includes(operator);
  },

  /**
   * Normalize condition value based on operator and field type
   */
  normalizeConditionValue: (
    value: string | string[],
    operator: ConditionOperatorType,
    fieldType: number,
  ): string | string[] => {
    if (ConditionUtils.isMultiValueOperator(operator)) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }

    return Array.isArray(value) ? value[0] || "" : value || "";
  },

  /**
   * Create a new condition group
   */
  createConditionGroup: (id?: string, conditionSetId?: string): ConditionGroup => {
    return {
      id: id || `group_${uuidv4()}`,
      conditionSetId,
      conditions: [],
      logicalOperator: DEFAULT_LOGICAL_OPERATOR,
    };
  },

  /**
   * Create a new conditions root structure
   */
  createConditionsRoot: (conditionSetId?: string, name?: string): ConditionsRoot => {
    return {
      groups: [ConditionUtils.createConditionGroup(undefined, conditionSetId)],
      affectedTargets: [],
      name,
    };
  },

  /**
   * Add a condition to a specific group
   */
  addConditionToGroup: (
    conditionsRoot: ConditionsRoot,
    groupId: string,
    condition: Condition,
  ): ConditionsRoot => {
    const updatedGroups = conditionsRoot.groups.map((group) => {
      if (group.id === groupId) {
        return {
          ...group,
          conditions: [...group.conditions, condition],
        };
      }
      return group;
    });

    return {
      ...conditionsRoot,
      groups: updatedGroups,
    };
  },

  /**
   * Add a new condition group
   */
  addConditionGroup: (
    conditionsRoot: ConditionsRoot,
    logicalOperator: LogicalOperatorType = DEFAULT_LOGICAL_OPERATOR,
    conditionSetId?: string,
  ): ConditionsRoot => {
    const newGroup = ConditionUtils.createConditionGroup(undefined, conditionSetId);
    newGroup.parentLogicalOperator = logicalOperator;

    return {
      ...conditionsRoot,
      groups: [...conditionsRoot.groups, newGroup],
    };
  },

  /**
   * Validate an entire conditions root structure
   */
  validateConditionsRoot: (
    conditionsRoot: ConditionsRoot,
    formFields: ConditionalFormField[],
  ): boolean => {
    if (!conditionsRoot.groups.length) return false;

    return conditionsRoot.groups.every(
      (group) =>
        group.conditions.length > 0 &&
        group.conditions.every((condition) => {
          const formField = formFields.find((f) => f.id === condition.field);
          return ConditionUtils.isConditionValid(condition, formField);
        }),
    );
  },

  /**
   * Evaluate a single condition against a data object
   * This is a utility function for testing/debugging purposes
   */
  evaluateCondition: (
    condition: Condition,
    dataObject: any,
    formField?: ConditionalFormField,
  ): boolean => {
    if (!condition.field || !condition.operator) return false;

    let fieldValue = dataObject[condition.field];
    let conditionValue = condition.value;

    if (formField) {
      const extra = getFieldExtra(formField);

      if (formField.fieldType === FieldTypeIds.checkbox) {
        if (typeof fieldValue === "boolean") {
          fieldValue = fieldValue.toString();
        }
        if (typeof conditionValue === "boolean") {
          conditionValue = conditionValue.toString();
        }
      } else if (formField.fieldType === FieldTypeIds.options) {
        if (extra.connectionType === connectionTypes.form) {
          const normalizedFieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

          if (
            condition.operator === ConditionOperators.equals ||
            condition.operator === ConditionOperators.not_equals
          ) {
            if (Array.isArray(conditionValue)) {
              const hasMatch = conditionValue.some((cv) => normalizedFieldValue.includes(cv));
              return condition.operator === ConditionOperators.equals ? hasMatch : !hasMatch;
            } else {
              const hasMatch = normalizedFieldValue.includes(conditionValue);
              return condition.operator === ConditionOperators.equals ? hasMatch : !hasMatch;
            }
          } else if (
            condition.operator === ConditionOperators.contains ||
            condition.operator === ConditionOperators.not_contains
          ) {
            if (Array.isArray(conditionValue)) {
              const hasMatch = conditionValue.some((cv) =>
                normalizedFieldValue.some((fv) => String(fv).includes(String(cv))),
              );
              return condition.operator === ConditionOperators.contains ? hasMatch : !hasMatch;
            } else {
              const hasMatch = normalizedFieldValue.some((fv) =>
                String(fv).includes(String(conditionValue)),
              );
              return condition.operator === ConditionOperators.contains ? hasMatch : !hasMatch;
            }
          }
        } else {
          const normalizedFieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

          if (
            condition.operator === ConditionOperators.equals ||
            condition.operator === ConditionOperators.not_equals
          ) {
            if (Array.isArray(conditionValue)) {
              const hasMatch = conditionValue.some((cv) => normalizedFieldValue.includes(cv));
              return condition.operator === ConditionOperators.equals ? hasMatch : !hasMatch;
            } else {
              const hasMatch = normalizedFieldValue.includes(conditionValue);
              return condition.operator === ConditionOperators.equals ? hasMatch : !hasMatch;
            }
          } else if (
            condition.operator === ConditionOperators.contains ||
            condition.operator === ConditionOperators.not_contains
          ) {
            if (Array.isArray(conditionValue)) {
              const hasMatch = conditionValue.some((cv) =>
                normalizedFieldValue.some((fv) => String(fv).includes(String(cv))),
              );
              return condition.operator === ConditionOperators.contains ? hasMatch : !hasMatch;
            } else {
              const hasMatch = normalizedFieldValue.some((fv) =>
                String(fv).includes(String(conditionValue)),
              );
              return condition.operator === ConditionOperators.contains ? hasMatch : !hasMatch;
            }
          }
        }
      }
    }

    switch (condition.operator) {
      case ConditionOperators.equals:
        return fieldValue === conditionValue;

      case ConditionOperators.not_equals:
        return fieldValue !== conditionValue;

      case ConditionOperators.empty:
        return (
          !fieldValue || fieldValue === "" || (Array.isArray(fieldValue) && fieldValue.length === 0)
        );

      case ConditionOperators.not_empty:
        return (
          fieldValue && fieldValue !== "" && (!Array.isArray(fieldValue) || fieldValue.length > 0)
        );

      case ConditionOperators.contains:
        if (Array.isArray(conditionValue)) {
          return conditionValue.some((val) => String(fieldValue).includes(String(val)));
        }
        return String(fieldValue).includes(String(conditionValue));

      case ConditionOperators.not_contains:
        if (Array.isArray(conditionValue)) {
          return !conditionValue.some((val) => String(fieldValue).includes(String(val)));
        }
        return !String(fieldValue).includes(String(conditionValue));

      case ConditionOperators.greater_than:
        if (formField?.fieldType === FieldTypeIds.number) {
          const numFieldValue = Number(fieldValue);
          const numConditionValue = Number(conditionValue);
          return (
            !isNaN(numFieldValue) && !isNaN(numConditionValue) && numFieldValue > numConditionValue
          );
        }
        if (
          formField?.fieldType === FieldTypeIds.date &&
          conditionValue &&
          (typeof conditionValue === "string" || typeof conditionValue === "number")
        ) {
          const dateFieldValue = new Date(fieldValue);
          const dateConditionValue = new Date(conditionValue);
          return (
            !isNaN(dateFieldValue.getTime()) &&
            !isNaN(dateConditionValue.getTime()) &&
            dateFieldValue > dateConditionValue
          );
        }
        return false;

      case ConditionOperators.less_than:
        if (formField?.fieldType === FieldTypeIds.number) {
          const numFieldValue = Number(fieldValue);
          const numConditionValue = Number(conditionValue);
          return (
            !isNaN(numFieldValue) && !isNaN(numConditionValue) && numFieldValue < numConditionValue
          );
        }
        if (
          formField?.fieldType === FieldTypeIds.date &&
          conditionValue &&
          (typeof conditionValue === "string" || typeof conditionValue === "number")
        ) {
          const dateFieldValue = new Date(fieldValue);
          const dateConditionValue = new Date(conditionValue);
          return (
            !isNaN(dateFieldValue.getTime()) &&
            !isNaN(dateConditionValue.getTime()) &&
            dateFieldValue < dateConditionValue
          );
        }
        return false;

      case ConditionOperators.greater_than_or_equal:
        if (formField?.fieldType === FieldTypeIds.number) {
          const numFieldValue = Number(fieldValue);
          const numConditionValue = Number(conditionValue);
          return (
            !isNaN(numFieldValue) && !isNaN(numConditionValue) && numFieldValue >= numConditionValue
          );
        }
        if (
          formField?.fieldType === FieldTypeIds.date &&
          conditionValue &&
          (typeof conditionValue === "string" || typeof conditionValue === "number")
        ) {
          const dateFieldValue = new Date(fieldValue);
          const dateConditionValue = new Date(conditionValue);
          return (
            !isNaN(dateFieldValue.getTime()) &&
            !isNaN(dateConditionValue.getTime()) &&
            dateFieldValue >= dateConditionValue
          );
        }
        return false;

      case ConditionOperators.less_than_or_equal:
        if (formField?.fieldType === FieldTypeIds.number) {
          const numFieldValue = Number(fieldValue);
          const numConditionValue = Number(conditionValue);
          return (
            !isNaN(numFieldValue) && !isNaN(numConditionValue) && numFieldValue <= numConditionValue
          );
        }
        if (
          formField?.fieldType === FieldTypeIds.date &&
          conditionValue &&
          (typeof conditionValue === "string" || typeof conditionValue === "number")
        ) {
          const dateFieldValue = new Date(fieldValue);
          const dateConditionValue = new Date(conditionValue);
          return (
            !isNaN(dateFieldValue.getTime()) &&
            !isNaN(dateConditionValue.getTime()) &&
            dateFieldValue <= dateConditionValue
          );
        }
        return false;

      default:
        return false;
    }
  },

  /**
   * Evaluate a condition group against a data object
   */
  evaluateConditionGroup: (
    group: ConditionGroup,
    dataObject: any,
    formFields: ConditionalFormField[],
  ): boolean => {
    if (group.conditions.length === 0) return true;

    const results = group.conditions.map((condition) => {
      const formField = formFields.find((f) => f.id === condition.field);
      return ConditionUtils.evaluateCondition(condition, dataObject, formField);
    });

    if (group.logicalOperator === LogicalOperators.or) {
      return results.some((result) => result);
    } else {
      return results.every((result) => result);
    }
  },

  /**
   * Evaluate the entire conditions root against a data object
   */
  evaluateConditionsRoot: (
    conditionsRoot: ConditionsRoot,
    dataObject: any,
    formFields: ConditionalFormField[],
  ): boolean => {
    if (conditionsRoot.groups.length === 0) return true;

    let result = ConditionUtils.evaluateConditionGroup(
      conditionsRoot.groups[0],
      dataObject,
      formFields,
    );

    for (let i = 1; i < conditionsRoot.groups.length; i++) {
      const group = conditionsRoot.groups[i];
      const groupResult = ConditionUtils.evaluateConditionGroup(group, dataObject, formFields);

      if (group.parentLogicalOperator === LogicalOperators.or) {
        result = result || groupResult;
      } else {
        result = result && groupResult;
      }
    }

    return result;
  },

  /**
   * Add an affected target to the conditions root
   */
  addAffectedTarget: (conditionsRoot: ConditionsRoot, target: AffectedTarget): ConditionsRoot => {
    const exists = conditionsRoot.affectedTargets.some(
      (t) => t.type === target.type && t.id === target.id,
    );

    if (exists) return conditionsRoot;

    return {
      ...conditionsRoot,
      affectedTargets: [...conditionsRoot.affectedTargets, target],
    };
  },

  /**
   * Remove an affected target from the conditions root
   */
  removeAffectedTarget: (
    conditionsRoot: ConditionsRoot,
    targetType: "section" | "field",
    targetId: string,
  ): ConditionsRoot => {
    return {
      ...conditionsRoot,
      affectedTargets: conditionsRoot.affectedTargets.filter(
        (t) => !(t.type === targetType && t.id === targetId),
      ),
    };
  },

  /**
   * Get available sections from form fields (excluding sections that contain fields used in conditions)
   */
  getAvailableSections: (
    formFields: ConditionalFormField[],
    conditionsRoot?: ConditionsRoot,
  ): { id: string; name: string }[] => {
    const sectionsMap = new Map<string, string>();
    const excludedSectionIds = new Set<string>();

    if (conditionsRoot) {
      const fieldsUsedInConditions = new Set<string>();

      conditionsRoot.groups.forEach((group) => {
        group.conditions.forEach((condition) => {
          if (condition.field) {
            fieldsUsedInConditions.add(condition.field);
          }
        });
      });

      formFields.forEach((field) => {
        const extra = getFieldExtra(field);
        if ((fieldsUsedInConditions.has(field.id) && extra.sectionId) || field.isRequired) {
          const cleanSectionId = extra.sectionId?.replace("formFields_", "");
          if (cleanSectionId) {
            excludedSectionIds.add(cleanSectionId);
          }
        }
      });
    }

    formFields.forEach((field) => {
      const extra = getFieldExtra(field);
      if (extra.sectionId && extra.sectionName) {
        const cleanSectionId = extra.sectionId.replace("formFields_", "");

        if (!excludedSectionIds.has(cleanSectionId)) {
          sectionsMap.set(cleanSectionId, extra.sectionName);
        }
      }
    });

    return Array.from(sectionsMap.entries()).map(([id, name]) => ({ id, name }));
  },

  /**
   * Get available fields (excluding those already used in conditions and affected by current condition set)
   */
  getAvailableFields: (
    formFields: ConditionalFormField[],
    conditionsRoot: ConditionsRoot,
    isFromAffected?: boolean,
  ): ConditionalFormField[] => {
    const excludedFieldIds = new Set<string>();

    conditionsRoot.groups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.field) {
          excludedFieldIds.add(condition.field);
        }
      });
    });

    conditionsRoot.affectedTargets.forEach((target) => {
      if (target.type === "field") {
        excludedFieldIds.add(target.id);
      } else if (target.type === "section") {
        formFields.forEach((field) => {
          const extra = getFieldExtra(field);
          if (
            extra.sectionId === target.id ||
            extra.sectionId === `formFields_${target.id}` ||
            extra.sectionId?.replace("formFields_", "") === target.id
          ) {
            excludedFieldIds.add(field.id);
          }
        });
      }
    });

    if (isFromAffected) {
      return formFields.filter((field) => !excludedFieldIds.has(field.id));
    }

    return formFields.filter(
      (field) =>
        !excludedFieldIds.has(field.id) &&
        ALLOWED_FIELD_TYPES_FOR_CONDITION.includes(field.fieldType),
    );
  },
};
