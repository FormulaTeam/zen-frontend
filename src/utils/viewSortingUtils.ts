import { ViewColumn } from "../types/interfaces/tableViews.types";

/**
 * Converts view column configuration to Material React Table sorting state
 * @param viewConfig - Array of view columns with sorting information
 * @param tableColumns - Material React Table columns array for ID mapping
 * @returns MRT sorting state array
 */
export const convertViewConfigToSorting = (
  viewConfig: ViewColumn[],
  tableColumns: any[],
): any[] => {
  if (!viewConfig || viewConfig.length === 0) {
    console.log("convertViewConfigToSorting: No viewConfig provided");
    return [];
  }

  if (!tableColumns || tableColumns.length === 0) {
    console.log("convertViewConfigToSorting: No tableColumns provided");
    return [];
  }

  console.log("convertViewConfigToSorting: Processing columns:", viewConfig);
  console.log(
    "Available table columns:",
    tableColumns.map((col) => ({ id: col.id, accessorKey: col.accessorKey })),
  );

  // Get the primary sorted column (sortOrder = 1) - Material React Table only supports single column sorting in practice
  const primarySortColumn = viewConfig.filter((col) => {
    const hasSort = col.sortDirection && col.sortOrder === 1 && col.visible;
    console.log(
      `Column ${col.columnId}: sortDirection=${col.sortDirection}, sortOrder=${col.sortOrder}, visible=${col.visible}, hasSort=${hasSort}`,
    );
    return hasSort;
  })[0];

  if (!primarySortColumn) {
    console.log("No primary sort column found");
    return [];
  }

  console.log("Primary sort column found:", primarySortColumn);

  // Find the actual table column by matching accessorKey with columnId
  const matchingTableColumn = tableColumns.find(
    (col) => col.accessorKey === primarySortColumn.columnId,
  );

  if (!matchingTableColumn) {
    console.log(`No matching table column found for columnId: ${primarySortColumn.columnId}`);
    console.log(
      "Available accessorKeys:",
      tableColumns.map((col) => col.accessorKey),
    );
    return [];
  }

  console.log("Matching table column found:", {
    id: matchingTableColumn.id,
    accessorKey: matchingTableColumn.accessorKey,
  });

  // Convert to MRT sorting format - use the numeric id from the table column
  const result = [
    {
      id: matchingTableColumn.id,
      desc: primarySortColumn.sortDirection === "desc",
    },
  ];

  console.log("Final MRT sorting state:", result);
  return result;
};

/**
 * Applies view-based sorting to the sorting state (triggers existing Material React Table flow)
 * @param setSorting - React setter for sorting state
 * @param viewConfig - View configuration with sorting information
 * @param tableColumns - Material React Table columns array for ID mapping
 */
export const applyViewSorting = (
  setSorting: (sorting: any[]) => void,
  viewConfig: ViewColumn[],
  tableColumns: any[],
) => {
  const sortingState = convertViewConfigToSorting(viewConfig, tableColumns);
  setSorting(sortingState);
};

/**
 * Gets a summary of sorting configuration from view columns
 * @param viewConfig - View configuration
 * @returns Readable sorting summary
 */
export const getSortingSummary = (viewConfig: ViewColumn[]): string => {
  const sortedColumn = viewConfig.filter(
    (col) => col.sortDirection && col.sortOrder === 1 && col.visible,
  )[0]; // Only one column can be sorted

  if (!sortedColumn) {
    return "ללא מיון";
  }

  const direction = sortedColumn.sortDirection === "asc" ? "עולה" : "יורד";
  return `${sortedColumn.columnId} (${direction})`;
};
