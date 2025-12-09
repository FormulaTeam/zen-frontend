import { enum as zod_enum, literal, string } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { TextConditionType } from "./conditionTypes/TextConditionType";

const shortTextConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.shortText),
  targetValue: string(),
  conditionType: zod_enum(TextConditionType),
});

export default shortTextConditionSchema;