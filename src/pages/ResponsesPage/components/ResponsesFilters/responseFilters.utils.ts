import { GridFilterItem } from "@mui/x-data-grid-pro";
import { fieldType, ResponseFilterOperator } from "formula-gear";

import { FormFieldDto, ResponseFieldFilterDto, ResponseFiltersDto } from "../../../../types/shared";
import type { FilterOptionItem } from "./responseFilterInputs";

export const FIELD_COLUMN_PREFIX = "field:";

export const NO_VALUE_FILTER_VALUE = "__NO_VALUE_FILTER__";

export const getFieldColumnKey = (fieldId: string): string => `${FIELD_COLUMN_PREFIX}${fieldId}`;

export const getFieldIdFromGridColumnField = (gridField: string | undefined): string | null => {
  if (!gridField?.startsWith(FIELD_COLUMN_PREFIX)) {
    return null;
  }

  return gridField.slice(FIELD_COLUMN_PREFIX.length);
};

export const isNoValueFilterOperator = (
  operator: ResponseFilterOperator | string | undefined,
): operator is ResponseFilterOperator => {
  return (
    operator === ResponseFilterOperator.IsEmpty ||
    operator === ResponseFilterOperator.IsNotEmpty ||
    operator === ResponseFilterOperator.IsTrue ||
    operator === ResponseFilterOperator.IsFalse ||
    operator === ResponseFilterOperator.HasFiles ||
    operator === ResponseFilterOperator.HasNoFiles ||
    operator === ResponseFilterOperator.HasChildResponse ||
    operator === ResponseFilterOperator.HasNoChildResponse
  );
};

const withUiValueForNoValueOperator = (item: GridFilterItem): GridFilterItem => {
  if (!isNoValueFilterOperator(item.operator)) {
    return item;
  }

  return {
    ...item,
    value: NO_VALUE_FILTER_VALUE,
  };
};

export const normalizeGridFilterItemsForResponseFilters = (
  items: GridFilterItem[],
): GridFilterItem[] => {
  return items.map(withUiValueForNoValueOperator);
};

export const getGridFilterModelFromResponseFilters = (
  responseFilters?: ResponseFiltersDto,
): { items: GridFilterItem[] } => {
  return {
    items:
      responseFilters?.items?.map((filter, index) => ({
        id: `${filter.fieldId}-${index}`,
        field: getFieldColumnKey(filter.fieldId),
        operator: filter.operator,
        value: isNoValueFilterOperator(filter.operator) ? NO_VALUE_FILTER_VALUE : filter.value,
      })) ?? [],
  };
};

const isRangeOperator = (operator: ResponseFilterOperator): boolean => {
  return (
    operator === ResponseFilterOperator.Between || operator === ResponseFilterOperator.NotBetween
  );
};

const hasUsableValue = (value: unknown): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string" && value.trim() === "") return false;
  if (Array.isArray(value) && value.length === 0) return false;

  return true;
};

const hasCompleteRangeValue = (value: unknown): boolean => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const range = value as { from?: unknown; to?: unknown };

  return hasUsableValue(range.from) && hasUsableValue(range.to);
};

const normalizeNumber = (value: unknown): number | undefined => {
  if (value === "" || value === undefined || value === null) return undefined;

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? undefined : numberValue;
};

const normalizeNumberRange = (value: unknown): { from: number; to: number } | undefined => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const range = value as { from?: unknown; to?: unknown };
  const from = normalizeNumber(range.from);
  const to = normalizeNumber(range.to);

  if (from === undefined || to === undefined) {
    return undefined;
  }

  return { from, to };
};

const isNumberComparisonOperator = (operator: ResponseFilterOperator): boolean => {
  return (
    operator === ResponseFilterOperator.Equals ||
    operator === ResponseFilterOperator.NotEquals ||
    operator === ResponseFilterOperator.GreaterThan ||
    operator === ResponseFilterOperator.GreaterThanOrEqual ||
    operator === ResponseFilterOperator.LessThan ||
    operator === ResponseFilterOperator.LessThanOrEqual
  );
};

const normalizeValueByField = (
  field: FormFieldDto,
  operator: ResponseFilterOperator,
  value: unknown,
): unknown => {
  if (isNoValueFilterOperator(operator)) {
    return undefined;
  }

  if (field.fieldType === fieldType.Number && isNumberComparisonOperator(operator)) {
    return normalizeNumber(value);
  }

  if (field.fieldType === fieldType.Number && isRangeOperator(operator)) {
    return normalizeNumberRange(value);
  }

  return value;
};

const shouldKeepFilter = (operator: ResponseFilterOperator, value: unknown): boolean => {
  if (isNoValueFilterOperator(operator)) {
    return value === NO_VALUE_FILTER_VALUE;
  }

  if (isRangeOperator(operator)) {
    return hasCompleteRangeValue(value);
  }

  return hasUsableValue(value);
};

export type BuildResponseFiltersResult = {
  filters: ResponseFiltersDto | null;
  hasIncompleteItems: boolean;
};

export const buildResponseFiltersFromGridFilterModel = (
  items: GridFilterItem[],
  formFields: FormFieldDto[],
): BuildResponseFiltersResult => {
  const fieldsById = new Map(formFields.map((field) => [String(field.id), field]));
  let hasIncompleteItems = false;

  const responseFilterItems: ResponseFieldFilterDto[] = items.flatMap((item) => {
    const fieldId = getFieldIdFromGridColumnField(item.field);

    if (!fieldId || !item.operator) {
      hasIncompleteItems = true;
      return [];
    }

    const field = fieldsById.get(fieldId);

    if (!field) {
      return [];
    }

    const operator = item.operator as ResponseFilterOperator;

    if (!Object.values(ResponseFilterOperator).includes(operator)) {
      return [];
    }

    if (!shouldKeepFilter(operator, item.value)) {
      hasIncompleteItems = true;
      return [];
    }

    const normalizedValue = normalizeValueByField(field, operator, item.value);

    return [
      {
        fieldId,
        operator,
        ...(isNoValueFilterOperator(operator) ? {} : { value: normalizedValue }),
      },
    ];
  });

  return {
    filters: responseFilterItems.length ? { items: responseFilterItems } : null,
    hasIncompleteItems,
  };
};

const normalizeOption = (option: unknown): FilterOptionItem | null => {
  if (typeof option === "string" || typeof option === "number") {
    return {
      value: String(option),
      label: String(option),
    };
  }

  if (!option || typeof option !== "object") {
    return null;
  }

  const optionObject = option as any;
  const id = optionObject.id ?? optionObject.value ?? optionObject.key;
  const text = optionObject.text ?? optionObject.label ?? optionObject.name ?? id;

  if (id === undefined || id === null) {
    return null;
  }

  return {
    value: String(id),
    label: String(text),
  };
};

export const getFieldOptions = (field: FormFieldDto): FilterOptionItem[] => {
  const extra = field.extra as any;

  const rawOptions = extra?.options?.items ?? extra?.options ?? extra?.items ?? extra?.values ?? [];

  if (!Array.isArray(rawOptions)) {
    return [];
  }

  return rawOptions
    .map(normalizeOption)
    .filter((option): option is FilterOptionItem => option !== null);
};
