import { FormCondition } from "../../../../schemas/conditions";
import { generateConditionId } from "../../../../utils";

function generateEmptyCondition(): FormCondition {
  return (
    {
      id: generateConditionId(),
      groups: [{
        id: generateConditionId(),
        conditions: [],
      }],
      dependantComponents: {},
    }
  );
}

export { generateEmptyCondition };