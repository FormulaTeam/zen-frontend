import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { EmptyExtraSchema } from "formula-gear";

const listSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.list),

  extra: EmptyExtraSchema.optional(),
});

export default listSchema;
