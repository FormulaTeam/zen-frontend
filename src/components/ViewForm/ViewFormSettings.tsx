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
} from "@mui/material";
import { ArrowUpward, ArrowDownward, Clear } from "@mui/icons-material";
import BaseFieldInput from "../FormFields/BaseFieldInput/BaseFieldInput";
import CustomSwitch from "../FormFields/CustomSwitch/CustomSwitch";
import { ViewColumn } from "../../types/interfaces/tableViews.types";

interface Props {
  formId?: number;
  columns: ViewColumn[];
  viewName: string;
  setViewName: (v: string) => void;
  isPublic: boolean;
  isDefault: boolean;
  setIsDefault: (v: boolean) => void;
  hasFullAccess: boolean;
  handleSwitchPublic: (next: boolean) => void;
  getSortedColumns: () => { columnId: string; direction: "asc" | "desc" }[];
  setSortColumn: (id: string, dir: "asc" | "desc") => void;
  clearSort: () => void;
}

const ViewFormSettings: React.FC<Props> = ({
  formId,
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
  const sortedColumn = getSortedColumns()[0];
  const canEdit = Boolean(formId && hasFullAccess);

  const visibleColumns = useMemo(() => columns.filter((c) => c.visible), [columns]);

  return (
    <Box>
      <BaseFieldInput
        label="שם התצוגה"
        value={viewName}
        onChange={(e) => setViewName(e.target.value)}
        fullWidth
        size="small"
      />

      <CustomSwitch
        value={isPublic}
        onChangeHandler={handleSwitchPublic}
        isDisabled={!canEdit}
        label="תצוגה ציבורית"
      />

      <CustomSwitch
        value={isDefault}
        onChangeHandler={setIsDefault}
        isDisabled={!canEdit || !isPublic}
        label="תצוגת ברירת מחדל"
      />

      <Typography variant="subtitle2" mt={2}>
        מיון לפי:
      </Typography>

      <Box display="flex" gap={1} mt={1}>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>בחר עמודה</InputLabel>
          <Select
            value={sortedColumn?.columnId ?? ""}
            label="בחר עמודה"
            onChange={(e) =>
              e.target.value ? setSortColumn(e.target.value as string, "asc") : clearSort()
            }>
            <MenuItem value="">
              <em>ללא מיון</em>
            </MenuItem>
            {visibleColumns.map((c) => (
              <MenuItem key={c.columnId} value={c.columnId}>
                {c.columnId}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {sortedColumn && (
          <>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={sortedColumn.direction}
              onChange={(_, v) => v && setSortColumn(sortedColumn.columnId, v)}>
              <ToggleButton value="asc">
                <ArrowUpward fontSize="small" />
              </ToggleButton>
              <ToggleButton value="desc">
                <ArrowDownward fontSize="small" />
              </ToggleButton>
            </ToggleButtonGroup>

            <IconButton size="small" onClick={clearSort} color="error">
              <Clear fontSize="small" />
            </IconButton>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ViewFormSettings;
