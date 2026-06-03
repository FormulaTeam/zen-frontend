import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { enum as zod_enum, literal, strictObject } from "zod";

const locationSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.location),

  extra: strictObject({
    locationFormat: zod_enum(["utm", "wkt"]).default("utm"),
  }).default({
    locationFormat: "utm",
  }),
});

export default locationSchema;
