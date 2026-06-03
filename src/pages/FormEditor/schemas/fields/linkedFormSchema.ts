import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { FormFieldExtraSchema } from "formula-gear";

const linkedFormSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.linkedForm),

  extra: FormFieldExtraSchema.default({
    linkedFormId: 0,
  }),
});

export default linkedFormSchema;
