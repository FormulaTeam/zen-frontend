import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { enum as zod_enum, literal, strictObject } from "zod";

const dateSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.date),

  extra: strictObject({
    dateType: zod_enum(["date", "datetime"]).default("date"),
    defaultValue: zod_enum(["currentDate", "currentDateTime"]).nullable().default(null),
  }).default({
    dateType: "date",
    defaultValue: null,
  }),
});

export default dateSchema;
