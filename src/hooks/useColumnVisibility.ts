import { useMemo } from "react";
import { ViewColumn } from "../types/interfaces/tableViews.types";

interface UseColumnVisibilityProps {
  columns: any[];
  currentViewConfig?: ViewColumn[];
  defaultHiddenColumns?: string[];
}

interface UseColumnVisibilityReturn {
  columnVisibility: Record<string, boolean>;
  getColumnVisibility: () => Record<string, boolean>;
  isColumnVisible: (columnId: string) => boolean;
}

export const useColumnVisibility = ({
  columns,
  currentViewConfig,
  defaultHiddenColumns = ["platform", "taskCreator", "meetingType", "assignee"],
}: UseColumnVisibilityProps): UseColumnVisibilityReturn => {
  const getColumnVisibility = (): Record<string, boolean> => {
    const visibility: Record<string, boolean> = {};

    // Set default hidden columns
    defaultHiddenColumns.forEach((columnId) => {
      visibility[columnId] = false;
    });

    if (currentViewConfig && currentViewConfig.length > 0) {
      // Set all columns to invisible first
      columns.forEach((col) => {
        if (col.accessorKey) {
          visibility[col.accessorKey] = false;
        }
      });

      // Set visible columns according to view config
      currentViewConfig.forEach((viewCol) => {
        if (viewCol.visible) {
          visibility[viewCol.columnId] = true;
        }
      });
    } else {
      // Default visibility - show all columns except default hidden ones
      columns.forEach((col) => {
        if (col.accessorKey) {
          visibility[col.accessorKey] = !defaultHiddenColumns.includes(col.accessorKey);
        }
      });
    }

    return visibility;
  };

  const columnVisibility = useMemo(
    () => getColumnVisibility(),
    [columns, currentViewConfig, defaultHiddenColumns],
  );

  const isColumnVisible = (columnId: string): boolean => {
    return columnVisibility[columnId] ?? true;
  };

  return {
    columnVisibility,
    getColumnVisibility,
    isColumnVisible,
  };
};
