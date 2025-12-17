import {
  FormCondition,
  FormConditionDependantComponents,
  FormConditionGroups,
  FormConditionOperator,
} from "../../../../schemas/conditions";
import { generateConditionId } from "../../../../utils";


function generateEmptyConditionGroups(): FormConditionGroups {
  return (
    [{
      id: generateConditionId(),
      operator: FormConditionOperator.OR,
      conditions: [],
    }]
  );
}

function generateEmptyConditionDependantComponents(): FormConditionDependantComponents {
  return [];
}

function generateEmptyCondition(): FormCondition {
  return (
    {
      id: generateConditionId(),
      groups: generateEmptyConditionGroups(),
      dependantComponents: generateEmptyConditionDependantComponents(),
    }
  );
}

export { generateEmptyCondition };