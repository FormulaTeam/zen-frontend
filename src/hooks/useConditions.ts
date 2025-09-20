import { useState, useEffect, useMemo } from "react";
import {
  Condition,
  ConditionsRoot,
  ConditionGroup,
  LogicalOperatorType,
  DEFAULT_OPERATOR,
  DEFAULT_LOGICAL_OPERATOR,
  FormField,
  ConditionUtils,
  AffectedTarget,
} from "../utils/interfaces";
import { v4 as uuidv4 } from "uuid";

interface UseConditionsProps {
  formFields: FormField[];
  existingConditions?: {
    conditions: ConditionGroup[];
    affectedFields: FormField[];
  } | null;
  onSave?: (updatedFields: FormField[]) => void;
  onClose: () => void;
}

export const useConditions = ({
  formFields,
  existingConditions,
  onSave,
  onClose,
}: UseConditionsProps) => {
  // Generate or extract conditionSetId for this editing session
  const conditionSetId = useMemo(() => {
    if (existingConditions && existingConditions.conditions.length > 0) {
      // If editing existing conditions, use the existing conditionSetId or generate one for legacy conditions
      const existingSetId = existingConditions.conditions[0].conditionSetId;
      if (existingSetId) {
        return existingSetId;
      }
    }
    // For new conditions, generate a new conditionSetId
    return `conditionSet_${uuidv4()}`;
  }, [existingConditions]);

  const [conditionsRoot, setConditionsRoot] = useState<ConditionsRoot>(() => {
    if (existingConditions) {
      // Create affected targets from existing conditions
      // Group fields by section to see if entire sections are affected
      const sectionGroups = new Map<string, FormField[]>();
      const individualFields: FormField[] = [];

      existingConditions.affectedFields.forEach((field) => {
        if (field.sectionId && field.sectionName) {
          if (!sectionGroups.has(field.sectionId)) {
            sectionGroups.set(field.sectionId, []);
          }
          sectionGroups.get(field.sectionId)!.push(field);
        } else {
          individualFields.push(field);
        }
      });

      const affectedTargets: AffectedTarget[] = [];

      // Check if entire sections are affected
      for (const [sectionId, fieldsInSection] of sectionGroups) {
        // Get all fields that belong to this section in the entire form
        const allFieldsInSection = formFields.filter((f) => f.sectionId === sectionId);

        // If the number of affected fields equals the total fields in section, treat as section target
        if (fieldsInSection.length === allFieldsInSection.length) {
          const sectionName = fieldsInSection[0].sectionName || `מקטע ${sectionId}`;
          // Use section ID without prefix for target
          const cleanSectionId = sectionId.replace("formFields_", "");
          affectedTargets.push({
            type: "section",
            id: cleanSectionId,
            name: sectionName,
          });
        } else {
          // Otherwise treat as individual field targets
          fieldsInSection.forEach((field) => {
            affectedTargets.push({
              type: "field",
              id: field.uniqueId,
              name: field.displayName,
            });
          });
        }
      }

      // Add individual fields (not in any section)
      individualFields.forEach((field) => {
        affectedTargets.push({
          type: "field",
          id: field.uniqueId,
          name: field.displayName,
        });
      });

      // Ensure all existing condition groups have the conditionSetId
      const groupsWithConditionSetId = existingConditions.conditions.map((group) => ({
        ...group,
        conditionSetId: group.conditionSetId || conditionSetId,
      }));

      return {
        groups: groupsWithConditionSetId,
        affectedTargets,
        name: existingConditions.conditions[0]?.name, // Extract name from first condition group
      };
    }
    return ConditionUtils.createConditionsRoot(conditionSetId);
  });

  const handleAddCondition = (groupId: string) => {
    const newCondition: Condition = {
      field: "",
      operator: DEFAULT_OPERATOR,
      value: "",
      id: `condition_${uuidv4()}`,
    };

    setConditionsRoot((prev) => ConditionUtils.addConditionToGroup(prev, groupId, newCondition));
  };

  const handleAddConditionGroup = (
    logicalOperator: LogicalOperatorType = DEFAULT_LOGICAL_OPERATOR,
  ) => {
    setConditionsRoot((prev) =>
      ConditionUtils.addConditionGroup(prev, logicalOperator, conditionSetId),
    );
  };

  // Helper function to update a specific condition within a group
  const updateConditionInGroup = (
    groups: ConditionGroup[],
    groupId: string,
    conditionId: string,
    field: string,
    value: any,
  ): ConditionGroup[] => {
    return groups.map((group) => {
      if (group.id !== groupId) return group;

      return {
        ...group,
        conditions: group.conditions.map((condition) =>
          condition.id === conditionId ? { ...condition, [field]: value } : condition,
        ),
      };
    });
  };

  const handleConditionChange = (
    groupId: string,
    conditionId: string,
    field: string,
    value: any,
  ) => {
    console.log(
      `Changing condition ${conditionId} in group ${groupId}, field: ${field}, value: ${value}`,
    );

    setConditionsRoot((prev) => ({
      ...prev,
      groups: updateConditionInGroup(prev.groups, groupId, conditionId, field, value),
    }));
  };

  // Unified function to handle both logical operator changes
  const handleGroupOperatorChange = (
    groupId: string,
    operator: LogicalOperatorType,
    propertyName: "logicalOperator" | "parentLogicalOperator",
  ) => {
    setConditionsRoot((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            [propertyName]: operator,
          };
        }
        return group;
      }),
    }));
  };

  // Wrapper functions for backward compatibility and cleaner API
  const handleGroupLogicalOperatorChange = (groupId: string, operator: LogicalOperatorType) => {
    handleGroupOperatorChange(groupId, operator, "logicalOperator");
  };

  const handleGroupParentLogicalOperatorChange = (
    groupId: string,
    operator: LogicalOperatorType,
  ) => {
    handleGroupOperatorChange(groupId, operator, "parentLogicalOperator");
  };

  const handleRemoveCondition = (groupId: string, conditionId: string) => {
    setConditionsRoot((prev) => ({
      ...prev,
      groups: prev.groups.map((group) => {
        if (group.id === groupId) {
          return {
            ...group,
            conditions: group.conditions.filter((condition) => condition.id !== conditionId),
          };
        }
        return group;
      }),
    }));
  };

  const handleRemoveGroup = (groupId: string) => {
    setConditionsRoot((prev) => ({
      ...prev,
      groups: prev.groups.filter((group) => group.id !== groupId),
    }));
  };

  const handleAddAffectedTarget = (target: AffectedTarget) => {
    setConditionsRoot((prev) => ConditionUtils.addAffectedTarget(prev, target));
  };

  const handleRemoveAffectedTarget = (targetType: "section" | "field", targetId: string) => {
    setConditionsRoot((prev) => ConditionUtils.removeAffectedTarget(prev, targetType, targetId));
  };

  const handleNameChange = (name: string) => {
    setConditionsRoot((prev) => ({
      ...prev,
      name,
    }));
  };

  const handleSave = () => {
    // Assign conditionSetId to all condition groups in the current editing session
    const conditionGroupsWithSetId = conditionsRoot.groups.map((group, index) => ({
      ...group,
      conditionSetId,
      // Store the name in the first condition group for persistence
      name: index === 0 ? conditionsRoot.name : undefined,
    }));

    // Apply conditions to affected targets only
    const updatedFields = formFields.map((field) => {
      // Check if this field is an affected target for the current conditions
      const isDirectlyAffectedField = conditionsRoot.affectedTargets.some(
        (target) => target.type === "field" && target.id === field.uniqueId,
      );

      const isInAffectedSection = conditionsRoot.affectedTargets.some((target) => {
        if (target.type === "section") {
          // Handle both with and without prefix
          return (
            field.sectionId === target.id ||
            field.sectionId === `formFields_${target.id}` ||
            field.sectionId?.replace("formFields_", "") === target.id
          );
        }
        return false;
      });

      const isAffectedField = isDirectlyAffectedField || isInAffectedSection;

      if (isAffectedField) {
        // Get existing conditions that are not part of the current condition set
        const existingConditions = field.conditions || [];
        const otherConditionSets = existingConditions.filter(
          (group) => group.conditionSetId !== conditionSetId,
        );

        // Combine other condition sets with the current one
        return {
          ...field,
          conditions: [...otherConditionSets, ...conditionGroupsWithSetId],
        };
      }

      // For fields not affected by current conditions, check if they were part of the original editing group
      if (existingConditions) {
        const wasInEditingGroup = existingConditions.affectedFields.some(
          (affectedField) => affectedField.uniqueId === field.uniqueId,
        );

        if (wasInEditingGroup) {
          if (field.conditions) {
            const remainingConditions = field.conditions.filter(
              (group) => group.conditionSetId !== conditionSetId,
            );

            return {
              ...field,
              conditions: remainingConditions.length > 0 ? remainingConditions : undefined,
            };
          }
        }
      }

      // Return field unchanged if it has other conditions or no conditions
      return field;
    });

    // Call the parent's save handler if provided
    if (onSave) {
      onSave(updatedFields);
    }

    onClose();
  };

  return {
    conditionsRoot,
    handleAddCondition,
    handleAddConditionGroup,
    handleConditionChange,
    handleGroupLogicalOperatorChange,
    handleGroupParentLogicalOperatorChange,
    handleRemoveCondition,
    handleRemoveGroup,
    handleAddAffectedTarget,
    handleRemoveAffectedTarget,
    handleNameChange,
    handleSave,
  };
};
