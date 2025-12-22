import { FormCondition, FormConditionGroup } from "../../../../schemas/conditions";
import { generateConditionId } from "../../../../utils";

function generateEmptyConditionGroup(): FormConditionGroup {
  return {
    id: generateConditionId(),
    conditions: [{ id: generateConditionId() }] as FormConditionGroup["conditions"],
  };
}

function generateEmptyCondition(): FormCondition {
  return (
    {
      id: generateConditionId(),
      groups: [generateEmptyConditionGroup()],
      dependantComponents: {},
    }
  );
}

export { generateEmptyCondition, generateEmptyConditionGroup };