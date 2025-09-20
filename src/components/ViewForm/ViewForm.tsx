import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Checkbox,
  IconButton,
  List,
  ListItem,
  Divider,
  Button,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Tooltip,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import ClearIcon from "@mui/icons-material/Clear";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { TableView, ViewColumn, FormField } from "../../types/interfaces/tableViews.types";
import { useViewColumnConfiguration } from "../../hooks/useViewColumnConfiguration";
import { useViewFormLogic } from "../../hooks/useViewFormLogic";
import { useViewFieldHelpers } from "../../hooks/useViewFieldHelpers";
import { useViewPermissions } from "../../hooks/useViewPermissions";
import BaseFieldInput from "../FormFields/BaseFieldInput/BaseFieldInput";
import CustomSwitch from "../FormFields/CustomSwitch/CustomSwitch";
import {
  ColumnItem,
  DragHandle,
  ColumnInfo,
  OrderBadge,
  ViewFormHeader,
  ViewFormTitle,
  ViewFormContainer,
  ColumnsMainContainer,
  ColumnsContainer,
  ColumnsHeader,
  ColumnHeaderItem,
  ColumnListItem,
  ViewActionsContainer,
} from "../ViewManager/styled";
import { Info } from "@mui/icons-material";

interface Form {
  id: string;
  fields: FormField[];
  [key: string]: any;
}

interface User {
  upn?: string;
  email?: string;
  isSuperAdmin?: boolean;
  [key: string]: any;
}

