import { useCallback, useMemo } from "react";
import { GridSortModel } from "@mui/x-data-grid-pro";
import * as Gear from "formula-gear";

import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { FormFieldDto } from "../../../types/shared";
import { Filter, MetaColumnIds } from "../../../utils/interfaces";

type SetFilter = (update: Filter | null | ((prev: Filter | null) => Filter | null)) => void;

type UseResponsesTableSortingParams = {
  filter: Filter | null;
  setFilter: SetFilter;
  currentView?: ResponsesView;
  formFields: FormFieldDto[];
};

type ColumnPrefixes = {
  Field: string;
  Meta: string;
};

const getGearConstant = (key: string) => {
  const gear = Gear as any;

  return gear[key];
};

const getColumnPrefixes = (): ColumnPrefixes => {
  const columnPrefix = getGearConstant("column" + "Prefix") || {
    Field: "field:",
    Meta: "meta:",
  };

  return {
    Field: columnPrefix.Field,
    Meta: columnPrefix.Meta,
  };
};

const getGridFieldFromMetaName = (metaName?: string, prefixes?: ColumnPrefixes): string | undefined => {
  if (!metaName) return undefined;
  const prefix = prefixes?.Meta ?? "meta:";

  switch (metaName) {
    case "pushed_to_metro":
      return "sync";

    case "index":
    case "created_at":
    case "updated_at":
    case "created_by":
    case "updated_by":
    case "id":
      return `${prefix}${metaName}`;

    default:
      return metaName;
  }
};

const getBackendMetaNameFromGridField = (field: string): string => {
  switch (field) {
    case "sync":
      return "pushed_to_metro";

    default:
      return field;
  }
};

const getMetaNameById = (metaColumnId?: number): string | undefined => {
  if (!metaColumnId) {
    return undefined;
  }

  return Object.keys(MetaColumnIds).find(
    (key) => MetaColumnIds[key as keyof typeof MetaColumnIds] === metaColumnId,
  );
};

const getBackendSortByFromGridField = (field: string, prefixes: ColumnPrefixes): string => {
  if (field.startsWith(prefixes.Field) || field.startsWith(prefixes.Meta)) {
    return field;
  }

  return `${prefixes.Meta}${getBackendMetaNameFromGridField(field)}`;
};

const getGridFieldFromBackendSortBy = (
  sortBy: string,
  prefixes: ColumnPrefixes,
): string | undefined => {
  if (sortBy.startsWith(prefixes.Field)) {
    return sortBy;
  }

  if (sortBy.startsWith(prefixes.Meta)) {
    const metaName = sortBy.replace(prefixes.Meta, "");

    return getGridFieldFromMetaName(metaName, prefixes);
  }

  return undefined;
};

const toGridSortDirection = (value?: string | null): "asc" | "desc" => {
  return value?.toLowerCase() === "asc" ? "asc" : "desc";
};

export const useResponsesTableSorting = ({
  filter,
  setFilter,
  currentView,
  formFields,
}: UseResponsesTableSortingParams) => {
  const handleSortModelChange = useCallback(
    (newSortModel: GridSortModel) => {
      if (newSortModel.length > 0) {
        const { field, sort } = newSortModel[0];
        const prefixes = getColumnPrefixes();
        const sortBy = getBackendSortByFromGridField(field, prefixes);

        setFilter({
          ...(filter ?? {}),
          sortBy,
          orderBy: sort?.toUpperCase() as any,
          before: undefined,
          after: undefined,
          pageNumber: 1,
        });

        return;
      }

      setFilter({
        ...(filter ?? {}),
        sortBy: undefined,
        orderBy: undefined,
        before: undefined,
        after: undefined,
        pageNumber: 1,
      });
    },
    [filter, setFilter],
  );

  const sortModel = useMemo((): GridSortModel => {
    const prefixes = getColumnPrefixes();

    if (filter?.sortBy) {
      const gridField = getGridFieldFromBackendSortBy(filter.sortBy, prefixes);

      if (gridField) {
        return [
          {
            field: gridField,
            sort: toGridSortDirection(filter.orderBy),
          },
        ];
      }
    }

    if (currentView?.sortColumnId) {
      const sortedColumn = currentView.columns?.find((col) => col.id === currentView.sortColumnId);

      if (sortedColumn) {
        let gridField: string | undefined;

        if (sortedColumn.fieldId) {
          gridField = `${prefixes.Field}${sortedColumn.fieldId}`;
        } else if (sortedColumn.metaColumnId) {
          const metaName = getMetaNameById(sortedColumn.metaColumnId);

          gridField = getGridFieldFromMetaName(metaName, prefixes);
        }

        if (gridField) {
          return [
            {
              field: gridField,
              sort: toGridSortDirection(currentView.sortDirection),
            },
          ];
        }
      }
    }

    const legacySort = (currentView as any)?.config?.columns?.find(
      (col: any) => col.sortDirection && col.sortOrder === 1,
    );

    if (legacySort) {
      let gridField = legacySort.columnId;

      const fieldObj = formFields.find(
        (field) =>
          String(field.id) === String(legacySort.columnId) ||
          String((field as any).uniqueId) === String(legacySort.columnId),
      );

      if (fieldObj) {
        gridField = `${prefixes.Field}${fieldObj.id}`;
      }

      return [
        {
          field: gridField,
          sort: toGridSortDirection(legacySort.sortDirection),
        },
      ];
    }

    return [{ field: `${prefixes.Meta}index`, sort: "desc" }];
  }, [currentView, formFields, filter]);

  return {
    sortModel,
    handleSortModelChange,
  };
};
