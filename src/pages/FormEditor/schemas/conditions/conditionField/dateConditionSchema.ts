import { date, enum as zod_enum, literal } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { DateConditionType } from "./conditionTypes/DateConditionType";

const dateConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.date),
  conditionType: zod_enum(DateConditionType),
  targetValue: date().optional(),
});

export default dateConditionSchema;