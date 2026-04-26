import { ResponsesView, ViewColumn } from "../types/interfaces/tableViews.types";
import { MetaColumnIds } from "./interfaces";

/**
 * Converts view configuration to grid sorting state
 * @param view - The ResponsesView object
 * @param tableColumns - Grid columns for mapping
 * @returns Sorting state array
 */
export const convertViewConfigToSorting = (
  view: ResponsesView | undefined,
  tableColumns: any[],
): any[] => {
  if (!view || (!view.sortColumnId && !view.config?.columns)) {
    return [];
  }

  // Handle new schema: sortColumnId + sortDirection
  if (view.sortColumnId) {
    const sortedColumn = view.columns?.find((col) => col.id === view.sortColumnId);
    if (sortedColumn) {
      const columnId = sortedColumn.fieldId || 
        (Object.keys(MetaColumnIds).find(key => MetaColumnIds[key as keyof typeof MetaColumnIds] === sortedColumn.metaColumnId));

      if (columnId) {
        // Find matching table column
        const matchingTableColumn = tableColumns.find(
          (col) => col.accessorKey === columnId || col.id === columnId || col.field === columnId,
        );

        if (matchingTableColumn) {
          return [
            {
              id: matchingTableColumn.id || matchingTableColumn.field,
              desc: view.sortDirection === "desc",
            },
          ];
        }
      }
    }
  }

  // Fallback to legacy config if present
  const legacyConfig = view.config?.columns;
  if (legacyConfig && legacyConfig.length > 0) {
    const primarySortColumn = legacyConfig.find(
      (col) => col.sortDirection && col.sortOrder === 1 && col.visible,
    );

    if (primarySortColumn) {
      const matchingTableColumn = tableColumns.find(
        (col) => col.accessorKey === primarySortColumn.columnId || col.field === primarySortColumn.columnId,
      );

      if (matchingTableColumn) {
        return [
          {
            id: matchingTableColumn.id || matchingTableColumn.field,
            desc: primarySortColumn.sortDirection === "desc",
          },
        ];
      }
    }
  }

  return [];
};

/**
 * Applies view-based sorting to the sorting state
 */
export const applyViewSorting = (
  setSorting: (sorting: any[]) => void,
  view: ResponsesView | undefined,
  tableColumns: any[],
) => {
  const sortingState = convertViewConfigToSorting(view, tableColumns);
  setSorting(sortingState);
};

/**
 * Gets a summary of sorting configuration
 */
export const getSortingSummary = (view: ResponsesView | undefined): string => {
  if (!view) return "ללא מיון";

  if (view.sortColumnId) {
    const sortedColumn = view.columns?.find((col) => col.id === view.sortColumnId);
    if (sortedColumn) {
      const direction = view.sortDirection === "asc" ? "עולה" : "יורד";
      const colName = sortedColumn.displayName || sortedColumn.fieldId || 
        (Object.keys(MetaColumnIds).find(key => MetaColumnIds[key as keyof typeof MetaColumnIds] === sortedColumn.metaColumnId));
      return `${colName} (${direction})`;
    }
  }

  // Legacy fallback
  const legacySort = view.config?.columns?.find((col) => col.sortDirection && col.sortOrder === 1);
  if (legacySort) {
    const direction = legacySort.sortDirection === "asc" ? "עולה" : "יורד";
    return `${legacySort.displayName || legacySort.columnId} (${direction})`;
  }

  return "ללא מיון";
};
