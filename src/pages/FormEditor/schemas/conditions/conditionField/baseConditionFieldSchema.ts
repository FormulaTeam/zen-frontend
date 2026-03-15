import { literal, number, strictObject, string, union, unknown } from "zod";
import { FieldTypeIds, FormFieldTypeId } from "../../../../../utils/interfaces";
import { TextComparator } from "./comparators/TextComparator";
import { NumberComparator } from "./comparators/NumberComparator";
import { DateComparator } from "./comparators/DateComparator";
import { OptionsComparator } from "./comparators/OptionsComparator";
import { CheckboxComparator } from "./comparators/CheckboxComparator";
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

const fieldNotDefinedErrorMessage = "חובה לציין שדה לכל תנאי";

const literalConditionFieldTypeId = union(
  CONDITION_FIELD_TYPE_IDS.map((v: FormFieldTypeId) => literal(v)),
);

const FieldTypeIdToComparator = {
  [FieldTypeIds.shortText]: TextComparator,
  [FieldTypeIds.longText]: TextComparator,
  [FieldTypeIds.number]: NumberComparator,
  [FieldTypeIds.date]: DateComparator,
  [FieldTypeIds.options]: OptionsComparator,
  [FieldTypeIds.checkbox]: CheckboxComparator,
} as const satisfies Record<ConditionFieldTypeId, Record<string, number>>;

type FormComparator = ValueOf<ValueOf<typeof FieldTypeIdToComparator>>;

const baseConditionFieldSchema = strictObject({
  id: string(fieldNotDefinedErrorMessage).min(1, fieldNotDefinedErrorMessage),
  typeId: literalConditionFieldTypeId,
  comparator: number(),
  targetValue: unknown().optional(),
});

export { ConditionFieldTypeIds, FieldTypeIdToComparator, CONDITION_FIELD_TYPE_IDS, fieldNotDefinedErrorMessage };
export type { ConditionFieldTypeId, FormComparator };
export default baseConditionFieldSchema;