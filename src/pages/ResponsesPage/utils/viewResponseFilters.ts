import {
  comparator,
  ResponseFilterOperator,
  ResponseMetaFieldSchema,
} from "formula-gear";

import {
  ResponseFieldFilterDto,
  ResponseFiltersDto,
  ResponseMetaField,
} from "../../../types/shared";
import { ResponsesViewColumn } from "../../../types/interfaces/tableViews.types";
import { MetaColumnIds } from "../../../utils/interfaces";

type SerializedViewColumnFilter = {
  operator: ResponseFilterOperator;
  value?: unknown;
};

const comparatorIdToCanonicalOperator: Partial<Record<number, ResponseFilterOperator>> = {
  [comparator.Equals]: ResponseFilterOperator.Equals,
  [comparator.NotEquals]: ResponseFilterOperator.NotEquals,
  [comparator.Contains]: ResponseFilterOperator.Contains,
  [comparator.NotContains]: ResponseFilterOperator.NotContains,
  [comparator.IsEmpty]: ResponseFilterOperator.IsEmpty,
  [comparator.IsNotEmpty]: ResponseFilterOperator.IsNotEmpty,
  [comparator.Before]: ResponseFilterOperator.Before,
  [comparator.After]: ResponseFilterOperator.After,
  [comparator.GreaterThan]: ResponseFilterOperator.GreaterThan,
  [comparator.LessThan]: ResponseFilterOperator.LessThan,
  [comparator.GreaterThanOrEqual]: ResponseFilterOperator.GreaterThanOrEqual,
  [comparator.LessThanOrEqual]: ResponseFilterOperator.LessThanOrEqual,
  [comparator.BeforeOrEqual]: ResponseFilterOperator.BeforeOrEqual,
  [comparator.AfterOrEqual]: ResponseFilterOperator.AfterOrEqual,
  [comparator.Between]: ResponseFilterOperator.Between,
  [comparator.NotBetween]: ResponseFilterOperator.NotBetween,
};

const responseFilterOperatorToComparatorId: Record<ResponseFilterOperator, number> = {
  [ResponseFilterOperator.Equals]: comparator.Equals,
  [ResponseFilterOperator.NotEquals]: comparator.NotEquals,
  [ResponseFilterOperator.Contains]: comparator.Contains,
  [ResponseFilterOperator.NotContains]: comparator.NotContains,
  [ResponseFilterOperator.IsEmpty]: comparator.IsEmpty,
  [ResponseFilterOperator.IsNotEmpty]: comparator.IsNotEmpty,
  [ResponseFilterOperator.Before]: comparator.Before,
  [ResponseFilterOperator.After]: comparator.After,
  [ResponseFilterOperator.GreaterThan]: comparator.GreaterThan,
  [ResponseFilterOperator.LessThan]: comparator.LessThan,
  [ResponseFilterOperator.GreaterThanOrEqual]: comparator.GreaterThanOrEqual,
  [ResponseFilterOperator.LessThanOrEqual]: comparator.LessThanOrEqual,
  [ResponseFilterOperator.BeforeOrEqual]: comparator.BeforeOrEqual,
  [ResponseFilterOperator.AfterOrEqual]: comparator.AfterOrEqual,
  [ResponseFilterOperator.Between]: comparator.Between,
  [ResponseFilterOperator.NotBetween]: comparator.NotBetween,
  [ResponseFilterOperator.On]: comparator.Equals,
  [ResponseFilterOperator.NotOn]: comparator.NotEquals,
  [ResponseFilterOperator.ContainsAny]: comparator.Contains,
  [ResponseFilterOperator.NotContainsAny]: comparator.NotContains,
  [ResponseFilterOperator.ContainsAll]: comparator.Contains,
  [ResponseFilterOperator.NotContainsAll]: comparator.NotContains,
  [ResponseFilterOperator.IsTrue]: comparator.Equals,
  [ResponseFilterOperator.IsFalse]: comparator.NotEquals,
  [ResponseFilterOperator.HasFiles]: comparator.Equals,
  [ResponseFilterOperator.HasNoFiles]: comparator.NotEquals,
  [ResponseFilterOperator.FileNameContains]: comparator.Contains,
  [ResponseFilterOperator.FileNameNotContains]: comparator.NotContains,
  [ResponseFilterOperator.HasChildResponse]: comparator.Equals,
  [ResponseFilterOperator.HasNoChildResponse]: comparator.NotEquals,
};

