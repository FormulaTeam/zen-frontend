import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { EmptyExtraSchema } from "formula-gear";

const fileSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.file),

  extra: EmptyExtraSchema.optional(),
});

export default fileSchema;
