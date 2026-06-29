import React, { useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Stack,
  Switch,
} from "@mui/material";
import { ArrowUp, ArrowDown, Info, X } from "lucide-react";
import BaseFieldInput from "../../FormFields/BaseFieldInput/BaseFieldInput";
import { ViewColumn } from "../../../types/interfaces/tableViews.types";
import { SubtitlesTypography } from "../ViewManager/styled";
import { FormFieldDto } from "../../../types/shared";
import * as Gear from "formula-gear";
import { IconOnlyButton, formInfoTooltipSlotProps } from "../../../pages/ResponsesPage/styled";

const getGearConstant = (key: string) => {
  const g = Gear as any;

  return g[key];
};

const gearComparableFieldTypes = getGearConstant("comparable" + "FieldTypes") || [
  Gear.fieldType.LongText,
  Gear.fieldType.ShortText,
  Gear.fieldType.Options,
  Gear.fieldType.Date,
  Gear.fieldType.Time,
  Gear.fieldType.Boolean,
  Gear.fieldType.Number,
];

const isSortable = (typeId?: number): boolean => {
  if (typeId === undefined) return true;

  return (gearComparableFieldTypes as number[]).includes(typeId);
};

interface ResponsesViewSettingsProps {
  formId?: number;
  formName?: string;
  columns: ViewColumn[];
  formFields?: FormFieldDto[];
  viewName: string;
  setViewName: (viewName: string) => void;
  viewNameError?: string;
  isPublic: boolean;
  isDefault: boolean;
  setIsDefault: (isDefault: boolean) => void;
  canManagePublicViews: boolean;
  canEditCurrentView: boolean;
  handleSwitchPublic: (next: boolean) => void;
  getSortedColumns: () => { columnId: string; direction: "asc" | "desc" }[];
  setSortColumn: (id: string, direction: "asc" | "desc") => void;
  clearSort: () => void;
}

enum HebrewTitles {
  VIEW_NAME = "שם התצוגה:",
  PUBLIC_VIEW = "תצוגה ציבורית",
  DEFAULT_VIEW = "תצוגת ברירת מחדל",
  SORT_BY = "מיון לפי:",
  CLEAR_SORT = "ביטול מיון",
  CHOOSE_COLUMN = "בחירת שדה",
  NO_SORTING = "ללא מיון",
  INCREASING_ORDER = "מיון בסדר עולה",
  DECREASING_ORDER = "מיון בסדר יורד",
  DECREASING_ORDER_TOOLTIP = "מיון הנתונים בסדר יורד (ת'-א')",
  INCREASING_ORDER_TOOLTIP = "מיון הנתונים בסדר עולה (א'-ת')",
  PUBLIC_VIEW_TOOLTIP = "נראית לכל המשתמשים",
  DEFAULT_VIEW_TOOLTIP = "מוחלת אוטומטית לטופס זה",
}

