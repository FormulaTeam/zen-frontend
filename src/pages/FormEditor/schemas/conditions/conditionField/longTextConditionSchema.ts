import { enum as zod_enum, literal, string } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { TextComparator } from "./comparators/TextComparator";

const longTextConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.longText),
  comparator: zod_enum(TextComparator),
  targetValue: string().optional(),
});

export default longTextConditionSchema;