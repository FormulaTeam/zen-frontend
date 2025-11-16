import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { array, boolean, literal, strictObject, string } from "zod";

const optionsSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.options),

  extra: strictObject({
    options: array(string().min(1, "חובה לציין טקסט לכל אפשרות")).min(2, "על השדה להכיל 2 או יותר אפשרויות"),
    multiple: boolean().default(false),
    //TODO extend as needed
  }).optional(),
});

export default optionsSchema;