export function ResponsesViewSettings({
  formId,
  formName,
  columns,
  formFields = [],
  viewName,
  setViewName,
  viewNameError,
  isPublic,
  isDefault,
  setIsDefault,
  canManagePublicViews,
  canEditCurrentView,
  handleSwitchPublic,
  getSortedColumns,
  setSortColumn,
  clearSort,
}: ResponsesViewSettingsProps) {
  const VIEW_NAME_PLACEHOLDER = `תצוגה חדשה ב${formName}`;
  const sortedColumn = useMemo(() => getSortedColumns()[0], [getSortedColumns]);
  const canEdit = Boolean(formId && canEditCurrentView);

  const visibleColumns = useMemo(
    () => columns.filter((column: ViewColumn) => column.visible),
    [columns],
  );

  const getIsColumnSortable = useCallback(
    (columnId: string) => {
      const field = formFields.find((f) => String(f.id) === String(columnId));

      return isSortable(field?.fieldType);
    },
    [formFields],
  );

  return (
    <Box
      display="flex"
      flexDirection="column"
      sx={{
        width: "100%",
        alignItems: "stretch",
        gap: 2.5,
      }}>
      <Box>
        <SubtitlesTypography>
          {<span style={{ color: "rgba(222, 86, 75)" }}>✱ </span>}
          {HebrewTitles.VIEW_NAME}
        </SubtitlesTypography>

        <BaseFieldInput
          value={viewName}
          onChange={(event) => setViewName(event.target.value.slice(0, 25))}
          fullWidth
          placeholder={VIEW_NAME_PLACEHOLDER}
          disabled={!canEdit}
          inputProps={{ maxLength: 25 }}
          adornment={
            <Typography
              variant="caption"
              sx={{
                color: viewName.length === 25 ? "error.main" : "text.secondary",
                fontWeight: viewName.length === 25 ? 600 : 400,
                fontSize: "0.85rem",
                mr: -1,
              }}>
              {viewName.length}/25
            </Typography>
          }
        />

        {viewNameError && (
          <Box mt={0.5}>
            <Typography
              variant="caption"
              color="error"
              sx={{
                display: "block",
                textAlign: "right",
                direction: "rtl",
                unicodeBidi: "plaintext",
              }}>
              {viewNameError}
            </Typography>
          </Box>
        )}
      </Box>

      {canEdit && canManagePublicViews && (
        <Box display="flex" flexDirection="column" gap={0.5} mt={1}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography
                variant="subtitle1"
                noWrap
                color="text.primary"
                sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {HebrewTitles.PUBLIC_VIEW}
              </Typography>

              <Tooltip title={HebrewTitles.PUBLIC_VIEW_TOOLTIP} slotProps={formInfoTooltipSlotProps} arrow>
                <Box display="flex" sx={{ color: "#94a3b8", cursor: "help" }}>
                  <Info size={14} strokeWidth={2.4} />
                </Box>
              </Tooltip>
            </Box>

            <Switch
              checked={isPublic}
              onChange={(e) => handleSwitchPublic(e.target.checked)}
              disabled={!canManagePublicViews}
              size="small"
              sx={{ mr: -1 }}
            />
          </Box>

          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={0.5}>
              <Typography
                variant="subtitle1"
                noWrap
                color="text.primary"
                sx={{ fontWeight: 600, fontSize: "0.95rem" }}>
                {HebrewTitles.DEFAULT_VIEW}
              </Typography>

              <Tooltip title={HebrewTitles.DEFAULT_VIEW_TOOLTIP} slotProps={formInfoTooltipSlotProps} arrow>
                <Box display="flex" sx={{ color: "#94a3b8", cursor: "help" }}>
                  <Info size={14} strokeWidth={2.4} />
                </Box>
              </Tooltip>
            </Box>

            <Switch
              checked={isDefault}
              onChange={(e) => setIsDefault(e.target.checked)}
              disabled={!isPublic || !canManagePublicViews}
              size="small"
              sx={{ mr: -1 }}
            />
          </Box>
        </Box>
      )}

      <Box>
        <SubtitlesTypography>{HebrewTitles.SORT_BY}</SubtitlesTypography>

        <Box display="flex" flexDirection="column" gap={1.5}>
          <FormControl size="small" fullWidth disabled={!canEdit}>
            <InputLabel>{HebrewTitles.CHOOSE_COLUMN}</InputLabel>

            <Select
              value={sortedColumn?.columnId ?? ""}
              label={HebrewTitles.CHOOSE_COLUMN}
              onChange={(event) =>
                event.target.value ? setSortColumn(event.target.value as string, "asc") : clearSort()
              }>
              <MenuItem value="">
                <em>{HebrewTitles.NO_SORTING}</em>
              </MenuItem>

              {visibleColumns.map((column: ViewColumn) => (
                <MenuItem
                  key={column.columnId}
                  value={column.columnId}
                  disabled={!getIsColumnSortable(column.columnId)}>
                  {column.displayName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {sortedColumn && (
            <Box display="flex" gap={1.5} alignItems="center" justifyContent="space-between">
              <ToggleButtonGroup
                exclusive
                value={sortedColumn.direction}
                onChange={(_, value) => value && setSortColumn(sortedColumn.columnId, value)}
                size="small"
                disabled={!canEdit}
                sx={{
                  flex: 1,
                  display: "flex",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  overflow: "hidden",
                  "& .MuiToggleButton-root": {
                    flex: 1,
                    border: "none",
                    textTransform: "none",
                    height: 36,
                    fontWeight: 600,
                    gap: 1,
                    color: "#64748b",
                    "&.Mui-selected": {
                      backgroundColor: "#f1f5f9",
                      color: "#1e293b",
                    },
                    "&:hover": {
                      backgroundColor: "#f8fafc",
                    },
                  },
                }}>
                <Tooltip title={HebrewTitles.INCREASING_ORDER_TOOLTIP} arrow>
                  <ToggleButton value="asc">
                    <ArrowUp size={14} strokeWidth={2.4} />
                    {HebrewTitles.INCREASING_ORDER}
                  </ToggleButton>
                </Tooltip>

                <Tooltip title={HebrewTitles.DECREASING_ORDER_TOOLTIP} arrow>
                  <ToggleButton value="desc">
                    <ArrowDown size={14} strokeWidth={2.4} />
                    {HebrewTitles.DECREASING_ORDER}
                  </ToggleButton>
                </Tooltip>
              </ToggleButtonGroup>

              <Tooltip title={HebrewTitles.CLEAR_SORT} arrow>
                <IconOnlyButton
                  size="small"
                  onClick={clearSort}
                  disabled={!canEdit}
                  $hoverColor="#ef4444"
                  sx={{
                    width: 36,
                    height: 36,
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                  }}>
                  <X size={16} strokeWidth={2.4} />
                </IconOnlyButton>
              </Tooltip>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
