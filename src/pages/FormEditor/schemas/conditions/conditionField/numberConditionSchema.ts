import { enum as zod_enum, literal, number } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { NumberConditionType } from "./conditionTypes/NumberConditionType";

const numberConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.number),
  conditionType: zod_enum(NumberConditionType),
  targetValue: number().optional(),
});

export default numberConditionSchema;