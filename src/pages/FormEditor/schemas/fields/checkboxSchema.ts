import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { BooleanFieldExtraSchema } from "formula-gear";

const checkboxSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.checkbox),

  extra: BooleanFieldExtraSchema.default({
    defaultValue: false,
  }),
});

export default checkboxSchema;