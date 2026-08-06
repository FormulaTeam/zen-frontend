import { useCallback, useEffect, useState } from "react";
import type { GridColDef, GridColumnResizeParams } from "@mui/x-data-grid-pro";

// DataGrid accepts pixels. These values approximate the design's character-based
// limits using the table font size, with room for the cell's horizontal padding.
const COLUMN_CHARACTER_WIDTH = 10;
const COLUMN_HORIZONTAL_PADDING = 32;
const COLUMN_MIN_WIDTH = 8 * COLUMN_CHARACTER_WIDTH + COLUMN_HORIZONTAL_PADDING;
const COLUMN_MAX_WIDTH = 60 * COLUMN_CHARACTER_WIDTH + COLUMN_HORIZONTAL_PADDING;
const DEFAULT_SYSTEM_COLUMN_MAX_CHARACTERS = 24;
const STORAGE_PREFIX = "responses-table-column-widths";

export const DEFAULT_FIELD_COLUMN_WIDTH = 190;

type ColumnWidths = Record<string, number>;
type ColumnWidthProps = Pick<GridColDef, "width" | "minWidth" | "maxWidth">;

const limitColumnWidth = (width: number): number =>
  Math.min(COLUMN_MAX_WIDTH, Math.max(COLUMN_MIN_WIDTH, Math.round(width)));

const getColumnWidthsStorageKey = (userIdentifier: string, formId: string | number): string =>
  `${STORAGE_PREFIX}:${encodeURIComponent(userIdentifier.toLowerCase())}:${formId}`;

const readColumnWidths = (storageKey: string | null): ColumnWidths => {
  if (!storageKey) return {};

  try {
    const cachedValue = localStorage.getItem(storageKey);
    if (!cachedValue) return {};

    const parsed: unknown = JSON.parse(cachedValue);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.entries(parsed).reduce<ColumnWidths>((widths, [field, width]) => {
      if (typeof width === "number" && Number.isFinite(width)) {
        widths[field] = limitColumnWidth(width);
      }

      return widths;
    }, {});
  } catch {
    return {};
  }
};

const writeColumnWidths = (storageKey: string | null, widths: ColumnWidths): void => {
  if (!storageKey) return;

  try {
    localStorage.setItem(storageKey, JSON.stringify(widths));
  } catch {
    // Storage can be unavailable in private/restricted browser modes.
  }
};

export const getHugContentWidth = (values: unknown[]): number => {
  const longestValueLength = values.reduce<number>(
    (longest, value) => Math.max(longest, String(value ?? "").length),
    0,
  );
  const characterCount = Math.min(longestValueLength, DEFAULT_SYSTEM_COLUMN_MAX_CHARACTERS);

  return Math.max(
    COLUMN_MIN_WIDTH,
    characterCount * COLUMN_CHARACTER_WIDTH + COLUMN_HORIZONTAL_PADDING,
  );
};

export const getResponsiveColumnProps = (
  defaultWidth: number,
  savedWidth?: number,
): ColumnWidthProps => ({
  width: savedWidth ? limitColumnWidth(savedWidth) : Math.min(defaultWidth, COLUMN_MAX_WIDTH),
  minWidth: COLUMN_MIN_WIDTH,
  maxWidth: COLUMN_MAX_WIDTH,
});

type UseResponsesTableColumnSizingParams = {
  formId?: string | number;
  userIdentifier: string;
};

export const useResponsesTableColumnSizing = ({
  formId,
  userIdentifier,
}: UseResponsesTableColumnSizingParams) => {
  const storageKey =
    formId === undefined ? null : getColumnWidthsStorageKey(userIdentifier, formId);
  const [columnWidths, setColumnWidths] = useState<ColumnWidths>(() =>
    readColumnWidths(storageKey),
  );

  useEffect(() => {
    setColumnWidths(readColumnWidths(storageKey));
  }, [storageKey]);

  const handleColumnWidthChange = useCallback(
    ({ colDef, width: nextWidth }: GridColumnResizeParams) => {
      const width = limitColumnWidth(nextWidth);

      setColumnWidths((currentWidths) => {
        if (currentWidths[colDef.field] === width) return currentWidths;

        const nextWidths = { ...currentWidths, [colDef.field]: width };
        writeColumnWidths(storageKey, nextWidths);

        return nextWidths;
      });
    },
    [storageKey],
  );

  return { columnWidths, handleColumnWidthChange };
};
