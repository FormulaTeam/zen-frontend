import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { EmptyExtraSchema } from "formula-gear";

const shortTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.shortText),

  extra: EmptyExtraSchema.default({}),
});

export default shortTextSchema;
