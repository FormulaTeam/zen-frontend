import { useState, useEffect } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { ViewColumn, FormField, TableView } from "../types/interfaces/tableViews.types";

// System (default) columns separated into those shown before dynamic fields and after them.
// This gives predictable default ordering while still letting a view override ordering.
const PRE_SYSTEM_VIEW_COLUMNS: { columnId: string; defaultVisible: boolean }[] = [
  { columnId: "id", defaultVisible: true },
  { columnId: "pushed_to_metro", defaultVisible: true },
];
const POST_SYSTEM_VIEW_COLUMNS: { columnId: string; defaultVisible: boolean }[] = [
  { columnId: "updated_by_name", defaultVisible: true },
  { columnId: "updated", defaultVisible: true },
];

interface UseViewColumnConfigurationProps {
  form?: {
    fields: FormField[];
  };
  currentView?: TableView;
}

interface UseViewColumnConfigurationReturn {
  columns: ViewColumn[];
  setColumns: (columns: ViewColumn[]) => void;
  handleDragEnd: (result: DropResult) => void;
  toggleColumnVisibility: (columnId: string) => void;
  initializeColumns: () => void;
  createDefaultColumns: () => ViewColumn[];
  resetToOriginalColumns: (originalColumns: ViewColumn[]) => void;
  // Sorting functions (simplified for single column sorting)
  setSortColumn: (columnId: string | null, direction: "asc" | "desc" | null) => void;
  getSortedColumns: () => { columnId: string; direction: "asc" | "desc" }[];
  clearSort: () => void;
}

export const useViewColumnConfiguration = ({
  form,
  currentView,
}: UseViewColumnConfigurationProps): UseViewColumnConfigurationReturn => {
  const [columns, setColumns] = useState<ViewColumn[]>([]);

  // Initialize columns from form fields and current view
  useEffect(() => {
    if (form?.fields) {
      initializeColumns();
    }
  }, [form, currentView]);

  const initializeColumns = () => {
    if (!form?.fields) return;

    const getExistingConfig = (columnId: string) =>
      currentView?.config.columns.find((col) => col.columnId === columnId);

    // Pre-system columns first
    const preSystemCols: ViewColumn[] = PRE_SYSTEM_VIEW_COLUMNS.map((sysCol, idx) => {
      const existing = getExistingConfig(sysCol.columnId);
      return {
        columnId: sysCol.columnId,
        visible: existing?.visible ?? sysCol.defaultVisible,
        order: existing?.order ?? idx,
        sortDirection: existing?.sortDirection,
        sortOrder: existing?.sortOrder,
      };
    });

    // Dynamic fields next
    const fieldColumns: ViewColumn[] = form.fields.map((field: FormField, index: number) => {
      const existing = getExistingConfig(field.uniqueId);
      return {
        columnId: field.uniqueId,
        visible: existing?.visible ?? true,
        order: existing?.order ?? preSystemCols.length + index,
        sortDirection: existing?.sortDirection,
        sortOrder: existing?.sortOrder,
      };
    });

    // Post-system columns last
    const postStart = preSystemCols.length + fieldColumns.length;
    const postSystemCols: ViewColumn[] = POST_SYSTEM_VIEW_COLUMNS.map((sysCol, idx) => {
      const existing = getExistingConfig(sysCol.columnId);
      return {
        columnId: sysCol.columnId,
        visible: existing?.visible ?? sysCol.defaultVisible,
        order: existing?.order ?? postStart + idx,
        sortDirection: existing?.sortDirection,
        sortOrder: existing?.sortOrder,
      };
    });

    // Merge & dedupe (in case a future backend adds some of these columns)
    const map = new Map<string, ViewColumn>();
    [...preSystemCols, ...fieldColumns, ...postSystemCols].forEach((c) => map.set(c.columnId, c));
    const merged = Array.from(map.values()).sort((a, b) => a.order - b.order);
    setColumns(merged);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newColumns = Array.from(columns);
    const [reorderedItem] = newColumns.splice(result.source.index, 1);
    newColumns.splice(result.destination.index, 0, reorderedItem);

    // Update order values
    const updatedColumns = newColumns.map((col, index) => ({
      ...col,
      order: index,
    }));

    setColumns(updatedColumns);
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(
      columns.map((col) => (col.columnId === columnId ? { ...col, visible: !col.visible } : col)),
    );
  };

  const createDefaultColumns = (): ViewColumn[] => {
    if (!form?.fields) return [];

    const pre = PRE_SYSTEM_VIEW_COLUMNS.map((sysCol, idx) => ({
      columnId: sysCol.columnId,
      visible: sysCol.defaultVisible,
      order: idx,
    }));

    const fields = form.fields.map((field: FormField, index: number) => ({
      columnId: field.uniqueId,
      visible: true,
      order: pre.length + index,
    }));

    const post = POST_SYSTEM_VIEW_COLUMNS.map((sysCol, idx) => ({
      columnId: sysCol.columnId,
      visible: sysCol.defaultVisible,
      order: pre.length + fields.length + idx,
    }));

    return [...pre, ...fields, ...post];
  };

  const resetToOriginalColumns = (originalColumns: ViewColumn[]) => {
    setColumns(originalColumns);
  };

  // Sorting functions
  const setSortColumn = (columnId: string | null, direction: "asc" | "desc" | null) => {
    setColumns((currentColumns) => {
      const updatedColumns = currentColumns.map((col) => {
        if (columnId && col.columnId === columnId) {
          // Set sort for this column
          return {
            ...col,
            sortDirection: direction || undefined,
            sortOrder: direction ? 1 : undefined, // Always use sortOrder: 1 for single column sorting
          };
        } else {
          // Clear any existing sorting from other columns (only one column can be sorted)
          return {
            ...col,
            sortDirection: undefined,
            sortOrder: undefined,
          };
        }
      });

      return updatedColumns;
    });
  };

  const getSortedColumnsFromArray = (columnsArray: ViewColumn[]) => {
    return columnsArray
      .filter((col) => col.sortDirection && col.sortOrder === 1) // Only one column can be sorted
      .map((col) => ({
        columnId: col.columnId,
        direction: col.sortDirection as "asc" | "desc",
      }))
      .slice(0, 1); // Limit to 1 sorted column
  };

  const getSortedColumns = () => {
    return getSortedColumnsFromArray(columns);
  };

  const clearSort = () => {
    setColumns((currentColumns) => {
      // Clear all sorting
      return currentColumns.map((col) => ({
        ...col,
        sortDirection: undefined,
        sortOrder: undefined,
      }));
    });
  };

  return {
    columns,
    setColumns,
    handleDragEnd,
    toggleColumnVisibility,
    initializeColumns,
    createDefaultColumns,
    resetToOriginalColumns,
    setSortColumn,
    getSortedColumns,
    clearSort,
  };
};
