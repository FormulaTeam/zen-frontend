import { enum as zod_enum, literal, string } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { OptionsConditionType } from "./conditionTypes/OptionsConditionType";

const optionsConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.options),
  targetValue: string(),
  conditionType: zod_enum(OptionsConditionType),
});

export default optionsConditionSchema;