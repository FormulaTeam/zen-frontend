import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { TimeFieldExtraSchema, timePrecision } from "formula-gear";

const timeSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.time),

  extra: TimeFieldExtraSchema.default({
    timePrecision: timePrecision.Minutes,
  }),
});

export default timeSchema;
