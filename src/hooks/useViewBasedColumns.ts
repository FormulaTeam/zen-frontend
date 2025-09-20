import { useState, useEffect } from "react";
import { TableView, ViewColumn } from "../types/interfaces/tableViews.types";

/**
 * Custom hook to manage table column configuration based on views
 */
export const useViewBasedColumns = (originalColumns: any[], currentView?: TableView) => {
  const [configuredColumns, setConfiguredColumns] = useState(originalColumns);

  useEffect(() => {
    if (!currentView?.config?.columns || !originalColumns?.length) {
      setConfiguredColumns(originalColumns);
      return;
    }

    // Apply view configuration to columns
    const viewColumnMap = new Map(currentView.config.columns.map((col) => [col.columnId, col]));

    const updatedColumns = originalColumns
      .map((column) => {
        const viewColumn = viewColumnMap.get(column.id || column.accessorKey);
        if (!viewColumn) return column;

        return {
          ...column,
          // Hide column if not visible in view
          enableHiding: true,
          enableColumnOrdering: true,
          // Apply view settings
          ...(viewColumn.visible !== undefined && {
            columnVisibility: { [column.id || column.accessorKey]: viewColumn.visible },
          }),
        };
      })
      // Sort by view order
      .sort((a, b) => {
        const aViewCol = viewColumnMap.get(a.id || a.accessorKey);
        const bViewCol = viewColumnMap.get(b.id || b.accessorKey);

        const aOrder = aViewCol?.order ?? 999;
        const bOrder = bViewCol?.order ?? 999;

        return aOrder - bOrder;
      });

    setConfiguredColumns(updatedColumns);
  }, [originalColumns, currentView]);

  return configuredColumns;
};

/**
 * Helper function to extract view configuration from current column state
 */
export const extractViewConfigFromColumns = (
  columns: any[],
  formFields: any[],
  sorting?: any[], // Add sorting state parameter
): ViewColumn[] => {
  return formFields.map((field, index) => {
    const column = columns.find((col) => (col.id || col.accessorKey) === field.uniqueId);

    // Find the sort order from sorting state (only one column can be sorted)
    const sortIndex = sorting?.findIndex((sort) => sort.id === field.uniqueId);
    const sortOrder = sortIndex !== undefined && sortIndex >= 0 ? 1 : undefined; // Always 1 for single-column sorting

    return {
      columnId: field.uniqueId,
      visible: column?.getIsVisible?.() ?? true,
      order: column?.getIndex?.() ?? index,
      sortDirection:
        column?.getIsSorted?.() === "asc"
          ? "asc"
          : column?.getIsSorted?.() === "desc"
          ? "desc"
          : undefined,
      sortOrder: sortOrder as 1 | undefined, // Only 1 for single-column sorting
    };
  });
};
