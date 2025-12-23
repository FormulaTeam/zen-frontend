import { enum as zod_enum, literal, string } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { TextConditionType } from "./conditionTypes/TextConditionType";

const shortTextConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.shortText),
  conditionType: zod_enum(TextConditionType),
  targetValue: string().optional(),
});

export default shortTextConditionSchema;