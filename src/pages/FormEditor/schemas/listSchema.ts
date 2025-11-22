import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const listSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.list),
});

export default listSchema;