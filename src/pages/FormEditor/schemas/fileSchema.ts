import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const fileSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.file),
});

export default fileSchema;