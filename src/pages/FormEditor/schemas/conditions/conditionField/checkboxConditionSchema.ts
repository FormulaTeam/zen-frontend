import { boolean, enum as zod_enum, literal } from "zod";
import { FieldTypeIds } from "../../../../../utils/interfaces";
import baseConditionFieldSchema from "./baseConditionFieldSchema";
import { CheckboxComparator } from "./comparators/CheckboxComparator";

const checkboxConditionSchema = baseConditionFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.checkbox),
  comparator: zod_enum(CheckboxComparator),
  targetValue: boolean().optional(),
});

export default checkboxConditionSchema;