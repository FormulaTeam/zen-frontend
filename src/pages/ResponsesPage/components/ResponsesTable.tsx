import React, { useState, useCallback, useMemo } from "react";
import {
  useGridApiRef,
  GridRowModel,
  GridCellParams,
  GridCellModesModel,
  GridCellModes,
  GridFooterContainer,
  GridFooter,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
  GridSortModel,
} from "@mui/x-data-grid-pro";
import { useFormStore } from "../stores/form.store";
import clsx from "clsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { heIL } from "@mui/x-data-grid/locales";
import ZoomCell from "@components/formInForm/ZoomCell";
import {
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
  Typography,
  Select,
} from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import { useCellEditors } from "../hooks/useCellEditors";
import { useCellDisplay } from "../hooks/useCellDisplay";
import { downloadFileFromResponse } from "@api/filesApi";
import {
  ContentContainer,
  MainContent,
  ResponsesAmountBox,
  ResponsesAmountText,
  StyledDataGrid,
  SyncStatusIconBox,
  HeaderAsterisk,
  HeaderFlex,
  CellErrorWrapper,
  CellErrorText,
  CellValueFlex,
} from "../styled";
import { useChildForms } from "../hooks/useChildForms";
import { useDetailPanel } from "../hooks/useDetailPanel";
import { useNavigate } from "react-router-dom";
import { ViewColumn } from "../../../types/interfaces/tableViews.types";
import { FormFieldDto } from "../../../types/shared";
import { FieldTypeIds } from "../../../utils/interfaces";
import * as Gear from "formula-gear";

const VIEW_COLUMN_ID_TO_GRID_FIELD: Record<string, string> = {
  id: "id",
  index: "index",
  pushed_to_metro: "sync",
  updated_by_name: "editedByName",
  updated: "edited",
  created_at: "created",
  created_by_name: "createdByName",
};

// Use bracket notation to bypass static analysis of bundlers which might have stale cache
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
  if (typeId === undefined) return true; // Meta columns are always sortable
  return (gearComparableFieldTypes as number[]).includes(typeId);
};

type Row = GridRowModel & {
  id: string | number;
  parentResponse?: string | null;
  pushed_to_metro?: string | null;
  editedByName?: string;
  edited?: string;
  [key: string]: unknown;
};

interface ResponsesTableProps {
  isInEditMode: boolean;
  localRows: Row[];
  handleProcessRowUpdate: (newRow: GridRowModel, oldRow: GridRowModel) => GridRowModel;
  onCellEditStart: () => void;
  validationErrors?: Record<number | string, Record<string, string>>;
  onCellLiveChange?: (rowId: number | string, columnName: string, value: unknown) => void;
  onRowSelectionModelChange?: (model: GridRowSelectionModel) => void;
  currentViewConfig?: ViewColumn[];
}

