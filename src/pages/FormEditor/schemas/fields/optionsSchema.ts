import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { array, enum as zod_enum, literal, strictObject, string } from "zod";

const optionsSchema = baseFormFieldSchema.extend({
  typeId: literal(FieldTypeIds.options),

  extra: strictObject({
    selectionMode: zod_enum(["single", "multiple"]).default("single"),
    linkedOptionsFieldId: string().uuid().nullable().default(null),
    defaultValue: array(string()).default([]),
  }).default({
    selectionMode: "single",
    linkedOptionsFieldId: null,
    defaultValue: [],
  }),
});

export default optionsSchema;
