import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { LocationFieldExtraSchema } from "formula-gear";

const locationSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.location),

  extra: LocationFieldExtraSchema.default({
    locationFormat: "utm",
  }),
});

export default locationSchema;
