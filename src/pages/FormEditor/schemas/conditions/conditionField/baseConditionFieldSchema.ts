import { any, literal, strictObject, string, union } from "zod";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../utils/interfaces";

const ConditionFieldTypeIds = {
  shortText: FieldTypeIds.shortText,
  longText: FieldTypeIds.longText,
  options: FieldTypeIds.options,
  date: FieldTypeIds.date,
  checkbox: FieldTypeIds.checkbox,
  number: FieldTypeIds.number,
} as const satisfies Partial<typeof FieldTypeIds>;

const literalConditionFieldTypeId = union(
  Object.values(ConditionFieldTypeIds).map((v: FormFieldTypeId) => literal(v)),
);

const baseConditionFieldSchema = strictObject({
  id: string(),
  typeId: literalConditionFieldTypeId,
  conditionType: any(),
  targetValue: any(),
});

export { ConditionFieldTypeIds };
export default baseConditionFieldSchema;