import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal, number, strictObject, string } from "zod";

const shortTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.shortText),

  extra: strictObject({
    maxLength: number().int().positive().optional(),
    validationRegex: string().min(1).optional(),
  }).optional(),
});

export default shortTextSchema;
