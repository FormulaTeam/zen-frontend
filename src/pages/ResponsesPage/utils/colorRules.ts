import { comparator, fieldType } from "formula-gear";
import type { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
import { getFieldColumnKey } from "../../../api";
import {
  formatOptionLabel,
  getOptionResponseRawValue,
  type OptionResponseValue,
} from "../../../utils/optionResponseValue";

export const COLOR_RULE_PALETTE = {
  red: { label: "אדום", background: "#ffc7c7", swatch: "#ff9b9b" },
  lightRed: { label: "אדום בהיר", background: "#fde2e2", swatch: "#ffc4c4" },
  orange: { label: "כתום", background: "#ffd7a6", swatch: "#ffc47b" },
  lightOrange: { label: "כתום בהיר", background: "#ffe7c7", swatch: "#ffd49a" },
  blue: { label: "כחול", background: "#8cc8ef", swatch: "#83c3ef" },
  lightBlue: { label: "כחול בהיר", background: "#d8efff", swatch: "#a8d8f6" },
  green: { label: "ירוק", background: "#b8f4d0", swatch: "#a5edc0" },
  lightGreen: { label: "ירוק בהיר", background: "#dcf8e7", swatch: "#bbefcf" },
} as const;

export type ColorRuleMatch = {
  ruleId: string;
  color: keyof typeof COLOR_RULE_PALETTE;
};

export type ColorRuleMatchMap = Record<string, Record<string, ColorRuleMatch>>;
export const ROW_COLOR_RULE_FIELD = "__row_color_rule__";

type ColorRuleFieldExtra = {
  linkedOptionsFieldId?: string | null;
  inactiveOptionIds?: string[];
  options?: { items?: RawOptionValue[] } | RawOptionValue[];
  items?: RawOptionValue[];
  values?: RawOptionValue[];
};

type ColorRuleOptionsField = FormFieldDto & {
  options?: OptionResponseValue[];
};

type RawOptionValue =
  | string
  | OptionResponseValue
  | { id?: string | number; text?: string; value?: string; isActive?: boolean };

const normalizeOptionItem = (option: RawOptionValue): OptionResponseValue | null => {
  if (typeof option === "string") {
    return { id: option, text: formatOptionLabel(option) };
  }

  const optionId = option.id ?? ("value" in option ? option.value : undefined) ?? option.text;
  if (optionId === undefined || optionId === null) return null;

  return {
    id: String(optionId),
    text: formatOptionLabel(option.text ?? String(optionId)),
    isActive: option.isActive,
  };
};

const getRawFieldOptions = (field?: FormFieldDto): RawOptionValue[] => {
  const extra = field?.extra as ColorRuleFieldExtra | undefined;
  const extraOptions = Array.isArray(extra?.options) ? extra.options : extra?.options?.items;

  return (
    extraOptions ??
    extra?.items ??
    extra?.values ??
    (field as ColorRuleOptionsField | undefined)?.options ??
    []
  );
};

export const getColorRuleOptionItems = (
  field?: FormFieldDto,
  fields: FormFieldDto[] = [],
): OptionResponseValue[] => {
  const extra = field?.extra as ColorRuleFieldExtra | undefined;
  const linkedOptionsFieldId = extra?.linkedOptionsFieldId;
  const sourceField = linkedOptionsFieldId
    ? fields.find((candidate) => String(candidate.id) === String(linkedOptionsFieldId)) ?? field
    : field;
  const sourceExtra = sourceField?.extra as ColorRuleFieldExtra | undefined;
  const inactiveOptionIds = new Set((sourceExtra?.inactiveOptionIds ?? []).map(String));

  return getRawFieldOptions(sourceField)
    .map(normalizeOptionItem)
    .filter((option): option is OptionResponseValue => option !== null)
    .filter((option) => !inactiveOptionIds.has(option.id) && option.isActive !== false);
};

const formatColorRuleTargetValue = (
  rule: ResponsesTableColorRuleDto,
  field?: FormFieldDto,
  fields: FormFieldDto[] = [],
): string => {
  const value = rule.targetValue;
  if (value === null || value === undefined || value === "") return "";

  if (rule.fieldType === fieldType.Options) {
    return (
      getColorRuleOptionItems(field, fields).find(
        (option) => String(option.id) === String(value),
      )?.text ?? String(value)
    );
  }

  if (rule.fieldType === fieldType.Boolean) {
    return value === true || value === "true" ? "כן" : "לא";
  }

  return String(value);
};

export const getComparatorOptions = (typeId?: number) => {
  switch (typeId) {
    case fieldType.Number:
      return [
        { value: comparator.Equals, label: "שווה ל", requiresValue: true },
        { value: comparator.NotEquals, label: "שונה מ", requiresValue: true },
        { value: comparator.GreaterThan, label: "גדול מ", requiresValue: true },
        { value: comparator.LessThan, label: "קטן מ", requiresValue: true },
        { value: comparator.GreaterThanOrEqual, label: "גדול או שווה ל", requiresValue: true },
        { value: comparator.LessThanOrEqual, label: "קטן או שווה ל", requiresValue: true },
        { value: comparator.IsEmpty, label: "ריק" },
        { value: comparator.IsNotEmpty, label: "לא ריק" },
      ];
    case fieldType.Date:
    case fieldType.Time:
      return [
        { value: comparator.Equals, label: "שווה ל", requiresValue: true },
        { value: comparator.NotEquals, label: "שונה מ", requiresValue: true },
        { value: comparator.Before, label: "לפני", requiresValue: true },
        { value: comparator.After, label: "אחרי", requiresValue: true },
        { value: comparator.BeforeOrEqual, label: "לפני או שווה ל", requiresValue: true },
        { value: comparator.AfterOrEqual, label: "אחרי או שווה ל", requiresValue: true },
        { value: comparator.IsEmpty, label: "ריק" },
        { value: comparator.IsNotEmpty, label: "לא ריק" },
      ];
    case fieldType.Options:
      return [
        { value: comparator.Equals, label: "שווה ל", requiresValue: true },
        { value: comparator.NotEquals, label: "שונה מ", requiresValue: true },
        { value: comparator.Contains, label: "מכיל", requiresValue: true },
        { value: comparator.NotContains, label: "לא מכיל", requiresValue: true },
        { value: comparator.IsEmpty, label: "ריק" },
        { value: comparator.IsNotEmpty, label: "לא ריק" },
      ];
    case fieldType.Boolean:
      return [{ value: comparator.Equals, label: "שווה ל", requiresValue: true }];
    default:
      return [
        { value: comparator.Equals, label: "שווה ל", requiresValue: true },
        { value: comparator.NotEquals, label: "שונה מ", requiresValue: true },
        { value: comparator.Contains, label: "מכיל", requiresValue: true },
        { value: comparator.NotContains, label: "לא מכיל", requiresValue: true },
        { value: comparator.IsEmpty, label: "ריק" },
        { value: comparator.IsNotEmpty, label: "לא ריק" },
      ];
  }
};

export const formatColorRuleLabel = (
  rule: ResponsesTableColorRuleDto,
  field?: FormFieldDto,
  fields: FormFieldDto[] = [],
  targetValueLabel = formatColorRuleTargetValue(rule, field, fields),
): string => {
  const fieldLabel = field?.displayName ?? field?.name ?? "שדה";

  const comparatorLabel =
    getComparatorOptions(rule.fieldType).find((option) => option.value === rule.comparatorId)
      ?.label ?? "";

  return (
    [fieldLabel, comparatorLabel, targetValueLabel].filter(Boolean).join(" ").trim() || "חוק צבע"
  );
};

const isEmptyValue = (value: unknown): boolean => {
  if (value === null || value === undefined || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
};

const parseTimeToSeconds = (value: unknown): number => {
  if (typeof value !== "string") return Number.NaN;

  const [hours, minutes, seconds = "0"] = value.split(":");
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  const parsedSeconds = Number(seconds);

  if (Number.isNaN(parsedHours) || Number.isNaN(parsedMinutes) || Number.isNaN(parsedSeconds)) {
    return Number.NaN;
  }

  return parsedHours * 3600 + parsedMinutes * 60 + parsedSeconds;
};

const normalizeComparable = (value: unknown, typeId: number): string | number | boolean => {
  if (typeId === fieldType.Number) return Number(value);
  if (typeId === fieldType.Boolean)
    return value === true || value === "true" || value === 1 || value === "1";
  if (typeId === fieldType.Date) return new Date(String(value)).getTime();
  if (typeId === fieldType.Time) return parseTimeToSeconds(value);
  if (typeId === fieldType.Options) {
    const rawValue = getOptionResponseRawValue(value);
    if (Array.isArray(rawValue)) return rawValue.map(String).join(",");
    return String(rawValue ?? "")
      .trim()
      .toLowerCase();
  }
  return String(value ?? "")
    .trim()
    .toLowerCase();
};

const valueContains = (actualValue: unknown, targetValue: unknown): boolean => {
  const actualRawValue = getOptionResponseRawValue(actualValue);
  const targetRawValue = getOptionResponseRawValue(targetValue);

  if (Array.isArray(actualRawValue)) {
    return actualRawValue.map(String).includes(String(targetRawValue));
  }

  return String(actualRawValue ?? "")
    .toLowerCase()
    .includes(String(targetRawValue ?? "").toLowerCase());
};

export const doesRuleMatchValue = (
  rule: ResponsesTableColorRuleDto,
  actualValue: unknown,
): boolean => {
  try {
    if (rule.comparatorId === comparator.IsEmpty) return isEmptyValue(actualValue);
    if (rule.comparatorId === comparator.IsNotEmpty) return !isEmptyValue(actualValue);
    if (isEmptyValue(actualValue) || isEmptyValue(rule.targetValue)) return false;

    const actual = normalizeComparable(actualValue, rule.fieldType);
    const target = normalizeComparable(rule.targetValue, rule.fieldType);

    switch (rule.comparatorId) {
      case comparator.Equals:
        return actual === target;
      case comparator.NotEquals:
        return actual !== target;
      case comparator.Contains:
        return valueContains(actualValue, rule.targetValue);
      case comparator.NotContains:
        return !valueContains(actualValue, rule.targetValue);
      case comparator.GreaterThan:
      case comparator.After:
        return Number(actual) > Number(target);
      case comparator.LessThan:
      case comparator.Before:
        return Number(actual) < Number(target);
      case comparator.GreaterThanOrEqual:
      case comparator.AfterOrEqual:
        return Number(actual) >= Number(target);
      case comparator.LessThanOrEqual:
      case comparator.BeforeOrEqual:
        return Number(actual) <= Number(target);
      default:
        return false;
    }
  } catch (error) {
    console.error("Failed to evaluate response table color rule", { rule, error });
    return false;
  }
};

export const buildColorRuleMatches = (
  rows: Array<Record<string, unknown>>,
  rules: ResponsesTableColorRuleDto[] = [],
): ColorRuleMatchMap => {
  const matches: ColorRuleMatchMap = {};

  rows.forEach((row) => {
    const rowId = String(row.id ?? "");
    if (!rowId) return;

    rules
      .filter((rule) => rule.isActive)
      .sort((a, b) => a.order - b.order)
      .forEach((rule) => {
        const fieldKey = getFieldColumnKey(rule.fieldId);

        if (doesRuleMatchValue(rule, row[fieldKey])) {
          const targetKey = rule.targetType === "row" ? ROW_COLOR_RULE_FIELD : fieldKey;

          if (matches[rowId]?.[targetKey]) return;

          matches[rowId] = {
            ...(matches[rowId] ?? {}),
            [targetKey]: {
              ruleId: rule.id,
              color: rule.color,
            },
          };
        }
      });
  });

  return matches;
};

export const createEmptyColorRule = (field?: FormFieldDto): ResponsesTableColorRuleDto => ({
  id: crypto.randomUUID(),
  fieldId: field?.id ?? "",
  fieldType: field?.fieldType ?? fieldType.ShortText,
  comparatorId: getComparatorOptions(field?.fieldType)[0]?.value ?? comparator.Equals,
  targetValue: "",
  color: "lightRed",
  targetType: "cell",
  order: 0,
  isActive: true,
});
