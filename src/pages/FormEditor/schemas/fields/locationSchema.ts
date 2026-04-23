import { CoordinateType } from "formula-gear";
import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { enum as zod_enum, literal, strictObject } from "zod";

enum LocationFormat {
  UTM = CoordinateType.UTM,
  WKT = CoordinateType.WKT,
}

const locationSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.location),

  extra: strictObject({
    locationFormat: zod_enum(LocationFormat).default(LocationFormat.UTM),
  }).optional(),
});

export { LocationFormat };
export default locationSchema;
