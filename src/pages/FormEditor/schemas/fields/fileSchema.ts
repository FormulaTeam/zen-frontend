import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { array, literal, number, strictObject, string } from "zod";

const fileSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.file),

  extra: strictObject({
    maxSize: number().positive().optional(),
    allowedTypes: array(string()).optional(),
  }).optional(),
});

export default fileSchema;
