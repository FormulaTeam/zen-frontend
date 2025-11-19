import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { boolean, enum as zod_enum, literal, strictObject } from "zod";

enum DefaultDateValues {
  EMPTY,
  NOW,
}

const dateSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.date),

  extra: strictObject({
    includeTime: boolean().optional(),
    defaultValue: zod_enum(DefaultDateValues).default(DefaultDateValues.EMPTY),
  }).optional(),
});

export { DefaultDateValues };
export default dateSchema;
