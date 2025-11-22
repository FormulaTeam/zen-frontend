import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const longTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.longText),
});

export default longTextSchema;