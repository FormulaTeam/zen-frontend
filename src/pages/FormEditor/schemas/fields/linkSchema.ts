import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { EmptyExtraSchema } from "formula-gear";

const linkSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.link),

  extra: EmptyExtraSchema.default({}),
});

export default linkSchema;