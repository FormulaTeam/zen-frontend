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
import { FormField, Row } from "@utils/interfaces";
import { useCellEditors } from "../hooks/useCellEditors";
import { useCellDisplay } from "../hooks/useCellDisplay";
import { downloadFileFromResponse } from "@api/filesApi";
import { ContentContainer, MainContent, ResponsesAmountBox, ResponsesAmountText, StyledDataGrid, SyncStatusIconBox, HeaderAsterisk, HeaderFlex, CellErrorWrapper, CellErrorText, CellValueFlex } from "../styled";
import { useChildForms } from "../hooks/useChildForms";
import { useDetailPanel } from "../hooks/useDetailPanel";
import { useNavigate } from "react-router-dom";

interface ResponsesTableProps {
  isInEditMode: boolean;
  localRows: Row[];
  handleProcessRowUpdate: (newRow: GridRowModel, oldRow: GridRowModel) => GridRowModel;
  onCellEditStart: () => void;
  validationErrors?: Record<number, Record<string, string>>;
  onCellLiveChange?: (rowId: number | string, columnName: string, value: unknown) => void;
}

export const ResponsesTable = ({
  isInEditMode,
  localRows,
  handleProcessRowUpdate,
  onCellEditStart,
  validationErrors,
  onCellLiveChange,
}: ResponsesTableProps) => {
  const { form, rows } = useFormStore();
  const navigate = useNavigate();

  const apiRef = useGridApiRef();
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
  const [paginationModel, setPaginationModel] = useState({ pageSize: 25, page: 0 });
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
    row: Row | null;
  } | null>(null);

  const {
    childrenFormsData,
    hasFormInFormFields,
    getChildFormData,
  } = useChildForms({ form });

  const {
    expandColumn,
    getDetailPanelContent,
    getDetailPanelHeight,
    detailPanelExpandedRowIds,
  } = useDetailPanel({
    form,
    rows,
    hasFormInFormFields,
    childrenFormsData,
    isInEditMode,
    getChildFormData,
  });

  const { renderEditCell } = useCellEditors({
    apiRef,
    formFields: form?.fields,
    validationErrors,
    onLiveChange: onCellLiveChange,
  });

  const handleFileClick = useCallback((file: File) => {
    downloadFileFromResponse(file, String(form?.id));
  }, [form?.id]);

  const { formatCellValue } = useCellDisplay({
    formId: form?.id,
    onFileClick: handleFileClick,
  });

  const handleCellClick = useCallback((params: GridCellParams, event: any) => {
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
          [params.field]: { mode: GridCellModes.Edit }
        }
      };
    });
  }, [isInEditMode, onCellEditStart]);

  const handleCellModesModelChange = useCallback((newModel: GridCellModesModel): void => {
    setCellModesModel(newModel);
  }, []);

  const getCellClassName = useCallback(
    (params: GridCellParams): string => {
      if (!isInEditMode) {
        return "";
      }

      return params.isEditable
        ? "MuiDataGrid-cell--editable"
        : "MuiDataGrid-cell--non-editable-in-edit-mode";
    },
    [isInEditMode],
  );

  const handleCellDoubleClick = useCallback((params: GridCellParams, event: any) => {
    if (!isInEditMode) {
      event.defaultMuiPrevented = true;
    }
  }, [isInEditMode]);

  const responsesRows: Row[] = useMemo(
    () => (Array.isArray(rows) ? (rows.filter(Boolean) as Row[]) : []),
    [rows]
  );

  const hasParentResponses: boolean = useMemo(
    () => rows.some((row: Row) => !!(row?.parentResponse)),
    [rows]
  );

  const SyncStatusIcon: React.FC<{ pushedToMetro?: string | null }> = ({ pushedToMetro }) => (
    <SyncStatusIconBox>
      {pushedToMetro ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
    </SyncStatusIconBox>
  );

  const copyResponse = (rowData: Row): void => {
    if (rowData && form?.id) {
      navigate(`/response/create/${form.id}/${rowData.id}`);
    }
  };

  const handleContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    const target = event.target as HTMLElement;
    const row = target.closest('.MuiDataGrid-row');
    if (!row) {
      return;
    }

    const rowId = row.getAttribute('data-id');
    if (!rowId) {
      return;
    }

    const rowData = (isInEditMode && localRows.length > 0 ? localRows : responsesRows).find(
      (r) => String(r.id) === rowId
    );

    if (rowData) {
      setContextMenu({
        mouseX: event.clientX - 2,
        mouseY: event.clientY - 4,
        row: rowData,
      });
    }
  }, [isInEditMode, localRows, responsesRows]);

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const handleDuplicateResponse = useCallback(() => {
    if (contextMenu?.row) {
      copyResponse(contextMenu.row);
    }
    handleCloseContextMenu();
  }, [contextMenu, copyResponse, handleCloseContextMenu]);

  const getFormColumns = (): GridColDef[] => {
    const baseFormColumns = (form?.columns && form.columns?.length > 0)
      ? form.columns
        .filter((column: GridColDef | undefined) => !!column && typeof column === 'object' && column.field)
        .map((column: GridColDef) => {
          const formField: FormField | undefined = form?.fields?.find((field) => field.displayName === column.field);
          const isColumnId: boolean = column.field === "id";
          return {
            flex: isColumnId ? 0 : 2,
            minWidth: isColumnId ? 120 : 200,
            width: isColumnId ? 150 : 400,
            ...column,
            headerName: column?.headerName ?? column?.field ?? "",
            editable: !isColumnId,
            fieldTypeId: formField?.typeId,
            renderEditCell: renderEditCell,
            renderHeader: () => {
              const header: string = column?.headerName || column?.field || "";
              return (
                <HeaderFlex>
                  <span>{header}</span>
                  {isInEditMode && formField?.required && (
                    <HeaderAsterisk>*</HeaderAsterisk>
                  )}
                </HeaderFlex>
              );
            },
            renderCell: (params: GridRenderCellParams) => {
              const rowId = Number(params.id);
              const cellError = validationErrors?.[rowId]?.[column.field as string];
              let display: React.ReactNode;
              if (isColumnId) {
                display = params.value ?? <Box component="span" className="cell-box"></Box>;
              } else if (formField) {
                const content = (params.value !== undefined && params.value !== null)
                  ? formatCellValue(params.value, formField)
                  : null;
                display = content ?? <Box component="span" className="cell-box"></Box>;
              } else {
                display = <Box component="span" className="cell-box"></Box>;
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

    return [
      ...(expandColumn ? [expandColumn] : []),
      ...baseFormColumns,
      syncColumn,
      editedByColumn,
      editedAtColumn,
      ...parentResponseColumns,
    ];
  };

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
          className={clsx({ 'MuiDataGrid-root--edit-mode': isInEditMode })}
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
          getRowClassName={(params) => params.indexRelativeToCurrentPage % 2 === 0 ? 'MuiDataGrid-row--even' : 'MuiDataGrid-row--odd'}
          getRowId={(row) => row?.id}
          localeText={{
            ...heIL.components.MuiDataGrid.defaultProps.localeText,
            columnMenuLabel: "פעולות",
          }}
          columns={getFormColumns()}
          rows={isInEditMode && localRows.length > 0 ? localRows : responsesRows}
          slots={{
            footer: CustomFooter,
          }}
          slotProps={{
            row: {
              onContextMenu: handleContextMenu,
              style: { cursor: 'context-menu' },
            },
          }}
          getDetailPanelContent={getDetailPanelContent}
          getDetailPanelHeight={getDetailPanelHeight}
          detailPanelExpandedRowIds={detailPanelExpandedRowIds}
        />
        <Menu
          open={contextMenu !== null}
          onClose={handleCloseContextMenu}
          anchorReference="anchorPosition"
          anchorPosition={
            contextMenu !== null
              ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
              : undefined
          }
        >
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
