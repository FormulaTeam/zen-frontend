import { any, literal, strictObject, string, union } from "zod";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../utils/interfaces";
import { TextConditionType } from "./conditionTypes/TextConditionType";
import { NumberConditionType } from "./conditionTypes/NumberConditionType";
import { DateConditionType } from "./conditionTypes/DateConditionType";
import { OptionsConditionType } from "./conditionTypes/OptionsConditionType";
import { CheckboxConditionType } from "./conditionTypes/CheckboxConditionType";
import { ArrayElement, ValueOf } from "../../../../../types/utils";

const ConditionFieldTypeIds = {
  shortText: FieldTypeIds.shortText,
  longText: FieldTypeIds.longText,
  options: FieldTypeIds.options,
  date: FieldTypeIds.date,
  checkbox: FieldTypeIds.checkbox,
  number: FieldTypeIds.number,
} as const satisfies Partial<typeof FieldTypeIds>;

const CONDITION_FIELD_TYPE_IDS = Object.values(ConditionFieldTypeIds);

type ConditionFieldTypeId = ArrayElement<typeof CONDITION_FIELD_TYPE_IDS>;

const literalConditionFieldTypeId = union(
  CONDITION_FIELD_TYPE_IDS.map((v: FormFieldTypeId) => literal(v)),
);

const FieldTypeIdToConditionType = {
  [FieldTypeIds.shortText]: TextConditionType,
  [FieldTypeIds.longText]: TextConditionType,
  [FieldTypeIds.number]: NumberConditionType,
  [FieldTypeIds.date]: DateConditionType,
  [FieldTypeIds.options]: OptionsConditionType,
  [FieldTypeIds.checkbox]: CheckboxConditionType,
} as const satisfies Record<ConditionFieldTypeId, Record<string, number>>;

type FormConditionType = ValueOf<ValueOf<typeof FieldTypeIdToConditionType>>;

const baseConditionFieldSchema = strictObject({
  id: string(),
  typeId: literalConditionFieldTypeId,
  conditionType: any(),
  targetValue: any(),
});

export { ConditionFieldTypeIds, FieldTypeIdToConditionType, CONDITION_FIELD_TYPE_IDS };
export type { ConditionFieldTypeId, FormConditionType };
export default baseConditionFieldSchema;