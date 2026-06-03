import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal, number, strictObject, string } from "zod";

const shortTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.shortText),

  extra: strictObject({
    maxLength: number().int().positive().nullable().default(null),
    validationRegex: string().min(1).nullable().default(null),
  }).default({
    maxLength: null,
    validationRegex: null,
  }),
});

export default shortTextSchema;
