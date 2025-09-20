import { useState } from "react";
import {
  FormField,
  ConditionGroup,
  ConditionDisplayMode,
  conditionDisplayModes,
} from "../utils/interfaces";

interface UseConditionalPopupProps {
  formFields: FormField[];
  onSave?: (updatedFields: FormField[]) => void;
}

export const useConditionalPopup = ({ formFields, onSave }: UseConditionalPopupProps) => {
  const [displayMode, setDisplayMode] = useState<ConditionDisplayMode>(conditionDisplayModes.list);
  const [editingConditions, setEditingConditions] = useState<{
    conditions: ConditionGroup[];
    affectedFields: FormField[];
    index?: number;
  } | null>(null);

  const handleEditCondition = (conditions: ConditionGroup[], affectedFields: FormField[]) => {
    setEditingConditions({ conditions, affectedFields, index: affectedFields[0]?.index });
    setDisplayMode(conditionDisplayModes.edit);
  };

  const handleDeleteCondition = (conditionId: string) => {
    // conditionId is now the conditionSetId from useConditionList
    const conditionSetIdToDelete = conditionId;

    // Remove condition groups with the specified conditionSetId from all fields
    const updatedFields = formFields.map((field) => {
      if (field.conditions && field.conditions.length > 0) {
        // Filter out condition groups that belong to the condition set being deleted
        const remainingConditions = field.conditions.filter(
          (group) => group.conditionSetId !== conditionSetIdToDelete,
        );

        return {
          ...field,
          conditions: remainingConditions.length > 0 ? remainingConditions : undefined,
        };
      }
      return field;
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
