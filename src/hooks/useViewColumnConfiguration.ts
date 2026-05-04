import { useEffect, useState, useCallback, useRef } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { ViewColumn, ResponsesView } from "../types/interfaces/tableViews.types";
import { FormFieldDto } from "../types/shared";
import { MetaColumnIds } from "../utils/interfaces";

/* ------------------------------------------------------------------ */
/* System Columns                                                      */
/* ------------------------------------------------------------------ */

interface SystemViewColumn {
  columnId: string;
  displayName: string;
  defaultVisible: boolean;
}

export const PRE_SYSTEM_COLUMNS: SystemViewColumn[] = [
  { columnId: "index", displayName: "מזהה", defaultVisible: true },
];
export const POST_SYSTEM_VIEW_COLUMNS: SystemViewColumn[] = [
  { columnId: "pushed_to_metro", displayName: "סטטוס סנכרון", defaultVisible: true },
  { columnId: "created_by", displayName: "נוצר ע״י", defaultVisible: true },
  { columnId: "created_at", displayName: "תאריך יצירה", defaultVisible: true },
  { columnId: "updated_by", displayName: "השתנה ע״י", defaultVisible: true },
  { columnId: "updated_at", displayName: "תאריך שינוי", defaultVisible: true },
];

/* ------------------------------------------------------------------ */
/* Types                                                               */
/* ------------------------------------------------------------------ */

interface UseViewColumnConfigurationProps {
  form?: { fields: FormFieldDto[] };
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

  const lastInitViewId = useRef<number | string | undefined>(undefined);
  const lastInitFormFields = useRef<FormFieldDto[] | undefined>(undefined);

  /* -------------------------- Initialization ------------------------ */

  const initialize = useCallback(
    (viewToLoad?: ResponsesView) => {
      if (!form?.fields) return;

      let order = 0;

      // Handle both new schema (columns) and legacy schema (config.columns)
      const existing = viewToLoad?.columns ?? viewToLoad?.config?.columns ?? [];

      const getExisting = (id: string) => {
        // Find by fieldId, metaColumnId or legacy columnId
        return existing.find((c: any) => 
          c.fieldId === id || 
          (c.metaColumnId && MetaColumnIds[id as keyof typeof MetaColumnIds] === c.metaColumnId) || 
          c.columnId === id
        );
      };

      const buildColumn = (base: {
        columnId: string;
        displayName: string;
        defaultVisible: boolean;
      }): ViewColumn => {
        const prev = getExisting(base.columnId) as any;
        
        // Handle new schema sorting if applicable
        let sortDir = prev?.sortDirection;
        let sOrder = prev?.sortOrder;
        
        // Prioritize isSortColumn flag from new schema
        if (prev?.isSortColumn) {
          sortDir = viewToLoad?.sortDirection;
          sOrder = 1;
        } else if (viewToLoad?.sortColumnId && prev?.id === viewToLoad.sortColumnId) {
          // Fallback to engine-calculated sortColumnId
          sortDir = viewToLoad.sortDirection;
          sOrder = 1;
        }

        const visible = prev?.isVisible ?? prev?.visible ?? base.defaultVisible;

        return {
          id: prev?.id,
          columnId: base.columnId,
          displayName: base.displayName,
          visible,
          order: prev?.index ?? prev?.order ?? order++,
          sortDirection: visible ? sortDir : undefined,
          sortOrder: visible ? sOrder : undefined,
        };
      };

      const merged = [
        ...PRE_SYSTEM_COLUMNS.map(buildColumn),
        ...form.fields.map((f) =>
          buildColumn({
            columnId: f.id,
            displayName: f.displayName,
            defaultVisible: true,
          }),
        ),
        ...POST_SYSTEM_VIEW_COLUMNS.map(buildColumn),
      ].sort((a, b) => a.order - b.order);

      setColumns(merged);
    },
    [form?.fields],
  );

  useEffect(() => {
    const formFieldsChanged = form?.fields !== lastInitFormFields.current;
    const viewIdChanged = currentView?.id !== lastInitViewId.current;

    if (formFieldsChanged || viewIdChanged) {
      lastInitFormFields.current = form?.fields;
      lastInitViewId.current = currentView?.id;
      initialize(currentView);
    }
  }, [form?.fields, currentView?.id, initialize]);

  /* --------------------------- Visibility --------------------------- */

  const toggleColumnVisibility = useCallback((columnId: string) => {
    setColumns((cols) =>
      cols.map((c) => {
        if (c.columnId === columnId) {
          const nextVisible = !c.visible;

          return {
            ...c,
            visible: nextVisible,
            sortDirection: !nextVisible ? undefined : c.sortDirection,
            sortOrder: !nextVisible ? undefined : c.sortOrder,
          };
        }

        return c;
      }),
    );
  }, []);

  /* ------------------------------ Drag ------------------------------ */

  const handleDragEnd = useCallback((result: DropResult) => {
    if (!result.destination) return;

    setColumns((cols) => {
      const reordered = [...cols];
      const [moved] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination?.index ?? 0, 0, moved);

      return reordered.map((c, i) => ({ ...c, order: i }));
    });
  }, []);

  /* ------------------------------ Sorting --------------------------- */

  const setSortColumn = useCallback((columnId: string | null, direction: "asc" | "desc" | null) => {
    setColumns((cols) =>
      cols.map((c) =>
        c.columnId === columnId && direction
          ? { ...c, sortDirection: direction, sortOrder: 1 }
          : { ...c, sortDirection: undefined, sortOrder: undefined },
      ),
    );
  }, []);

  const getSortedColumns = useCallback((): SortDescriptor[] =>
    columns
      .filter((c) => c.sortDirection)
      .map((c) => ({ columnId: c.columnId, direction: c.sortDirection! })), [columns]);

  const clearSort = useCallback(() => {
    setColumns((cols) =>
      cols.map((c) => ({
        ...c,
        sortDirection: undefined,
        sortOrder: undefined,
      })),
    );
  }, []);

  /* --------------------------- Defaults ----------------------------- */

  const createDefaultColumns = useCallback((): ViewColumn[] => {
    if (!form?.fields) return [];

    let order = 0;

    return [
      ...PRE_SYSTEM_COLUMNS.map((c) => ({
        columnId: c.columnId,
        displayName: c.displayName,
        visible: c.defaultVisible,
        order: order++,
        // Explicitly default to Index DESC
        ...(c.columnId === "index" && { sortDirection: "desc" as const, sortOrder: 1 }),
      })),
      ...form.fields.map((f) => ({
        columnId: f.id,
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
  }, [form?.fields]);

  const resetToOriginalColumns = useCallback((cols: ViewColumn[]) => {
    setColumns(cols);
  }, []);

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
