import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const shortTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.shortText),
});

export default shortTextSchema;