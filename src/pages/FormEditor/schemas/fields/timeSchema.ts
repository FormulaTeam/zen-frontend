import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { boolean, enum as zod_enum, literal, strictObject } from "zod";

enum DefaultTimeValue {
  EMPTY = 1,
  NOW = 2,
}

const timeSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.time),

  extra: strictObject({
    includeSeconds: boolean().optional(),
    defaultValue: zod_enum(DefaultTimeValue).default(DefaultTimeValue.EMPTY),
  }).optional(),
});

export { DefaultTimeValue };
export default timeSchema;