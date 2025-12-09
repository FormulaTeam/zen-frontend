import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { boolean, enum as zod_enum, literal, strictObject } from "zod";

enum DefaultDateValue {
  EMPTY = 1,
  NOW = 2,
}

const dateSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.date),

  extra: strictObject({
    includeTime: boolean().optional(),
    defaultValue: zod_enum(DefaultDateValue).default(DefaultDateValue.EMPTY),
  }).optional(),
});

export { DefaultDateValue };
export default dateSchema;
