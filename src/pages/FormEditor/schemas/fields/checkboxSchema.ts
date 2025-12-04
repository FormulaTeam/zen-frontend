import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { boolean, literal, strictObject } from "zod";

const checkboxSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.checkbox),

  extra: strictObject({
    defaultValue: boolean().default(false),
  }).optional(),
});

export default checkboxSchema;