import { useCallback, useEffect, useMemo, useState } from "react";
import {
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  type GridColDef,
  type GridPinnedColumnFields,
} from "@mui/x-data-grid-pro";

import { readPinnedColumns, writePinnedColumns } from "../utils/columnPinningCache";

const FIXED_PINNED_FIELDS = ["__check__", GRID_DETAIL_PANEL_TOGGLE_FIELD] as const;

type PinningState = {
  scope: string;
  fields: string[];
};

type UseResponsesColumnPinningParams = {
  columns: readonly GridColDef[];
  formId: string | number;
  userIdentifier?: string;
};

export const useResponsesColumnPinning = ({
  columns,
  formId,
  userIdentifier,
}: UseResponsesColumnPinningParams) => {
  const scope = `${userIdentifier?.toLowerCase() ?? ""}:${formId}`;
  const [state, setState] = useState<PinningState>(() => ({
    scope,
    fields: readPinnedColumns(userIdentifier, formId),
  }));
  const pinnedFields = state.scope === scope ? state.fields : [];

  useEffect(() => {
    setState((current) =>
      current.scope === scope
        ? current
        : { scope, fields: readPinnedColumns(userIdentifier, formId) },
    );
  }, [formId, scope, userIdentifier]);

  const orderedPinnedFields = useMemo(() => {
    const selectedFields = new Set(pinnedFields);

    return columns
      .map((column) => column.field)
      .filter(
        (field) => selectedFields.has(field) && field !== GRID_DETAIL_PANEL_TOGGLE_FIELD,
      );
  }, [columns, pinnedFields]);

  useEffect(() => {
    const isOrdered =
      orderedPinnedFields.length === pinnedFields.length &&
      orderedPinnedFields.every((field, index) => field === pinnedFields[index]);

    if (!isOrdered) {
      setState((current) =>
        current.scope === scope ? { ...current, fields: orderedPinnedFields } : current,
      );
      return;
    }

    if (state.scope === scope) {
      writePinnedColumns(userIdentifier, formId, orderedPinnedFields);
    }
  }, [formId, orderedPinnedFields, pinnedFields, scope, state.scope, userIdentifier]);

  const togglePinnedField = useCallback(
    (field: string) => {
      setState((current) => {
        const currentFields =
          current.scope === scope
            ? current.fields
            : readPinnedColumns(userIdentifier, formId);

        return {
          scope,
          fields: currentFields.includes(field)
            ? currentFields.filter((currentField) => currentField !== field)
            : [...currentFields, field],
        };
      });
    },
    [formId, scope, userIdentifier],
  );

  const pinnedColumns = useMemo<GridPinnedColumnFields>(
    () => ({ left: [...FIXED_PINNED_FIELDS, ...orderedPinnedFields] }),
    [orderedPinnedFields],
  );

  return { pinnedFields, pinnedColumns, togglePinnedField };
};
