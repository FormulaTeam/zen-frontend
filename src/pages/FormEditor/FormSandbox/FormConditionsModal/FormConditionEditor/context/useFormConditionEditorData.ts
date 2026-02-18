import { FormCondition, FormConditionDependantComponents } from "../../../../schemas/conditions";
import { useCallback, useMemo, useState } from "react";
import { DeepPartial } from "../../../../../../types/utils";
import { generateEmptyCondition } from "./utils";
import {
  validateConditionDependantComponents,
  validateConditionPredicateGroups,
  validateConditionSummary,
} from "../../../../hooks/useFormStructure";
import { ConditionEditorStepId } from "../constants";

type ConditionEditorValidationErrors = {
  [ConditionEditorStepId.CONDITION_BUILDER]: ReturnType<typeof validateConditionPredicateGroups>,
  [ConditionEditorStepId.DEPENDENCY_PICKER]: ReturnType<typeof validateConditionDependantComponents>,
  [ConditionEditorStepId.SUMMARY]: ReturnType<typeof validateConditionSummary>,
};

const EMPTY_VALIDATION_ERRORS: ConditionEditorValidationErrors = {
  [ConditionEditorStepId.CONDITION_BUILDER]: null,
  [ConditionEditorStepId.DEPENDENCY_PICKER]: null,
  [ConditionEditorStepId.SUMMARY]: null,
};

function useFormConditionEditorData(editedConditionData?: FormCondition) {
  const initialState = useMemo(() => ((
    !!editedConditionData ? { ...editedConditionData } : generateEmptyCondition()
  ) as DeepPartial<FormCondition> & { dependantComponents: FormConditionDependantComponents }), []);

  const [conditionData, setConditionData] = useState<DeepPartial<FormCondition> & {
    dependantComponents: FormConditionDependantComponents
  }>(initialState);

  const [validationErrors, setValidationErrors] = useState<ConditionEditorValidationErrors>({ ...EMPTY_VALIDATION_ERRORS });

  const setStepValidationErrors = useCallback(<T extends keyof ConditionEditorValidationErrors>(stepId: T, errors: ConditionEditorValidationErrors[T]) => {
    setValidationErrors((prev) => ({
      ...prev,
      [stepId]: errors,
    }));
  }, []);

  return {
    conditionData,
    setConditionData,
    validationErrors,
    setStepValidationErrors,
  };
}

export { useFormConditionEditorData, EMPTY_VALIDATION_ERRORS };
export type { ConditionEditorValidationErrors };