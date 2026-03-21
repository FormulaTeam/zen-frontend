import { useCallback, useMemo, useState } from "react";

type ExpandableRow = {
  id: string | number;
};

interface UseRowExpansionProps {
  rows: ExpandableRow[];
  canRowExpand: (rowId: string | number) => boolean;
}

interface UseRowExpansionReturn {
  expandedRowIds: Set<string>;
  toggleRowExpanded: (rowId: string) => void;
  toggleAllExpanded: () => void;
  isRowExpanded: (rowId: string) => boolean;
  allExpanded: boolean;
}

export const useRowExpansion = ({
  rows,
  canRowExpand,
}: UseRowExpansionProps): UseRowExpansionReturn => {
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());

  const toggleRowExpanded = useCallback((rowId: string): void => {
    setExpandedRowIds((currentExpandedIds: Set<string>) => {
      const updatedExpandedIds = new Set(currentExpandedIds);

      if (updatedExpandedIds.has(rowId)) {
        updatedExpandedIds.delete(rowId);
      } else {
        updatedExpandedIds.add(rowId);
      }

      return updatedExpandedIds;
    });
  }, []);

  const toggleAllExpanded = useCallback((): void => {
    const expandableRows = rows.filter((row) => canRowExpand(row.id));

    setExpandedRowIds((currentExpandedIds) => {
      const allExpandableExpanded = expandableRows.every((row) =>
        currentExpandedIds.has(String(row.id)),
      );

      if (allExpandableExpanded) {
        return new Set();
      }

      return new Set(expandableRows.map((row) => String(row.id)));
    });
  }, [rows, canRowExpand]);

  const isRowExpanded = useCallback(
    (rowId: string): boolean => {
      return expandedRowIds.has(rowId);
    },
    [expandedRowIds],
  );

  const allExpanded = useMemo(() => {
    const expandableRows = rows.filter((row) => canRowExpand(row.id));

    if (expandableRows.length === 0) {
      return false;
    }

    return expandableRows.every((row) => expandedRowIds.has(String(row.id)));
  }, [rows, expandedRowIds, canRowExpand]);

  return {
    expandedRowIds,
    toggleRowExpanded,
    toggleAllExpanded,
    isRowExpanded,
    allExpanded,
  };
};
