import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { enum as zod_enum, literal, strictObject } from "zod";

const timeSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.time),

  extra: strictObject({
    timePrecision: zod_enum(["minutes", "seconds"]).default("minutes"),
    defaultValue: zod_enum(["currentTime"]).nullable().default(null),
  }).default({
    timePrecision: "minutes",
    defaultValue: null,
  }),
});

export default timeSchema;
