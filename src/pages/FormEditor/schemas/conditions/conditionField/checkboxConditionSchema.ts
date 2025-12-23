import { boolean, enum as zod_enum, literal } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { CheckboxConditionType } from "./conditionTypes/CheckboxConditionType";

const checkboxConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.checkbox),
  conditionType: zod_enum(CheckboxConditionType),
  targetValue: boolean().optional(),
});

export default checkboxConditionSchema;