import { useEffect, useState, useCallback } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { ViewColumn, FormField, ResponsesView } from "../types/interfaces/tableViews.types";

/* ------------------------------------------------------------------ */
/* System Columns                                                      */
/* ------------------------------------------------------------------ */

interface SystemViewColumn {
  columnId: string;
  displayName: string;
  defaultVisible: boolean;
}

const PRE_SYSTEM_COLUMNS: SystemViewColumn[] = [
  { columnId: "id", displayName: "מזהה", defaultVisible: true },
  { columnId: "pushed_to_metro", displayName: "סטטוס סנכרון", defaultVisible: true },
];
const POST_SYSTEM_VIEW_COLUMNS: SystemViewColumn[] = [
  { columnId: "updated_by_name", displayName: "עודכן על ידי", defaultVisible: true },
  { columnId: "updated", displayName: "עודכן בתאריך", defaultVisible: true },
];

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface UseViewColumnConfigurationProps {
  form?: { fields: FormField[] };
  currentView?: ResponsesView;
}

interface SortDescriptor {
  columnId: string;
  direction: "asc" | "desc";
}

export interface UseViewColumnConfigurationReturn {
  columns: ViewColumn[];

  toggleColumnVisibility: (columnId: string) => void;
  handleDragEnd: (result: DropResult) => void;

  setSortColumn: (columnId: string | null, direction: "asc" | "desc" | null) => void;
  getSortedColumns: () => SortDescriptor[];
  clearSort: () => void;

  createDefaultColumns: () => ViewColumn[];
  resetToOriginalColumns: (columns: ViewColumn[]) => void;
}

/* ------------------------------------------------------------------ */
/* Hook                                                                */
/* ------------------------------------------------------------------ */

export function useViewColumnConfiguration({
  form,
  currentView,
}: UseViewColumnConfigurationProps): UseViewColumnConfigurationReturn {
  const [columns, setColumns] = useState<ViewColumn[]>([]);

  /* -------------------------- Initialization ------------------------ */

  const initialize = useCallback(() => {
    if (!form?.fields) return;

    let order = 0;

    const existing = currentView?.config.columns ?? [];

    const getExisting = (id: string) => existing.find((c) => c.columnId === id);

    const buildColumn = (base: {
      columnId: string;
      displayName: string;
      defaultVisible: boolean;
    }): ViewColumn => {
      const prev = getExisting(base.columnId);
      return {
        columnId: base.columnId,
        displayName: base.displayName,
        visible: prev?.visible ?? base.defaultVisible,
        order: prev?.order ?? order++,
        sortDirection: prev?.sortDirection,
        sortOrder: prev?.sortOrder,
      };
    };

    const merged = [
      ...PRE_SYSTEM_COLUMNS.map(buildColumn),
      ...form.fields.map((f) =>
        buildColumn({
          columnId: f.uniqueId,
          displayName: f.displayName,
          defaultVisible: true,
        }),
      ),
      ...POST_SYSTEM_VIEW_COLUMNS.map(buildColumn),
    ].sort((a, b) => a.order - b.order);

    setColumns(merged);
  }, [form, currentView]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  /* --------------------------- Visibility --------------------------- */

  const toggleColumnVisibility = (columnId: string) => {
    setColumns((cols) =>
      cols.map((c) => (c.columnId === columnId ? { ...c, visible: !c.visible } : c)),
    );
  };

  /* ------------------------------ Drag ------------------------------ */

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    setColumns((cols) => {
      const reordered = [...cols];
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination?.index ?? 0, 0, moved);

      return reordered.map((c, i) => ({ ...c, order: i }));
    });
  };

  /* ------------------------------ Sorting --------------------------- */

  const setSortColumn = (columnId: string | null, direction: "asc" | "desc" | null) => {
    setColumns((cols) =>
      cols.map((c) =>
        c.columnId === columnId && direction
          ? { ...c, sortDirection: direction, sortOrder: 1 }
          : { ...c, sortDirection: undefined, sortOrder: undefined },
      ),
    );
  };

  const getSortedColumns = (): SortDescriptor[] =>
    columns
      .filter((c) => c.sortDirection)
      .map((c) => ({ columnId: c.columnId, direction: c.sortDirection! }));

  const clearSort = () => {
    setColumns((cols) =>
      cols.map((c) => ({
        ...c,
        sortDirection: undefined,
        sortOrder: undefined,
      })),
    );
  };

  /* --------------------------- Defaults ----------------------------- */

  const createDefaultColumns = (): ViewColumn[] => {
    if (!form?.fields) return [];

    let order = 0;

    return [
      ...PRE_SYSTEM_COLUMNS.map((c) => ({
        columnId: c.columnId,
        displayName: c.displayName,
        visible: c.defaultVisible,
        order: order++,
      })),
      ...form.fields.map((f) => ({
        columnId: f.uniqueId,
        displayName: f.displayName,
        visible: true,
        order: order++,
      })),
      ...POST_SYSTEM_VIEW_COLUMNS.map((c) => ({
        columnId: c.columnId,
        displayName: c.displayName,
        visible: c.defaultVisible,
        order: order++,
      })),
    ];
  };

  const resetToOriginalColumns = (cols: ViewColumn[]) => {
    setColumns(cols);
  };

  /* ----------------------------- API -------------------------------- */

  return {
    columns,
    toggleColumnVisibility,
    handleDragEnd,
    setSortColumn,
    getSortedColumns,
    clearSort,
    createDefaultColumns,
    resetToOriginalColumns,
  };
}
