import { enum as zod_enum, literal, string } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { OptionsConditionType } from "./conditionTypes/OptionsConditionType";

const optionsConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.options),
  conditionType: zod_enum(OptionsConditionType),
  targetValue: string().optional(),
});

export default optionsConditionSchema;