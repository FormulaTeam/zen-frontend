import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const fileSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.file),
});

export default fileSchema;