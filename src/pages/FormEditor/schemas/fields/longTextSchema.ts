import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal, number, strictObject, string } from "zod";

const longTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.longText),

  extra: strictObject({
    maxLength: number().int().positive().optional(),
    validationRegex: string().min(1).optional(),
  }).optional(),
});

export default longTextSchema;
