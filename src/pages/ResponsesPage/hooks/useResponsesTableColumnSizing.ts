import { useCallback, useEffect, useMemo, useState } from "react";
import type { GridColDef } from "@mui/x-data-grid-pro";

// DataGrid accepts pixels. These values approximate the design's character-based
// limits using the table font size, with room for the cell's horizontal padding.
const COLUMN_CHARACTER_WIDTH = 10;
const COLUMN_HORIZONTAL_PADDING = 32;
const COLUMN_MIN_WIDTH = 8 * COLUMN_CHARACTER_WIDTH + COLUMN_HORIZONTAL_PADDING;
const COLUMN_MAX_WIDTH = 60 * COLUMN_CHARACTER_WIDTH + COLUMN_HORIZONTAL_PADDING;
const DEFAULT_SYSTEM_COLUMN_MAX_CHARACTERS = 24;

export const DEFAULT_FIELD_COLUMN_WIDTH = 190;

const clampColumnWidth = (width: number): number =>
  Math.min(COLUMN_MAX_WIDTH, Math.max(COLUMN_MIN_WIDTH, Math.round(width)));

const getColumnWidthsStorageKey = (userIdentifier: string, formId: string | number): string =>
  `responses-table-column-widths:${encodeURIComponent(userIdentifier)}:${formId}`;

const readColumnWidths = (storageKey: string | null): Record<string, number> => {
  if (!storageKey) return {};

  try {
    const value = localStorage.getItem(storageKey);
    if (!value) return {};

    const parsed = JSON.parse(value);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, width]) => typeof width === "number" && Number.isFinite(width))
        .map(([field, width]) => [field, clampColumnWidth(width as number)]),
    );
  } catch {
    return {};
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
): Pick<GridColDef, "width" | "minWidth" | "maxWidth"> => {
  if (savedWidth) {
    return {
      width: clampColumnWidth(savedWidth),
      minWidth: COLUMN_MIN_WIDTH,
      maxWidth: COLUMN_MAX_WIDTH,
    };
  }

  return {
    width: Math.min(defaultWidth, COLUMN_MAX_WIDTH),
    minWidth: COLUMN_MIN_WIDTH,
    maxWidth: COLUMN_MAX_WIDTH,
  };
};

type UseResponsesTableColumnSizingParams = {
  formId?: string | number;
  userIdentifier: string;
};

export const useResponsesTableColumnSizing = ({
  formId,
  userIdentifier,
}: UseResponsesTableColumnSizingParams) => {
  const storageKey = useMemo(
    () =>
      formId !== undefined
        ? getColumnWidthsStorageKey(userIdentifier.toLowerCase(), formId)
        : null,
    [formId, userIdentifier],
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() =>
    readColumnWidths(storageKey),
  );

  useEffect(() => {
    setColumnWidths(readColumnWidths(storageKey));
  }, [storageKey]);

  const handleColumnWidthChange = useCallback(
    (params: { colDef: GridColDef; width: number }) => {
      const width = clampColumnWidth(params.width);

      setColumnWidths((currentWidths) => {
        if (currentWidths[params.colDef.field] === width) return currentWidths;

        const nextWidths = { ...currentWidths, [params.colDef.field]: width };

        if (storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(nextWidths));
          } catch {
            // Storage can be unavailable in private/restricted browser modes.
          }
        }

        return nextWidths;
      });
    },
    [storageKey],
  );

  return { columnWidths, handleColumnWidthChange };
};
