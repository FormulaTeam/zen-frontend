import { useState, useMemo } from "react";
import {
  Condition,
  ConditionsRoot,
  ConditionGroup,
  LogicalOperatorType,
  DEFAULT_OPERATOR,
  DEFAULT_LOGICAL_OPERATOR,
  ConditionUtils,
  AffectedTarget,
} from "../utils/interfaces";
import { v4 as uuidv4 } from "uuid";
import { FormFieldDto } from "../types/shared";

type ConditionFieldExtra = {
  conditions?: ConditionGroup[];
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type ConditionalFormField = FormFieldDto & {
  extra?: ConditionFieldExtra;
};

interface UseConditionsProps {
  formFields: ConditionalFormField[];
  existingConditions?: {
    conditions: ConditionGroup[];
    affectedFields: ConditionalFormField[];
  } | null;
  onSave?: (updatedFields: ConditionalFormField[]) => void;
  onClose: () => void;
}

const getFieldExtra = (field: ConditionalFormField): ConditionFieldExtra =>
  (field.extra as ConditionFieldExtra | undefined) ?? {};

const updateFieldExtra = (
  field: ConditionalFormField,
  patch: Partial<ConditionFieldExtra>,
): ConditionalFormField => ({
  ...field,
  extra: {
    ...getFieldExtra(field),
    ...patch,
  },
});

export const useConditions = ({
  formFields,
  existingConditions,
  onSave,
  onClose,
}: UseConditionsProps) => {
  const conditionSetId = useMemo(() => {
    if (existingConditions && existingConditions.conditions.length > 0) {
      const existingSetId = existingConditions.conditions[0].conditionSetId;
      if (existingSetId) {
        return existingSetId;
      }
    }

    return `conditionSet_${uuidv4()}`;
  }, [existingConditions]);

  const [conditionsRoot, setConditionsRoot] = useState<ConditionsRoot>(() => {
    if (existingConditions) {
      const sectionGroups = new Map<string, ConditionalFormField[]>();
      const individualFields: ConditionalFormField[] = [];

      existingConditions.affectedFields.forEach((field) => {
        const extra = getFieldExtra(field);

        if (extra.sectionId && extra.sectionName) {
          if (!sectionGroups.has(extra.sectionId)) {
            sectionGroups.set(extra.sectionId, []);
          }
          sectionGroups.get(extra.sectionId)!.push(field);
        } else {
          individualFields.push(field);
        }
      });

      const affectedTargets: AffectedTarget[] = [];

      for (const [sectionId, fieldsInSection] of sectionGroups) {
        const allFieldsInSection = formFields.filter(
          (f) => getFieldExtra(f).sectionId === sectionId,
        );

        if (fieldsInSection.length === allFieldsInSection.length) {
          const sectionName = getFieldExtra(fieldsInSection[0]).sectionName || `מקטע ${sectionId}`;
          const cleanSectionId = sectionId.replace("formFields_", "");

          affectedTargets.push({
            type: "section",
            id: cleanSectionId,
            name: sectionName,
          });
        } else {
          fieldsInSection.forEach((field) => {
            affectedTargets.push({
              type: "field",
              id: field.id,
              name: field.displayName,
            });
          });
        }
      }

      individualFields.forEach((field) => {
        affectedTargets.push({
          type: "field",
          id: field.id,
          name: field.displayName,
        });
      });

      const groupsWithConditionSetId = existingConditions.conditions.map((group) => ({
        ...group,
        conditionSetId: group.conditionSetId || conditionSetId,
      }));

      return {
        groups: groupsWithConditionSetId,
        affectedTargets,
        name: existingConditions.conditions[0]?.name,
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
    const conditionGroupsWithSetId = conditionsRoot.groups.map((group, index) => ({
      ...group,
      conditionSetId,
      name: index === 0 ? conditionsRoot.name : undefined,
    }));

    const updatedFields = formFields.map((field) => {
      const extra = getFieldExtra(field);

      const isDirectlyAffectedField = conditionsRoot.affectedTargets.some(
        (target) => target.type === "field" && target.id === field.id,
      );

      const isInAffectedSection = conditionsRoot.affectedTargets.some((target) => {
        if (target.type === "section") {
          return (
            extra.sectionId === target.id ||
            extra.sectionId === `formFields_${target.id}` ||
            extra.sectionId?.replace("formFields_", "") === target.id
          );
        }
        return false;
      });

      const isAffectedField = isDirectlyAffectedField || isInAffectedSection;

      if (isAffectedField) {
        const existingFieldConditions = extra.conditions ?? [];
        const otherConditionSets = existingFieldConditions.filter(
          (group) => group.conditionSetId !== conditionSetId,
        );

        return updateFieldExtra(field, {
          conditions: [...otherConditionSets, ...conditionGroupsWithSetId],
        });
      }

      if (existingConditions) {
        const wasInEditingGroup = existingConditions.affectedFields.some(
          (affectedField) => affectedField.id === field.id,
        );

        if (wasInEditingGroup) {
          const existingFieldConditions = extra.conditions ?? [];
          const remainingConditions = existingFieldConditions.filter(
            (group) => group.conditionSetId !== conditionSetId,
          );

          return updateFieldExtra(field, {
            conditions: remainingConditions.length > 0 ? remainingConditions : undefined,
          });
        }
      }

      return field;
    });

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
