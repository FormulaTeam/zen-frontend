import { FormCondition, FormConditionDependantComponents, FormConditionGroups } from "../../../../schemas/conditions";
import { generateConditionId } from "../../../../utils";


function generateEmptyConditionGroups(): FormConditionGroups {
  return (
    [{
      id: generateConditionId(),
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