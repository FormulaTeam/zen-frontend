import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal, number, strictObject } from "zod";

const listSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.list),

  extra: strictObject({
    minItems: number().int().min(0).optional(),
    maxItems: number().int().min(0).optional(),
  }).optional(),
});

export default listSchema;
