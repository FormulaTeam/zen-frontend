import { v4 as uuidv4 } from "uuid";
import { ALLOWED_FIELD_TYPES_FOR_CONDITION, FieldTypeIds, connectionTypes } from "./interfaces";
import type {
  ConditionGroup,
  ConditionsRoot,
  Condition,
  AffectedTarget,
  FormField,
  FormFieldTypeId,
} from "./interfaces";

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
  isConditionValid: (condition: Condition, formField?: FormField): boolean => {
    if (!condition.field || !condition.operator) return false;

    // Empty and not_empty operators don't need values
    if (
      condition.operator === ConditionOperators.empty ||
      condition.operator === ConditionOperators.not_empty
    ) {
      return true;
    }

    // All other operators need values
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
    // For multi-value operators, ensure we have an array
    if (ConditionUtils.isMultiValueOperator(operator)) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }

    // For single-value operators, ensure we have a string
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
  validateConditionsRoot: (conditionsRoot: ConditionsRoot, formFields: FormField[]): boolean => {
    if (!conditionsRoot.groups.length) return false;

    return conditionsRoot.groups.every(
      (group) =>
        group.conditions.length > 0 &&
        group.conditions.every((condition) => {
          const formField = formFields.find((f) => f.uniqueId === condition.field);
          return ConditionUtils.isConditionValid(condition, formField);
        }),
    );
  },

  /**
   * Evaluate a single condition against a data object
   * This is a utility function for testing/debugging purposes
   */
  evaluateCondition: (condition: Condition, dataObject: any, formField?: FormField): boolean => {
    if (!condition.field || !condition.operator) return false;

    let fieldValue = dataObject[condition.field];
    let conditionValue = condition.value;

    // Handle special field types
    if (formField) {
      // Handle checkbox (yes/no) fields - boolean values stored as strings in conditions
      if (formField.typeId === FieldTypeIds.checkbox) {
        // Convert boolean field values to string for comparison
        if (typeof fieldValue === "boolean") {
          fieldValue = fieldValue.toString();
        }
        // Ensure condition value is string
        if (typeof conditionValue === "boolean") {
          conditionValue = conditionValue.toString();
        }
      }

      // Handle options fields - can be stored as array or string
      else if (formField.typeId === FieldTypeIds.options) {
        // For connected form fields, handle the special case where values might be from connected forms
        if (formField.connectionType === connectionTypes.form) {
          // For connected form fields, the field value should be the actual value from the connected form
          // Normalize field value to array for consistent handling
          const normalizedFieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

          // For equals/not_equals operations with connected form options
          if (
            condition.operator === ConditionOperators.equals ||
            condition.operator === ConditionOperators.not_equals
          ) {
            // If condition value is array, check if field value contains any of those values
            if (Array.isArray(conditionValue)) {
              const hasMatch = conditionValue.some((cv) => normalizedFieldValue.includes(cv));
              return condition.operator === ConditionOperators.equals ? hasMatch : !hasMatch;
            } else {
              // Single condition value - check if it's in the field value array
              const hasMatch = normalizedFieldValue.includes(conditionValue);
              return condition.operator === ConditionOperators.equals ? hasMatch : !hasMatch;
            }
          }

          // For contains/not_contains operations with connected form options
          else if (
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
          // Regular options field (not connected to another form)
          // Normalize field value to array for consistent handling
          const normalizedFieldValue = Array.isArray(fieldValue) ? fieldValue : [fieldValue];

          // For equals/not_equals operations with options fields
          if (
            condition.operator === ConditionOperators.equals ||
            condition.operator === ConditionOperators.not_equals
          ) {
            // If condition value is array, check if field value contains any of those values
            if (Array.isArray(conditionValue)) {
              const hasMatch = conditionValue.some((cv) => normalizedFieldValue.includes(cv));
              return condition.operator === ConditionOperators.equals ? hasMatch : !hasMatch;
            } else {
              // Single condition value - check if it's in the field value array
              const hasMatch = normalizedFieldValue.includes(conditionValue);
              return condition.operator === ConditionOperators.equals ? hasMatch : !hasMatch;
            }
          }

          // For contains/not_contains operations with options fields
          else if (
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
        // Handle numeric comparison
        if (formField?.typeId === FieldTypeIds.number) {
          const numFieldValue = Number(fieldValue);
          const numConditionValue = Number(conditionValue);
          return (
            !isNaN(numFieldValue) && !isNaN(numConditionValue) && numFieldValue > numConditionValue
          );
        }
        // Handle date comparison
        if (
          formField?.typeId === FieldTypeIds.date &&
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
        // Handle numeric comparison
        if (formField?.typeId === FieldTypeIds.number) {
          const numFieldValue = Number(fieldValue);
          const numConditionValue = Number(conditionValue);
          return (
            !isNaN(numFieldValue) && !isNaN(numConditionValue) && numFieldValue < numConditionValue
          );
        }
        // Handle date comparison
        if (
          formField?.typeId === FieldTypeIds.date &&
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
        // Handle numeric comparison
        if (formField?.typeId === FieldTypeIds.number) {
          const numFieldValue = Number(fieldValue);
          const numConditionValue = Number(conditionValue);
          return (
            !isNaN(numFieldValue) && !isNaN(numConditionValue) && numFieldValue >= numConditionValue
          );
        }
        // Handle date comparison
        if (
          formField?.typeId === FieldTypeIds.date &&
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
        // Handle numeric comparison
        if (formField?.typeId === FieldTypeIds.number) {
          const numFieldValue = Number(fieldValue);
          const numConditionValue = Number(conditionValue);
          return (
            !isNaN(numFieldValue) && !isNaN(numConditionValue) && numFieldValue <= numConditionValue
          );
        }
        // Handle date comparison
        if (
          formField?.typeId === FieldTypeIds.date &&
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
    formFields: FormField[],
  ): boolean => {
    if (group.conditions.length === 0) return true;

    const results = group.conditions.map((condition) => {
      const formField = formFields.find((f) => f.uniqueId === condition.field);
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
    formFields: FormField[],
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
    // Check if target already exists
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
    formFields: FormField[],
    conditionsRoot?: ConditionsRoot,
  ): { id: string; name: string }[] => {
    const sectionsMap = new Map<string, string>();
    const excludedSectionIds = new Set<string>();

    // If conditionsRoot is provided, collect sections that contain fields used in conditions
    if (conditionsRoot) {
      const fieldsUsedInConditions = new Set<string>();

      // Collect field IDs used in conditions
      conditionsRoot.groups.forEach((group) => {
        group.conditions.forEach((condition) => {
          if (condition.field) {
            fieldsUsedInConditions.add(condition.field);
          }
        });
      });

      // Find sections that contain fields used in conditions
      formFields.forEach((field) => {
        if ((fieldsUsedInConditions.has(field.uniqueId) && field.sectionId) || field.required) {
          const cleanSectionId = field.sectionId.replace("formFields_", "");
          excludedSectionIds.add(cleanSectionId);
        }
      });
    }

    formFields.forEach((field) => {
      if (field.sectionId && field.sectionName) {
        // Clean the section ID by removing the formFields_ prefix for display/storage
        const cleanSectionId = field.sectionId.replace("formFields_", "");

        // Only add section if it's not excluded
        if (!excludedSectionIds.has(cleanSectionId)) {
          sectionsMap.set(cleanSectionId, field.sectionName);
        }
      }
    });

    return Array.from(sectionsMap.entries()).map(([id, name]) => ({ id, name }));
  },

  /**
   * Get available fields (excluding those already used in conditions and affected by current condition set)
   */
  getAvailableFields: (
    formFields: FormField[],
    conditionsRoot: ConditionsRoot,
    isFromAffected?: boolean,
  ): FormField[] => {
    const excludedFieldIds = new Set<string>();

    // Collect field IDs used in conditions
    conditionsRoot.groups.forEach((group) => {
      group.conditions.forEach((condition) => {
        if (condition.field) {
          excludedFieldIds.add(condition.field);
        }
      });
    });

    // Collect field IDs that are affected by the current condition set
    conditionsRoot.affectedTargets.forEach((target) => {
      if (target.type === "field") {
        excludedFieldIds.add(target.id);
      } else if (target.type === "section") {
        // Add all fields from affected sections
        formFields.forEach((field) => {
          if (
            field.sectionId === target.id ||
            field.sectionId === `formFields_${target.id}` ||
            field.sectionId?.replace("formFields_", "") === target.id
          ) {
            excludedFieldIds.add(field.uniqueId);
          }
        });
      }
    });

    if (isFromAffected) {
      return formFields.filter((field) => !excludedFieldIds.has(field.uniqueId));
    }

    // Return fields not used in conditions or affected by conditions
    return formFields.filter(
      (field) =>
        !excludedFieldIds.has(field.uniqueId) &&
        ALLOWED_FIELD_TYPES_FOR_CONDITION.includes(field.typeId),
    );
  },
};
