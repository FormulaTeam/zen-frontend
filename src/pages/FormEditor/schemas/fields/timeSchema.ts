import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { TimeFieldExtraSchema } from "formula-gear";

const timeSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.time),

  extra: TimeFieldExtraSchema.default({
    timePrecision: "minutes",
  }),
});

export default timeSchema;
