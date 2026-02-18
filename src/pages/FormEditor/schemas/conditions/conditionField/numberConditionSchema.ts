import { enum as zod_enum, literal, number } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { NumberComparator } from "./comparators/NumberComparator";

const numberConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.number),
  comparator: zod_enum(NumberComparator),
  targetValue: number().optional(),
});

export default numberConditionSchema;