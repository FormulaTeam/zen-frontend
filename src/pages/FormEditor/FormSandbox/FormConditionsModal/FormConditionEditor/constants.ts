import { FormConditionBooleanOperator } from "../../../schemas/conditions";
import { ValueOf } from "../../../../../types/utils";

const ConditionEditorStepId = {
  CONDITION_BUILDER: 0,
  DEPENDENCY_PICKER: 1,
  SUMMARY: 2,
} as const;

const ConditionOperatorLabel: Record<ValueOf<typeof FormConditionBooleanOperator>, string> = {
  [FormConditionBooleanOperator.AND]: "וגם",
  [FormConditionBooleanOperator.OR]: "או",
} as const;

export { ConditionEditorStepId, ConditionOperatorLabel };