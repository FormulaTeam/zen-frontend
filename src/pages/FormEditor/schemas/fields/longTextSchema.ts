import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal, number, strictObject, string } from "zod";

const longTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.longText),

  extra: strictObject({
    maxLength: number().int().positive().nullable().default(null),
    validationRegex: string().min(1).nullable().default(null),
  }).default({
    maxLength: null,
    validationRegex: null,
  }),
});

export default longTextSchema;
