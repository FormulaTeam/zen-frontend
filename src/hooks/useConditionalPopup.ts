import { useState } from "react";
import { ConditionGroup, ConditionDisplayMode, conditionDisplayModes } from "../utils/interfaces";
import { FormFieldDto } from "../types/shared";

type ConditionalFieldExtra = {
  conditions?: ConditionGroup[];
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type ConditionalFormField = FormFieldDto & {
  extra?: ConditionalFieldExtra;
};

interface UseConditionalPopupProps {
  formFields: ConditionalFormField[];
  onSave?: (updatedFields: ConditionalFormField[]) => void;
}

const getFieldExtra = (field: ConditionalFormField): ConditionalFieldExtra =>
  (field.extra as ConditionalFieldExtra | undefined) ?? {};

const updateFieldExtra = (
  field: ConditionalFormField,
  patch: Partial<ConditionalFieldExtra>,
): ConditionalFormField => ({
  ...field,
  extra: {
    ...getFieldExtra(field),
    ...patch,
  },
});

export const useConditionalPopup = ({ formFields, onSave }: UseConditionalPopupProps) => {
  const [displayMode, setDisplayMode] = useState<ConditionDisplayMode>(conditionDisplayModes.list);
  const [editingConditions, setEditingConditions] = useState<{
    conditions: ConditionGroup[];
    affectedFields: ConditionalFormField[];
    index?: number;
  } | null>(null);

  const handleEditCondition = (
    conditions: ConditionGroup[],
    affectedFields: ConditionalFormField[],
  ) => {
    setEditingConditions({ conditions, affectedFields, index: affectedFields[0]?.index });
    setDisplayMode(conditionDisplayModes.edit);
  };

  const handleDeleteCondition = (conditionId: string) => {
    const conditionSetIdToDelete = conditionId;

    const updatedFields = formFields.map((field) => {
      const extra = getFieldExtra(field);
      const fieldConditions = extra.conditions ?? [];

      if (fieldConditions.length === 0) {
        return field;
      }

      const remainingConditions = fieldConditions.filter(
        (group) => group.conditionSetId !== conditionSetIdToDelete,
      );

      return updateFieldExtra(field, {
        conditions: remainingConditions.length > 0 ? remainingConditions : undefined,
      });
    });

    if (onSave) {
      onSave(updatedFields);
    }
  };

  const handleCreateNew = () => {
    setEditingConditions(null);
    setDisplayMode(conditionDisplayModes.edit);
  };

  const handleBackToList = () => {
    setEditingConditions(null);
    setDisplayMode(conditionDisplayModes.list);
  };

  return {
    displayMode,
    editingConditions,
    handleEditCondition,
    handleDeleteCondition,
    handleCreateNew,
    handleBackToList,
  };
};