const isResponseFilterOperator = (
  operator: unknown,
): operator is ResponseFilterOperator => {
  return (
    typeof operator === "string" &&
    Object.values(ResponseFilterOperator).includes(operator as ResponseFilterOperator)
  );
};

const getBooleanOperatorFromComparatorAndValue = (
  comparatorId: number | null,
  value: unknown,
): ResponseFilterOperator | null => {
  if (comparatorId === comparator.Equals && value === true) {
    return ResponseFilterOperator.IsTrue;
  }

  if (comparatorId === comparator.NotEquals && value === false) {
    return ResponseFilterOperator.IsFalse;
  }

  return null;
};

const readSerializedViewColumnFilter = (
  rawTargetValue: unknown,
  rawComparatorId: unknown,
): SerializedViewColumnFilter | null => {
  const comparatorId =
    typeof rawComparatorId === "number" && Number.isFinite(rawComparatorId)
      ? rawComparatorId
      : null;

  const fallbackOperator =
    comparatorId !== null ? comparatorIdToCanonicalOperator[comparatorId] : undefined;

  if (!rawTargetValue || typeof rawTargetValue !== "object" || Array.isArray(rawTargetValue)) {
    const booleanOperator = getBooleanOperatorFromComparatorAndValue(
      comparatorId,
      rawTargetValue,
    );

    if (booleanOperator) {
      return { operator: booleanOperator };
    }

    if (!fallbackOperator) return null;

    return rawTargetValue === undefined || rawTargetValue === null
      ? { operator: fallbackOperator }
      : { operator: fallbackOperator, value: rawTargetValue };
  }

  const payload = rawTargetValue as { operator?: unknown; value?: unknown };

  if ("operator" in payload && !isResponseFilterOperator(payload.operator)) {
    return null;
  }

  // Boolean operators are now stored as scalar target values (true/false).
  // Old boolean envelope payloads are intentionally no longer supported.
  if (
    payload.operator === ResponseFilterOperator.IsTrue ||
    payload.operator === ResponseFilterOperator.IsFalse
  ) {
    return null;
  }

  if (!isResponseFilterOperator(payload.operator)) {
    if (!fallbackOperator) return null;

    return { operator: fallbackOperator, value: rawTargetValue };
  }

  return {
    operator: payload.operator,
    value: payload.value,
  };
};

const serializeViewColumnFilter = (
  filter: ResponseFieldFilterDto,
): SerializedViewColumnFilter | unknown => {
  if (filter.operator === ResponseFilterOperator.IsTrue) {
    return true;
  }

  if (filter.operator === ResponseFilterOperator.IsFalse) {
    return false;
  }

  const comparatorId = responseFilterOperatorToComparatorId[filter.operator];
  const canonicalOperator = comparatorIdToCanonicalOperator[comparatorId];

  // Preserve explicit operator payload when semantics cannot be inferred from comparator.
  if (filter.operator !== canonicalOperator) {
    return filter.value === undefined
      ? { operator: filter.operator }
      : { operator: filter.operator, value: filter.value };
  }

  return filter.value;
};

const getMetaFieldFromMetaColumnId = (
  metaColumnId: number | null | undefined,
): ResponseMetaField | null => {
  if (!metaColumnId) return null;

  const metaField = Object.keys(MetaColumnIds).find(
    (key) => MetaColumnIds[key as keyof typeof MetaColumnIds] === metaColumnId,
  );

  return ResponseMetaFieldSchema.options.includes(metaField as ResponseMetaField)
    ? (metaField as ResponseMetaField)
    : null;
};

const getMetaColumnIdFromMetaField = (
  metaField: ResponseMetaField | undefined,
): number | null => {
  if (!metaField) return null;

  return MetaColumnIds[metaField as keyof typeof MetaColumnIds] ?? null;
};

