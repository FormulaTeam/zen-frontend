import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { OptionsFieldExtraSchema } from "formula-gear";

const optionsSchema = baseFormFieldSchema.extend({
  typeId: literal(FieldTypeIds.options),

  extra: OptionsFieldExtraSchema.default({
    selectionMode: "single",
    defaultValue: [],
  }),
});

export default optionsSchema;
