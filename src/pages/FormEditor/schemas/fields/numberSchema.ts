import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { NumberFieldExtraSchema, numberType } from "formula-gear";

const numberSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.number),

  extra: NumberFieldExtraSchema.default({
    numberType: numberType.Integer,
  }),
});

export default numberSchema;
