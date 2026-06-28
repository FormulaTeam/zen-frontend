import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { FormFieldExtraSchema } from "formula-gear";

const linkedFormSchema = baseFormFieldSchema
  .safeExtend({
    typeId: literal(FieldTypeIds.linkedForm),

    extra: FormFieldExtraSchema,
  })
  .refine((data) => !data.required, {
    message: "שדה טופס מקושר לא יכול להיות שדה חובה",
    path: ["required"],
  });

export default linkedFormSchema;
