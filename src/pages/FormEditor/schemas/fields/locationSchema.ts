import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { enum as zod_enum, literal, strictObject } from "zod";

enum LocationFormat {
  UTM = 1,
  WKT = 2,
}

const locationSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.location),

  extra: strictObject({
    format: zod_enum(LocationFormat).default(LocationFormat.UTM),
  }).optional(),
});

export { LocationFormat };
export default locationSchema;