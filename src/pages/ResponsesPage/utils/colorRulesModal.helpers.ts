import { fieldType, dateType } from "formula-gear";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
import { OptionResponseValue, formatOptionLabel } from "../../../utils/optionResponseValue";
import { getComparatorOptions, getRangeValue, isRangeComparator } from "./colorRules";

dayjs.extend(utc);
dayjs.extend(timezone);

export type ValidationErrors = Record<
  string,
  Partial<Record<keyof ResponsesTableColorRuleDto, string>>
>;

export const comparableFieldTypes = new Set<number>([
  fieldType.LongText,
  fieldType.ShortText,
  fieldType.Options,
  fieldType.Date,
  fieldType.Time,
  fieldType.Boolean,
  fieldType.Number,
]);

export type ColorRuleFieldExtra = {
  dateType?: "date" | "datetime";
  timePrecision?: "minutes" | "seconds";
  linkedOptionsFieldId?: string | null;
  inactiveOptionIds?: string[];
};

export type ColorRuleOptionsField = FormFieldDto & {
  options?: OptionResponseValue[];
};

export type RawOptionValue =
  | string
  | OptionResponseValue
  | { id?: string | number; text?: string; value?: string; isActive?: boolean };

export const stableRulesValue = (rules: ResponsesTableColorRuleDto[]) => JSON.stringify(rules);

export const REQUIRED_VALUE_MESSAGE = "יש להזין ערך";

export const ISRAEL_TZ = "Asia/Jerusalem";

export const requiresTargetValue = (rule: ResponsesTableColorRuleDto): boolean =>
  !!getComparatorOptions(rule.fieldType).find((option) => option.value === rule.comparatorId)
    ?.requiresValue;

export const normalizeTargetValue = (
  targetValue: ResponsesTableColorRuleDto["targetValue"],
): ResponsesTableColorRuleDto["targetValue"] =>
  typeof targetValue === "string" ? targetValue.trim() : targetValue;

export const normalizeRuleBeforeSave = (
  rule: ResponsesTableColorRuleDto,
): ResponsesTableColorRuleDto => ({
  ...rule,
  targetValue: requiresTargetValue(rule) ? normalizeTargetValue(rule.targetValue) : null,
});

export const getFieldExtra = (field?: FormFieldDto): ColorRuleFieldExtra =>
  (field?.extra as ColorRuleFieldExtra | undefined) ?? {};

export const toRangeComparable = (value: string, fieldTypeId: number): number => {
  if (value === "" || value === null || value === undefined) return Number.NaN;

  if (fieldTypeId === fieldType.Number) return Number(value);

  if (fieldTypeId === fieldType.Time) {
    const [hours, minutes, seconds = "0"] = String(value).split(":");
    const total = Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds);
    return Number.isNaN(total) ? Number.NaN : total;
  }

  if (fieldTypeId === fieldType.Date) {
    const time = new Date(String(value)).getTime();
    return Number.isNaN(time) ? Number.NaN : time;
  }

  return Number(value);
};

export const getLinkedOptionsFieldId = (field?: FormFieldDto): string | undefined => {
  const linkedOptionsFieldId = getFieldExtra(field).linkedOptionsFieldId;

  return typeof linkedOptionsFieldId === "string" && linkedOptionsFieldId.trim() !== ""
    ? linkedOptionsFieldId
    : undefined;
};

export const isConnectedOptionsField = (
  field?: FormFieldDto,
  fields: FormFieldDto[] = [],
): boolean => {
  const linkedOptionsFieldId = getLinkedOptionsFieldId(field);
  if (!linkedOptionsFieldId) return false;

  return !fields.some((formField) => String(formField.id) === String(linkedOptionsFieldId));
};

export const normalizeOptionItem = (option: RawOptionValue): OptionResponseValue | null => {
  if (typeof option === "string") {
    return {
      id: option,
      text: formatOptionLabel(option),
    };
  }

  const optionId = option.id ?? ("value" in option ? option.value : undefined) ?? option.text;
  if (optionId === undefined || optionId === null) return null;

  return {
    id: String(optionId),
    text: formatOptionLabel(option.text ?? String(optionId)),
    isActive: option.isActive,
  };
};

