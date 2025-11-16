import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { literal } from "zod";

const listSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.list),
});

export default listSchema;