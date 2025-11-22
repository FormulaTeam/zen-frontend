import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../utils/interfaces";
import { literal, strictObject, string } from "zod";

const linkedFormSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.linkedForm),

  extra: strictObject({
    linkedFormId: string().min(1, "שדה לא מקושר לטופס"),
  }).optional(),
});

export default linkedFormSchema;