const getColumnReferenceKey = (
  fieldId: string | null | undefined,
  metaColumnId: number | null | undefined,
): string | null => {
  if (fieldId) return `field:${fieldId}`;
  if (metaColumnId) return `meta:${metaColumnId}`;

  return null;
};

const getColumnReferenceKeyFromLegacyColumnId = (
  legacyColumnId: unknown,
): string | null => {
  if (typeof legacyColumnId !== "string" || !legacyColumnId) {
    return null;
  }

  if (legacyColumnId.startsWith("field:")) {
    const fieldId = legacyColumnId.slice("field:".length);

    return fieldId ? `field:${fieldId}` : null;
  }

  if (legacyColumnId.startsWith("meta:")) {
    const metaField = legacyColumnId.slice("meta:".length) as ResponseMetaField;
    const metaColumnId = getMetaColumnIdFromMetaField(metaField);

    return metaColumnId ? `meta:${metaColumnId}` : null;
  }

  // Legacy payloads may store raw field IDs as columnId values.
  return `field:${legacyColumnId}`;
};

const getColumnReferenceKeyFromColumn = (column: unknown): string | null => {
  if (!column || typeof column !== "object") return null;

  const candidate = column as {
    fieldId?: string | null;
    metaColumnId?: number | null;
    columnId?: unknown;
  };

  return (
    getColumnReferenceKey(candidate.fieldId, candidate.metaColumnId) ??
    getColumnReferenceKeyFromLegacyColumnId(candidate.columnId)
  );
};

export const getResponseFiltersFromViewColumns = (
  columns?: ResponsesViewColumn[],
): ResponseFiltersDto | null => {
  const items: ResponseFieldFilterDto[] = [];

  for (const column of columns ?? []) {
    const referenceKey = getColumnReferenceKeyFromColumn(column);

    if (!referenceKey || !(column as any).comparatorId) continue;

    const serializedFilter = readSerializedViewColumnFilter(
      (column as any).targetValue,
      (column as any).comparatorId,
    );

    if (!serializedFilter) continue;

    if (referenceKey.startsWith("field:")) {
      items.push({
        fieldId: referenceKey.slice("field:".length),
        operator: serializedFilter.operator,
        ...(serializedFilter.value === undefined ? {} : { value: serializedFilter.value }),
      } as ResponseFieldFilterDto);

      continue;
    }

    const metaColumnId = Number(referenceKey.slice("meta:".length));
    const metaField = Number.isFinite(metaColumnId)
      ? getMetaFieldFromMetaColumnId(metaColumnId)
      : null;

    if (!metaField) continue;

    items.push({
      metaField,
      operator: serializedFilter.operator,
      ...(serializedFilter.value === undefined ? {} : { value: serializedFilter.value }),
    } as ResponseFieldFilterDto);
  }

  return items.length > 0 ? { items } : null;
};

export const applyResponseFiltersToViewColumns = (
  columns: ResponsesViewColumn[],
  responseFilters?: ResponseFiltersDto | null,
): ResponsesViewColumn[] => {
  const filterByColumnKey = new Map<
    string,
    { comparatorId: number; targetValue: ResponsesViewColumn["targetValue"] }
  >();

  for (const filter of responseFilters?.items ?? []) {
    const metaColumnId = getMetaColumnIdFromMetaField(filter.metaField);
    const key = getColumnReferenceKey(filter.fieldId, metaColumnId);

    if (!key) continue;

    filterByColumnKey.set(key, {
      comparatorId: responseFilterOperatorToComparatorId[filter.operator],
      targetValue: serializeViewColumnFilter(filter),
    });
  }

  return columns.map((column) => {
    const { comparatorId: _comparatorId, targetValue: _targetValue, ...baseColumn } = column;
    const key = getColumnReferenceKeyFromColumn(column);
    const assignment = key ? filterByColumnKey.get(key) : undefined;

    if (!assignment) {
      return baseColumn;
    }

    return {
      ...baseColumn,
      comparatorId: assignment.comparatorId,
      targetValue: assignment.targetValue,
    };
  });
};
