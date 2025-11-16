import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const shortTextSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.shortText),
});

export default shortTextSchema;