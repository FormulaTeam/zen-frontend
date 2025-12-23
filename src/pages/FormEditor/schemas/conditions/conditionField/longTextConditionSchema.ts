import { enum as zod_enum, literal, string } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { TextConditionType } from "./conditionTypes/TextConditionType";

const longTextConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.longText),
  conditionType: zod_enum(TextConditionType),
  targetValue: string().optional(),
});

export default longTextConditionSchema;