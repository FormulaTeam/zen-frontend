import { ArrayElement } from "../../../../../../../types/utils";
import { ConditionEditorValidationErrors } from "../../context/useFormConditionEditorData";
import { ConditionEditorStepId } from "../../constants";

type GroupValidationErrors =
  ArrayElement<NonNullable<ConditionEditorValidationErrors[typeof ConditionEditorStepId.CONDITION_BUILDER]>>
  | null;

type GroupItemValidationErrors =
  (ArrayElement<NonNullable<(NonNullable<GroupValidationErrors>["properties"] & {
    conditions: []
  })["conditions"]["items"]>>["properties"])
  | null;

export type { GroupValidationErrors, GroupItemValidationErrors };