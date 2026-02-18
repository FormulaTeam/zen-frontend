import { enum as zod_enum, literal, string } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { OptionsComparator } from "./comparators/OptionsComparator";

const optionsConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.options),
  comparator: zod_enum(OptionsComparator),
  targetValue: string().optional(),
});

export default optionsConditionSchema;