import { any, literal, strictObject, string, union } from "zod";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../utils/interfaces";

const ConditionFieldTypeId = {
  shortText: FieldTypeIds.shortText,
  longText: FieldTypeIds.longText,
  options: FieldTypeIds.options,
  date: FieldTypeIds.date,
  checkbox: FieldTypeIds.checkbox,
  number: FieldTypeIds.number,
} as const satisfies Partial<typeof FieldTypeIds>;

const literalConditionFieldTypeId = union(
  Object.values(ConditionFieldTypeId).map((v: FormFieldTypeId) => literal(v)),
);

const baseConditionFieldSchema = strictObject({
  id: string(),
  typeId: literalConditionFieldTypeId,
  conditionType: any(),
  targetValue: any(),
});

export { ConditionFieldTypeId };
export default baseConditionFieldSchema;