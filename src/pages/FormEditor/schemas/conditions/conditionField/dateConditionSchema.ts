import { date, enum as zod_enum, literal } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { DateComparator } from "./comparators/DateComparator";

const dateConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.date),
  comparator: zod_enum(DateComparator),
  targetValue: date().optional(),
});

export default dateConditionSchema;