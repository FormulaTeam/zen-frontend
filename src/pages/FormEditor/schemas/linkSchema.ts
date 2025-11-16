import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const linkSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.link),
});

export default linkSchema;