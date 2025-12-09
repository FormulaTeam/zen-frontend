import { any, literal, strictObject, string, union } from "zod";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../utils/interfaces";

const literalConditionFieldTypeId = union(
  [
    FieldTypeIds.shortText,
    FieldTypeIds.longText,
    FieldTypeIds.options,
    FieldTypeIds.date,
    FieldTypeIds.time,
    FieldTypeIds.checkbox,
    FieldTypeIds.number,
  ].map((v: FormFieldTypeId) => literal(v)),
);

const baseConditionFieldSchema = strictObject({
  id: string(),
  typeId: literalConditionFieldTypeId,
  conditionType: any(),
  targetValue: any(),
});

export default baseConditionFieldSchema;