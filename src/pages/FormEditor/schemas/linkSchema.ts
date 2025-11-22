import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const linkSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.link),
});

export default linkSchema;