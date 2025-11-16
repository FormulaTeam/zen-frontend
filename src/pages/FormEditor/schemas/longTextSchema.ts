import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const longTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.longText),
});

export default longTextSchema;