export const getRawFieldOptions = (field?: FormFieldDto): RawOptionValue[] => {
  const extra = field?.extra as
    | (ColorRuleFieldExtra & {
        options?: { items?: RawOptionValue[] } | RawOptionValue[];
        items?: RawOptionValue[];
        values?: RawOptionValue[];
      })
    | undefined;
  const optionsField = field as ColorRuleOptionsField | undefined;
  const extraOptions = Array.isArray(extra?.options) ? extra.options : extra?.options?.items;

  return extraOptions ?? extra?.items ?? extra?.values ?? optionsField?.options ?? [];
};

export const getManualOptionItems = (
  field?: FormFieldDto,
  fields: FormFieldDto[] = [],
): OptionResponseValue[] => {
  const linkedOptionsFieldId = getLinkedOptionsFieldId(field);
  const sourceField = linkedOptionsFieldId
    ? fields.find((formField) => String(formField.id) === String(linkedOptionsFieldId)) ?? field
    : field;
  const inactiveOptionIds = new Set((getFieldExtra(sourceField).inactiveOptionIds ?? []).map(String));
  const options = getRawFieldOptions(sourceField);

  return options
    .map(normalizeOptionItem)
    .filter((option): option is OptionResponseValue => !!option)
    .filter((option) => !inactiveOptionIds.has(String(option.id)) && option.isActive !== false);
};

export const createFallbackOption = (
  value: ResponsesTableColorRuleDto["targetValue"],
): OptionResponseValue | null => {
  if (typeof value !== "string" || value.trim() === "") return null;

  return {
    id: value,
    text: formatOptionLabel(value),
  };
};

export const isDateTimeField = (fieldExtra: ColorRuleFieldExtra): boolean =>
  (fieldExtra.dateType ?? dateType.Date) === dateType.Datetime;

export const splitDateTimeIso = (
  iso: string,
  precision: "minutes" | "seconds",
): { datePart: string; timePart: string } => {
  if (!iso) return { datePart: "", timePart: "" };

  const parsed = dayjs.utc(iso);
  if (!parsed.isValid()) return { datePart: "", timePart: "" };

  const local = parsed.tz(ISRAEL_TZ);
  const datePart = local.startOf("day").utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
  const timePart = precision === "seconds" ? local.format("HH:mm:ss") : local.format("HH:mm");

  return { datePart, timePart };
};

export const combineDateAndTime = (dateIso: string, timeStr: string): string => {
  if (!dateIso || !timeStr) return "";

  const datePart = dayjs.utc(dateIso).tz(ISRAEL_TZ);
  if (!datePart.isValid()) return "";

  const [hours, minutes, seconds = 0] = timeStr.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return "";

  return datePart
    .hour(hours)
    .minute(minutes)
    .second(seconds || 0)
    .millisecond(0)
    .utc()
    .format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
};

export const buildValidationErrors = (draftRules: ResponsesTableColorRuleDto[]): ValidationErrors => {
  const errors: ValidationErrors = {};

  draftRules.forEach((rule) => {
    const ruleErrors: ValidationErrors[string] = {};

    if (!rule.fieldId) ruleErrors.fieldId = "יש לבחור שדה";
    if (!rule.color) ruleErrors.color = "יש לבחור צבע";
    if (rule.comparatorId === undefined || rule.comparatorId === null) ruleErrors.comparatorId = "יש לבחור תנאי";
    if (!rule.targetType) ruleErrors.targetType = "יש לבחור סוג צביעה";
    if (requiresTargetValue(rule)) {
      if (isRangeComparator(rule.comparatorId)) {
        const { from, to } = getRangeValue(rule.targetValue);
        if (normalizeTargetValue(from) === "" || normalizeTargetValue(to) === "") {
          ruleErrors.targetValue = REQUIRED_VALUE_MESSAGE;
        } else {
          const fromComparable = toRangeComparable(from, rule.fieldType);
          const toComparable = toRangeComparable(to, rule.fieldType);
          if (
            rule.fieldType !== fieldType.Time &&
            !Number.isNaN(fromComparable) &&
            !Number.isNaN(toComparable) &&
            fromComparable > toComparable
          ) {
            ruleErrors.targetValue =
              rule.fieldType === fieldType.Date
                ? "טווח הערכים לא תקין"
                : 'ערך "מ-" חייב להיות קטן או שווה לערך "עד"';
          }
        }
      } else if (
        rule.targetValue === undefined ||
        rule.targetValue === null ||
        normalizeTargetValue(rule.targetValue) === ""
      ) {
        ruleErrors.targetValue = REQUIRED_VALUE_MESSAGE;
      }
    }

    if (Object.keys(ruleErrors).length > 0) errors[rule.id] = ruleErrors;
  });

  return errors;
};