interface ViewFormProps {
  form?: Form;
  user?: User;
  currentView?: TableView;
  permissionTypes?: number[];
  isSaving?: boolean;
  onSaveView: (view: TableView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  onCancel: () => void;
}

const ViewForm: React.FC<ViewFormProps> = ({
  form,
  user,
  currentView,
  permissionTypes = [],
  isSaving = false,
  onSaveView,
  onApplyView,
  onCancel,
}) => {
  // Column configuration hook
  const {
    columns,
    handleDragEnd,
    toggleColumnVisibility,
    createDefaultColumns,
    resetToOriginalColumns,
    setSortColumn,
    getSortedColumns,
    clearSort,
  } = useViewColumnConfiguration({
    form,
    currentView,
  });

  // Form logic hook
  const {
    viewName,
    setViewName,
    isPublic,
    isDefault,
    originalState,
    setIsDefault,
    isSaving: isSavingFromHook,
    handleApply,
    handleSaveView,
    handleSwitchPublic,
    handleCancel: formHandleCancel,
    isCreatingNew,
  } = useViewFormLogic({
    currentView,
    user,
    form,
    onSaveView,
    onApplyView,
    columns,
    createDefaultColumns,
    resetToOriginalColumns,
    isSaving,
  });

  // Determine if there are unsaved changes when editing an existing view
  const hasChanges = useMemo(() => {
    // Creating new: dirtiness determined only by having a name (handled separately)
    if (isCreatingNew) return true; // allow save (subject to name + external disabled conditions)
    if (!currentView) return false;

    // Compare primitive fields
    if (
      viewName.trim() !== originalState.viewName.trim() ||
      isPublic !== originalState.isPublic ||
      isDefault !== originalState.isDefault
    ) {
      return true;
    }

    // Normalize columns for comparison (order, visibility, sorting)
    const normalize = (cols: ViewColumn[]) =>
      [...cols]
        .sort((a, b) => a.columnId.localeCompare(b.columnId))
        .map((c) => ({
          id: c.columnId,
          v: c.visible,
          o: c.order,
          sd: c.sortDirection || null,
          so: c.sortOrder ?? null,
        }));

    const currentNormalized = normalize(columns);
    const originalNormalized = normalize(originalState.columns || []);

    if (currentNormalized.length !== originalNormalized.length) return true;

    for (let i = 0; i < currentNormalized.length; i++) {
      const a = currentNormalized[i];
      const b = originalNormalized[i];
      if (a.id !== b.id || a.v !== b.v || a.o !== b.o || a.sd !== b.sd || a.so !== b.so) {
        return true;
      }
    }
    return false; // no differences
  }, [
    isCreatingNew,
    currentView,
    viewName,
    isPublic,
    isDefault,
    originalState.viewName,
    originalState.isPublic,
    originalState.isDefault,
    originalState.columns,
    columns,
  ]);

  const handleCancel = () => {
    formHandleCancel();
    onCancel();
  };

  // Field helpers hook
  const { getFieldDisplayName, getFieldType } = useViewFieldHelpers({ form });

  // Permissions hook
  const { hasFullAccess } = useViewPermissions({
    user,
    permissionTypes,
  });

  return (
    <Box display="flex" flexDirection="column" sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
      <Box sx={{ flexShrink: 0 }}>
        <ViewFormContainer>
          <BaseFieldInput
            label="שם התצוגה"
            value={viewName}
            onChange={(e) => setViewName(e.target.value)}
            fullWidth
            size="small"
            margin="normal"
          />

          <CustomSwitch
            value={isPublic}
            onChangeHandler={handleSwitchPublic}
            isDisabled={!form?.id || !hasFullAccess}
            label="תצוגה ציבורית (נראית לכל המשתמשים)"
          />

          <CustomSwitch
            value={isDefault}
            onChangeHandler={(e) => setIsDefault(e)}
            isDisabled={!form?.id || !hasFullAccess || !isPublic}
            label="תצוגת ברירת מחדל (תוחל אוטומטית לטופס זה)"
          />
        </ViewFormContainer>

        {/* Sorting Configuration Section */}
        <Box mt={1} mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            מיון לפי:
          </Typography>

          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Box display="flex" alignItems="center" gap={1}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>בחר עמודה</InputLabel>
                <Select
                  value={getSortedColumns()[0]?.columnId || ""}
                  onChange={(e) => {
                    const columnId = e.target.value as string;
                    if (columnId) {
                      setSortColumn(columnId, "asc");
                    } else {
                      clearSort();
                    }
                  }}
                  label="בחר עמודה">
                  <MenuItem value="">
                    <em>ללא מיון</em>
                  </MenuItem>
                  {columns
                    .filter((col) => col.visible)
                    .map((column) => (
                      <MenuItem key={column.columnId} value={column.columnId}>
                        {getFieldDisplayName(column.columnId)}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              {getSortedColumns()[0] && (
                <>
                  <ToggleButtonGroup
                    value={getSortedColumns()[0]?.direction || "asc"}
                    exclusive
                    onChange={(e, value) => {
                      if (value && getSortedColumns()[0]) {
                        setSortColumn(getSortedColumns()[0].columnId, value);
                      }
                    }}
                    dir="ltr"
                    size="small">
                    <ToggleButton value="asc">
                      <Tooltip title="מיון הנתונים בסדר עולה (א-ת)">
                        <Info color="disabled" fontSize="small" />
                      </Tooltip>
                      <ArrowUpwardIcon fontSize="small" />
                      <Typography variant="caption">עולה</Typography>
                    </ToggleButton>
                    <ToggleButton value="desc">
                      <Tooltip title="מיון הנתונים בסדר יורד (ת-א)">
                        <Info color="disabled" fontSize="small" />
                      </Tooltip>
                      <ArrowDownwardIcon fontSize="small" />
                      <Typography variant="caption">יורד</Typography>
                    </ToggleButton>
                  </ToggleButtonGroup>

                  <IconButton size="small" onClick={() => clearSort()} color="error">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Divider />

        <Box mt={2} mb={2}>
          <Typography variant="subtitle2" gutterBottom>
            שדות ({columns.filter((col) => col.visible).length} יוצגו)
          </Typography>
        </Box>
      </Box>

      <ColumnsMainContainer>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="columns">
            {(provided) => (
              <ColumnsContainer
                {...provided.droppableProps}
                ref={provided.innerRef}
                sx={{ flex: 1, overflow: "auto" }}>
                {/* Headers */}
                <ColumnsHeader>
                  <ColumnHeaderItem width="60px" textAlign="center">
                    <Typography variant="caption" fontWeight="bold">
                      הצג
                    </Typography>
                  </ColumnHeaderItem>
                  <ColumnHeaderItem flex={1}>
                    <Typography variant="caption" fontWeight="bold">
                      שדה
                    </Typography>
                  </ColumnHeaderItem>
                  <ColumnHeaderItem width="60px" textAlign="center">
                    <Typography variant="caption" fontWeight="bold">
                      מקום סידור
                    </Typography>
                  </ColumnHeaderItem>
                  <ColumnHeaderItem width="30px"></ColumnHeaderItem>
                </ColumnsHeader>
                <List dense>
                  {columns.map((column, index) => (
                    <Draggable key={column.columnId} draggableId={column.columnId} index={index}>
                      {(provided, snapshot) => (
                        <ColumnListItem>
                          <ListItem ref={provided.innerRef} {...provided.draggableProps}>
                            <ColumnItem $isDragging={snapshot.isDragging}>
                              <Checkbox
                                checked={column.visible}
                                onChange={() => toggleColumnVisibility(column.columnId)}
                                size="small"
                              />
                              <ColumnInfo>
                                <Typography variant="body2">
                                  {getFieldDisplayName(column.columnId)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {getFieldType(column.columnId)}
                                </Typography>
                              </ColumnInfo>

                              <OrderBadge>{index + 1}</OrderBadge>
                              <DragHandle {...provided.dragHandleProps}>
                                <DragIndicatorIcon fontSize="small" />
                              </DragHandle>
                            </ColumnItem>
                          </ListItem>
                        </ColumnListItem>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </List>
              </ColumnsContainer>
            )}
          </Droppable>
        </DragDropContext>
      </ColumnsMainContainer>

      <ViewActionsContainer sx={{ flexShrink: 0 }}>
        <Button variant="outlined" onClick={handleCancel} disabled={isSaving}>
          ביטול
        </Button>
        <Button
          variant="outlined"
          onClick={handleApply}
          disabled={columns.length === 0 || isSaving}>
          החל
        </Button>
        <Button
          variant="contained"
          onClick={handleSaveView}
          disabled={!viewName.trim() || isSaving || !hasChanges}
          startIcon={isSaving ? <CircularProgress size={20} color="inherit" /> : null}>
          {isSaving ? "שומר..." : isCreatingNew ? "צור תצוגה" : "עדכן תצוגה"}
        </Button>
      </ViewActionsContainer>
    </Box>
  );
};

export default ViewForm;
