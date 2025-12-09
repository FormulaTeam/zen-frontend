import { array, enum as zod_enum, strictObject, string } from "zod";
import { conditionFieldSchema } from "./conditionField";

enum FormConditionOperator {
  AND = 1,
  OR = 2,
}

enum FormComponentType {
  SECTION = 1,
  FIELD = 2,
}

const conditionsSchema = array(strictObject({
  id: string(),
  name: string().optional(),
  groups: array(strictObject({
    id: string(),
    operator: zod_enum(FormConditionOperator),
    conditions: array(strictObject({
      id: string(),
      operator: zod_enum(FormConditionOperator),
      field: conditionFieldSchema,
    })),
  })).min(1),
  dependantComponents: array(strictObject({
    id: string(),
    type: zod_enum(FormComponentType),
  })),
})).optional();

export default conditionsSchema;