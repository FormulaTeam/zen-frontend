import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { EmptyExtraSchema } from "formula-gear";

const longTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.longText),

  extra: EmptyExtraSchema.default({}),
});

export default longTextSchema;
