import { FormCondition, FormConditionPredicateGroup } from "../../../../schemas/conditions";
import { generateConditionId } from "../../../../utils";

function generateEmptyConditionPredicateGroup(): FormConditionPredicateGroup {
  return {
    id: generateConditionId(),
    predicates: [{ id: generateConditionId() }] as FormConditionPredicateGroup["predicates"],
  };
}

function generateEmptyCondition(): FormCondition {
  return (
    {
      id: generateConditionId(),
      groups: [generateEmptyConditionPredicateGroup()],
      dependantComponents: {
        field: [],
        section: [],
      },
    }
  );
}

export { generateEmptyCondition, generateEmptyConditionPredicateGroup };