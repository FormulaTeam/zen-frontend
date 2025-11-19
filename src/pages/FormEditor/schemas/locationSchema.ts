import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { enum as zod_enum, literal, strictObject } from "zod";

enum LocationFormat {
  UTM = "UTM",
  WKT = "WKT",
}

const locationSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.location),

  extra: strictObject({
    format: zod_enum(LocationFormat).default(LocationFormat.UTM),
  }).optional(),
});

export { LocationFormat };
export default locationSchema;