const SyncStatusIcon: React.FC<{ pushedToMetro?: string | null }> = ({ pushedToMetro }) => (
  <SyncStatusIconBox>
    {pushedToMetro ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
  </SyncStatusIconBox>
);

export const ResponsesTable = ({
  isInEditMode,
  localRows,
  handleProcessRowUpdate,
  onCellEditStart,
  validationErrors,
  onCellLiveChange,
  onRowSelectionModelChange,
  currentViewConfig,
}: ResponsesTableProps) => {
  const { form, rows, pageInfo, filter, setFilter } = useFormStore();
  const navigate = useNavigate();

  console.log("ResponsesTable: pageInfo from store:", pageInfo);
  console.log("ResponsesTable: isInEditMode:", isInEditMode);

  const handleNextPage = useCallback(() => {
    if (pageInfo?.hasNextPage && pageInfo.endCursor) {
      setFilter({
        ...filter,
        after: pageInfo.endCursor,
        before: undefined,
      });
    }
  }, [pageInfo, filter, setFilter]);

  const handlePreviousPage = useCallback(() => {
    if (pageInfo?.hasPreviousPage && pageInfo.startCursor) {
      setFilter({
        ...filter,
        before: pageInfo.startCursor,
        after: undefined,
      });
    }
  }, [pageInfo, filter, setFilter]);

  const formFields = useMemo<FormFieldDto[]>(
    () => (form?.sections ?? []).flatMap((section) => section.fields ?? []),
    [form],
  );

  const handleSortModelChange = useCallback(
    (newSortModel: GridSortModel) => {
      if (newSortModel.length > 0) {
        const { field, sort } = newSortModel[0];
        let sortBy: string;

        const columnPrefix = getGearConstant("column" + "Prefix") || { Field: "field:", Meta: "meta:" };
        const prefixes = {
          Field: columnPrefix.Field,
          Meta: columnPrefix.Meta,
        };

        const fieldObj = formFields.find((f) => f.displayName === field);
        if (fieldObj) {
          sortBy = `${prefixes.Field}${fieldObj.id}`;
        } else {
          // Rule 1: Unified Sorting Keys
          switch (field) {
            case "index":
              sortBy = `${prefixes.Meta}index`;
              break;
            case "created":
              sortBy = `${prefixes.Meta}created_at`;
              break;
            case "edited":
              sortBy = `${prefixes.Meta}updated_at`;
              break;
            case "createdByName":
              sortBy = `${prefixes.Meta}created_by`;
              break;
            case "editedByName":
              sortBy = `${prefixes.Meta}updated_by`;
              break;
            case "sync":
              sortBy = `${prefixes.Meta}pushed_to_metro`;
              break;
            case "id":
              sortBy = `${prefixes.Meta}id`;
              break;
            default:
              sortBy = `${prefixes.Meta}${field}`;
          }
        }

        // Rule 3: State Reset - Reset pagination cursors on sort change
        setFilter({
          ...filter,
          sortBy,
          orderBy: sort?.toUpperCase() as any,
          before: undefined,
          after: undefined,
        });
      } else {
        setFilter({
          ...filter,
          sortBy: undefined,
          orderBy: undefined,
          before: undefined,
          after: undefined,
        });
      }
    },
    [formFields, filter, setFilter],
  );

  const apiRef = useGridApiRef();
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
  const [paginationModel, setPaginationModel] = useState({ pageSize: 25, page: 0 });
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    row: Row | null;
  } | null>(null);

  const { childrenFormsData, hasFormInFormFields, getChildFormData } = useChildForms({ form });

  const { expandColumn, getDetailPanelContent, getDetailPanelHeight, detailPanelExpandedRowIds } =
    useDetailPanel({
      form,
      rows,
      hasFormInFormFields,
      childrenFormsData,
      isInEditMode,
      getChildFormData,
      currentViewConfig,
    });

  const { renderEditCell } = useCellEditors({
    apiRef,
    formFields,
    validationErrors,
    onLiveChange: onCellLiveChange,
  });

  const handleFileClick = useCallback(
    (file: File) => {
      downloadFileFromResponse(file, String(form?.id));
    },
    [form?.id],
  );

  const { formatCellValue } = useCellDisplay({
    formId: form?.id,
    onFileClick: handleFileClick,
  });

  const handleCellClick = useCallback(
    (params: GridCellParams, event: any) => {
      if (params.field === "__check__" || params.field === "expand") {
        return;
      }

      if (isInEditMode && !params.isEditable) {
        event?.preventDefault?.();
        event?.stopPropagation?.();
        if (event) {
          event.defaultMuiPrevented = true;
        }
        return;
      }

      if (!isInEditMode || !params.isEditable) {
        return;
      }

      onCellEditStart();

      setCellModesModel((prevModel: GridCellModesModel) => {
        return {
          ...prevModel,
          [params.id]: {
            ...prevModel[params.id],
            [params.field]: { mode: GridCellModes.Edit },
          },
        };
      });
    },
    [isInEditMode, onCellEditStart],
  );

  const handleCellModesModelChange = useCallback((newModel: GridCellModesModel): void => {
    setCellModesModel(newModel);
  }, []);

  const getCellClassName = useCallback(
    (params: GridCellParams): string => {
      if (!isInEditMode) {
        return "";
      }

      const hasError = !!validationErrors?.[params.id]?.[params.field];
      const editableClass = params.isEditable
        ? "MuiDataGrid-cell--editable"
        : "MuiDataGrid-cell--non-editable-in-edit-mode";

      return hasError ? `${editableClass} cell--has-error` : editableClass;
    },
    [isInEditMode, validationErrors],
  );

  const handleCellDoubleClick = useCallback(
    (params: GridCellParams, event: any) => {
      if (!isInEditMode) {
        event.defaultMuiPrevented = true;
      }
    },
    [isInEditMode],
  );

  const responsesRows: Row[] = useMemo(
    () => (Array.isArray(rows) ? (rows.filter(Boolean) as Row[]) : []),
    [rows],
  );

  const hasParentResponses: boolean = useMemo(
    () => rows.some((row: Row) => !!row?.parentResponse),
    [rows],
  );

  const navigateToCreateResponseCopy = useCallback(
    (rowData: Row): void => {
      if (rowData && form?.id) {
        navigate(`/response/create/${form.id}/${String(rowData.id)}`);
      }
    },
    [form?.id, navigate],
  );

  const handleContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const target = event.target as HTMLElement;
      const row = target.closest(".MuiDataGrid-row");
      if (!row) {
        return;
      }

      const rowId = row.getAttribute("data-id");
      if (!rowId) {
        return;
      }

      const rowData = (localRows.length > 0 ? localRows : responsesRows).find(
        (r) => String(r.id) === rowId,
      );

      if (rowData) {
        setContextMenu({
          mouseX: event.clientX - 2,
          mouseY: event.clientY - 4,
          row: rowData,
        });
      }
    },
    [localRows, responsesRows],
  );

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDuplicateResponse = useCallback(() => {
    if (contextMenu?.row) {
      navigateToCreateResponseCopy(contextMenu.row);
    }
    handleCloseContextMenu();
  }, [contextMenu, navigateToCreateResponseCopy, handleCloseContextMenu]);

  const getFormColumns = useMemo((): GridColDef[] => {
    const baseFormColumns =
      form?.columns && form.columns.length > 0
        ? form.columns
            .filter(
              (column: GridColDef | undefined) =>
                !!column && typeof column === "object" && column.field,
            )
            .map((column: GridColDef) => {
              const formField = formFields.find((field) => field.displayName === column.field);
              const isColumnId: boolean = column.field === "id";

              return {
                flex: isColumnId ? 0 : 2,
                minWidth: isColumnId ? 120 : 200,
                width: isColumnId ? 150 : 400,
                ...column,
                headerName: column?.headerName ?? column?.field ?? "",
                editable: !isColumnId,
                fieldTypeId: formField?.fieldType,
                sortable: isSortable(formField?.fieldType),
                renderEditCell,
                renderHeader: () => {
                  const header: string = column?.headerName || column?.field || "";
                  return (
                    <HeaderFlex>
                      <span>{header}</span>
                      {isInEditMode && formField?.isRequired && <HeaderAsterisk>*</HeaderAsterisk>}
                    </HeaderFlex>
                  );
                },
                renderCell: (params: GridRenderCellParams) => {
                  const rowId = params.id;
                  const cellError = validationErrors?.[rowId]?.[column.field as string];
                  let display: React.ReactNode;

                  if (isColumnId) {
                    display = params.value ?? <Box component="span" className="cell-box" />;
                  } else if (formField) {
                    const content =
                      params.value !== undefined && params.value !== null
                        ? formatCellValue(params.value, formField)
                        : null;
                    display = content ?? <Box component="span" className="cell-box" />;
                  } else {
                    display = <Box component="span" className="cell-box" />;
                  }

                  if (isInEditMode && cellError) {
                    return (
                      <CellErrorWrapper>
                        <CellErrorText>{cellError}</CellErrorText>
                        <CellValueFlex>{display}</CellValueFlex>
                      </CellErrorWrapper>
                    );
                  }

                  return display;
                },
              };
            })
        : [];

    const indexColumn: GridColDef = {
      field: "index",
      headerName: "מזהה",
      width: 100,
      minWidth: 80,
      editable: false,
      sortable: true,
    };

    const createdByColumn: GridColDef = {
      field: "createdByName",
      headerName: "נוצר ע״י",
      flex: 1,
      width: 200,
      minWidth: 150,
      editable: false,
      sortable: true,
    };

    const createdAtColumn: GridColDef = {
      field: "created",
      headerName: "תאריך יצירה",
      flex: 1,
      width: 200,
      minWidth: 150,
      editable: false,
      sortable: true,
    };

    const syncColumn: GridColDef = {
      field: "sync",
      headerName: "",
      renderHeader: () => <CloudUploadIcon fontSize="large" />,
      minWidth: 150,
      editable: false,
      sortable: true,
      align: "center" as const,
      headerAlign: "center" as const,
      renderCell: (params: GridRenderCellParams) => (
        <SyncStatusIcon pushedToMetro={params.row?.pushed_to_metro} />
      ),
    };

    const editedByColumn: GridColDef = {
      field: "editedByName",
      headerName: "השתנה ע״י",
      flex: 1,
      width: 200,
      minWidth: 150,
      editable: false,
      sortable: true,
    };

    const editedAtColumn: GridColDef = {
      field: "edited",
      headerName: "תאריך שינוי",
      flex: 1,
      width: 200,
      minWidth: 150,
      editable: false,
      sortable: true,
    };

    const parentResponseColumns = hasParentResponses
      ? [
          {
            field: "parentResponse",
            headerName: "תגובת אב",
            flex: 1,
            editable: false,
            renderCell: ({ row }: { row: Row }) => <ZoomCell row={row} form={form} />,
          },
        ]
      : [];

    const allColumns: GridColDef[] = [
      ...(expandColumn ? [expandColumn] : []),
      ...(hasFormInFormFields
        ? [
            {
              ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
              field: GRID_DETAIL_PANEL_TOGGLE_FIELD,
              renderHeader: (params: any) => <div aria-label={params?.colDef?.headerName ?? ""} />,
            },
          ]
        : []),
      indexColumn,
      ...baseFormColumns,
      syncColumn,
      createdByColumn,
      createdAtColumn,
      editedByColumn,
      editedAtColumn,
      ...parentResponseColumns,
    ];

    if (!currentViewConfig || currentViewConfig.length === 0) {
      return allColumns;
    }

    const structuralFieldNames = new Set([GRID_DETAIL_PANEL_TOGGLE_FIELD, "expand"]);
    const structuralColumns = allColumns.filter((col) => structuralFieldNames.has(col.field));
    const dataColumns = allColumns.filter((col) => !structuralFieldNames.has(col.field));

    const gridFieldToColDef = new Map<string, GridColDef>(
      dataColumns.map((col) => [col.field, col]),
    );

    const fieldIdToGridField = new Map<string, string>(
      formFields.map((field) => [field.id, field.displayName ?? field.name ?? ""]),
    );

    const resolveViewColumnIdToGridField = (columnId: string): string | undefined => {
      if (VIEW_COLUMN_ID_TO_GRID_FIELD[columnId] !== undefined) {
        return VIEW_COLUMN_ID_TO_GRID_FIELD[columnId];
      }
      return fieldIdToGridField.get(columnId);
    };

    const orderedVisibleColumns = currentViewConfig
      .filter((viewColumn) => viewColumn.visible)
      .sort((a, b) => a.order - b.order)
      .map((viewColumn) => {
        const resolvedField = resolveViewColumnIdToGridField(viewColumn.columnId);
        return resolvedField !== undefined ? gridFieldToColDef.get(resolvedField) : undefined;
      })
      .filter((col): col is GridColDef => col !== undefined);

    return [...structuralColumns, ...orderedVisibleColumns];
  }, [
    form,
    formFields,
    hasParentResponses,
    expandColumn,
    hasFormInFormFields,
    isInEditMode,
    validationErrors,
    renderEditCell,
    formatCellValue,
    currentViewConfig,
  ]);

  const sortModel = useMemo((): GridSortModel => {
    const columnPrefix = getGearConstant("column" + "Prefix") || { Field: "field:", Meta: "meta:" };
    const prefixes = {
      Field: columnPrefix.Field,
      Meta: columnPrefix.Meta,
    };

    if (filter?.sortBy) {
      let gridField: string | undefined;
      if (filter.sortBy.startsWith(prefixes.Field)) {
        const fieldId = filter.sortBy.replace(prefixes.Field, "");
        gridField = formFields.find((f) => f.id === fieldId)?.displayName;
      } else if (filter.sortBy.startsWith(prefixes.Meta)) {
        const metaName = filter.sortBy.replace(prefixes.Meta, "");
        switch (metaName) {
          case "index":
            gridField = "index";
            break;
          case "created_at":
            gridField = "created";
            break;
          case "updated_at":
            gridField = "edited";
            break;
          case "created_by":
            gridField = "createdByName";
            break;
          case "updated_by":
            gridField = "editedByName";
            break;
          case "pushed_to_metro":
            gridField = "sync";
            break;
          case "id":
            gridField = "id";
            break;
          default:
            gridField = metaName;
        }
      }

      if (gridField) {
        return [{ field: gridField, sort: filter.orderBy?.toLowerCase() as "asc" | "desc" }];
      }
    }

    if (!currentViewConfig) {
      return [];
    }

    const fieldIdToGridField = new Map<string, string>(
      formFields.map((field) => [field.id, field.displayName ?? field.name ?? ""]),
    );

    const sorted = currentViewConfig
      .filter((viewColumn) => viewColumn.sortDirection && viewColumn.visible)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    return sorted.map((viewColumn) => {
      const gridField =
        VIEW_COLUMN_ID_TO_GRID_FIELD[viewColumn.columnId] ??
        fieldIdToGridField.get(viewColumn.columnId) ??
        viewColumn.columnId;

      return { field: gridField, sort: viewColumn.sortDirection as "asc" | "desc" };
    });
  }, [currentViewConfig, formFields, filter]);

  const handlePageSizeChange = useCallback(
    (event: any) => {
      const newSize = Number(event.target.value);
      setFilter({
        ...filter,
        pageSize: newSize,
        before: undefined,
        after: undefined,
      });
    },
    [filter, setFilter],
  );

  const CustomFooter = (): JSX.Element => {
    return (
      <GridFooterContainer>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 2, mr: 2 }}>
          <Typography variant="body2">הצג</Typography>
          <Select
            value={filter?.pageSize ?? 25}
            onChange={handlePageSizeChange}
            size="small"
            variant="standard"
            sx={{ minWidth: 40, fontSize: "0.875rem", textAlign: "center" }}
            disabled={isInEditMode}>
            {[10, 25, 50, 100].map((size) => (
              <MenuItem key={size} value={size}>
                {size}
              </MenuItem>
            ))}
          </Select>
          <Typography variant="body2">{`תגובות בעמוד מתוך סך הכל ${form?.responsesCount ?? 0} תגובות`}</Typography>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mr: 2 }}>
          <IconButton
            onClick={handlePreviousPage}
            disabled={!pageInfo?.hasPreviousPage || isInEditMode}
            size="small">
            <NavigateNextIcon />
          </IconButton>
          <Typography variant="body2">דף הבא / הקודם</Typography>
          <IconButton
            onClick={handleNextPage}
            disabled={!pageInfo?.hasNextPage || isInEditMode}
            size="small">
            <NavigateBeforeIcon />
          </IconButton>
        </Stack>
      </GridFooterContainer>
    );
  };

  return (
    <ContentContainer>
      <MainContent>
        <StyledDataGrid
          apiRef={apiRef}
          className={clsx({ "MuiDataGrid-root--edit-mode": isInEditMode })}
          disableColumnMenu={isInEditMode}
          disableColumnSorting={isInEditMode}
          disableColumnResize={isInEditMode}
          sortingMode="server"
          onSortModelChange={handleSortModelChange}
          editMode="cell"
          cellModesModel={cellModesModel}
          onCellModesModelChange={handleCellModesModelChange}
          onCellClick={handleCellClick}
          onCellDoubleClick={handleCellDoubleClick}
          processRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={(error) => {
            console.error("Error updating row:", error);
          }}
          getCellClassName={getCellClassName}
          density="comfortable"
          rowHeight={isInEditMode ? 140 : 65}
          loading={!rows}
          checkboxSelection
          disableRowSelectionOnClick
          onRowSelectionModelChange={onRowSelectionModelChange}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0
              ? "MuiDataGrid-row--even"
              : "MuiDataGrid-row--odd"
          }
          getRowId={(row) => row?.id}
          localeText={{
            ...heIL.components.MuiDataGrid.defaultProps.localeText,
            columnMenuLabel: "פעולות",
          }}
          columns={getFormColumns}
          sortModel={sortModel}
          rows={localRows}
          slots={{
            footer: CustomFooter,
          }}
          {...(hasFormInFormFields && {
            getDetailPanelContent,
            getDetailPanelHeight,
            detailPanelExpandedRowIds,
          })}
          slotProps={{
            row: {
              onContextMenu: handleContextMenu,
              style: { cursor: "context-menu" },
            },
          }}
        />
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
          }>
          <MenuItem onClick={handleDuplicateResponse}>
            <ListItemIcon>
              <ContentCopyIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>שכפול תגובה</ListItemText>
          </MenuItem>
        </Menu>
      </MainContent>
    </ContentContainer>
  );
};
