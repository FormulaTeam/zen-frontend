import { coerce, enum as zod_enum, literal } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { DateComparator } from "./comparators/DateComparator";

const dateConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.date),
  comparator: zod_enum(DateComparator),
  targetValue: coerce.date().nullable().optional(),
});

export default dateConditionSchema;