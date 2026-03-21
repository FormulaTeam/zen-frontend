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
import { Box, Menu, MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import { Row } from "@utils/interfaces";
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

const VIEW_COLUMN_ID_TO_GRID_FIELD: Record<string, string> = {
  id: "id",
  pushed_to_metro: "sync",
  updated_by_name: "editedByName",
  updated: "edited",
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
  const { form, rows } = useFormStore();
  const navigate = useNavigate();

  const formFields = useMemo<FormFieldDto[]>(
    () => (form?.sections ?? []).flatMap((section) => section.fields ?? []),
    [form],
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
        navigate(`/response/create/${form.id}/${rowData.id}`);
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

    const syncColumn: GridColDef = {
      field: "sync",
      headerName: "",
      renderHeader: () => <CloudUploadIcon fontSize="large" />,
      minWidth: 150,
      editable: false,
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
    };

    const editedAtColumn: GridColDef = {
      field: "edited",
      headerName: "תאריך שינוי",
      flex: 1,
      width: 200,
      minWidth: 150,
      editable: false,
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
      ...baseFormColumns,
      syncColumn,
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
  }, [currentViewConfig, formFields]);

  const CustomFooter = (): JSX.Element => {
    return (
      <GridFooterContainer>
        <ResponsesAmountBox>
          <ResponsesAmountText variant="body2">
            {`כמות תגובות בטופס - ${rows.length}`}
          </ResponsesAmountText>
        </ResponsesAmountBox>
        <GridFooter />
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
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[15, 25, 50, 100]}
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
