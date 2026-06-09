import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { DateFieldExtraSchema, dateType } from "formula-gear";

const dateSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.date),

  extra: DateFieldExtraSchema.default({
    dateType: dateType.Date,
  }),
});

export default dateSchema;
