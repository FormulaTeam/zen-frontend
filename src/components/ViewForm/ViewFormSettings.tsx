import React, { useMemo } from "react";
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
} from "@mui/material";
import { ArrowUpward, ArrowDownward, InfoOutline } from "@mui/icons-material";
import BaseFieldInput from "../FormFields/BaseFieldInput/BaseFieldInput";
import CustomSwitch from "../FormFields/CustomSwitch/CustomSwitch";
import { ViewColumn } from "../../types/interfaces/tableViews.types";
import { SubtitlesTypography } from "../ViewManager/styled";

interface ViewFormSettingsProps {
  formId?: number;
  formName?: string;
  columns: ViewColumn[];
  viewName: string;
  setViewName: (viewName: string) => void;
  isPublic: boolean;
  isDefault: boolean;
  setIsDefault: (isDefault: boolean) => void;
  hasFullAccess: boolean;
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
  CLEAR_SORT = "בטל מיון",
  CHOOSE_COLUMN = "בחר שדה",
  NO_SORTING = "ללא מיון",
  INCREASING_ORDER = "מיון בסדר עולה",
  DECREASING_ORDER = "מיון בסדר יורד",
  DECREASING_ORDER_TOOLTIP = "מיון הנתונים בסדר יורד (ת'-א')",
  INCREASING_ORDER_TOOLTIP = "מיון הנתונים בסדר עולה (א'-ת')",
  PUBLIC_VIEW_TOOLTIP = "נראית לכל המשתמשים",
  DEFAULT_VIEW_TOOLTIP = "מוחלת אוטומטית לטופס זה",
}

const ViewFormSettings: React.FC<ViewFormSettingsProps> = ({
  formId,
  formName,
  columns,
  viewName,
  setViewName,
  isPublic,
  isDefault,
  setIsDefault,
  hasFullAccess,
  handleSwitchPublic,
  getSortedColumns,
  setSortColumn,
  clearSort,
}) => {
  const VIEW_NAME_PLACEHOLDER = `תצוגה חדשה ב${formName}`;
  const sortedColumn = getSortedColumns()[0];
  const canEdit = Boolean(formId && hasFullAccess);

  const visibleColumns = useMemo(
    () => columns.filter((column: ViewColumn) => column.visible),
    [columns],
  );

  return (
    <Box display="flex" flexDirection="column" gap={-0.5}>
      <SubtitlesTypography>
        {<span style={{ color: "rgba(222, 86, 75)" }}>✱ </span>}
        {HebrewTitles.VIEW_NAME}
      </SubtitlesTypography>

      <BaseFieldInput
        value={viewName}
        onChange={(event) => setViewName(event.target.value)}
        fullWidth
        placeholder={VIEW_NAME_PLACEHOLDER}
      />

      {canEdit && (
        <Stack spacing={-4}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" noWrap color="text.primary">
                {HebrewTitles.PUBLIC_VIEW}
              </Typography>

              <Tooltip title={HebrewTitles.PUBLIC_VIEW_TOOLTIP}>
                <IconButton size="small">
                  <InfoOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <CustomSwitch
                label=""
                isDisabled={!hasFullAccess}
                value={isPublic}
                onChangeHandler={handleSwitchPublic}
              />
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="subtitle1" noWrap color="text.primary">
                {HebrewTitles.DEFAULT_VIEW}
              </Typography>

              <Tooltip title={HebrewTitles.DEFAULT_VIEW_TOOLTIP}>
                <IconButton size="small" disabled={!isPublic}>
                  <InfoOutline fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <CustomSwitch
                label=""
                value={isDefault}
                onChangeHandler={setIsDefault}
                isDisabled={!isPublic}
              />
            </Stack>
          </Stack>
        </Stack>
      )}

      <SubtitlesTypography mb={0.8}>{HebrewTitles.SORT_BY}</SubtitlesTypography>

      <Box display="flex" flexDirection="column" gap={1}>
        <FormControl size="small" sx={{ minWidth: 240, flexGrow: 1 }}>
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
              <MenuItem key={column.columnId} value={column.columnId}>
                {column.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {sortedColumn && (
          <Box display="flex" gap={2} alignItems="center">
            <ToggleButtonGroup
              exclusive
              value={sortedColumn.direction}
              onChange={(_, value) => value && setSortColumn(sortedColumn.columnId, value)}
              size="small"
              sx={{
                border: "none",
                "& .MuiToggleButton-root": {
                  border: "none",
                  textTransform: "none",
                  px: 1.5,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  borderRadius: 0,
                  backgroundColor: "transparent",
                },
                "& .MuiToggleButton-root.Mui-selected": {
                  backgroundColor: "rgba(0,0,0,0.2)",
                },
                "& .MuiToggleButton-root:hover": {
                  backgroundColor: "rgba(0,0,0,0.1)",
                },
              }}>
              <Tooltip title={HebrewTitles.INCREASING_ORDER_TOOLTIP} arrow>
                <ToggleButton value="asc">
                  <ArrowUpward fontSize="inherit" />
                  {HebrewTitles.INCREASING_ORDER}
                </ToggleButton>
              </Tooltip>

              <Tooltip title={HebrewTitles.DECREASING_ORDER_TOOLTIP} arrow>
                <ToggleButton value="desc">
                  <ArrowDownward fontSize="inherit" />
                  {HebrewTitles.DECREASING_ORDER}
                </ToggleButton>
              </Tooltip>
            </ToggleButtonGroup>

            <Tooltip title={HebrewTitles.CLEAR_SORT} arrow>
              <IconButton
                size="small"
                onClick={clearSort}
                sx={{
                  borderRadius: 0,
                  padding: 1,
                  "&:hover": {
                    backgroundColor: "rgba(0,0,0,0.08)",
                  },
                }}>
                ✕
              </IconButton>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ViewFormSettings;
