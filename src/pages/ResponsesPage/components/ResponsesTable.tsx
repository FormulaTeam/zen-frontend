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
import { IconButton, Tooltip } from "@mui/material";
import clsx from "clsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { heIL } from "@mui/x-data-grid/locales";
import ZoomCell from "../../../components/formInForm/ZoomCell";
import { Row } from "../../../utils/interfaces";
import { useCellEditors } from "../hooks/useCellEditors";
import { useCellDisplay } from "../hooks/useCellDisplay";
import { downloadFileFromResponse } from "../../../api/filesApi";
import { ContentContainer, ExpandIconBox, MainContent, ResponsesAmountBox, ResponsesAmountText, StyledDataGrid, SyncStatusIconBox } from "../styled";

interface ResponsesTableProps {
  isInEditMode: boolean;
  localRows: Row[];
  handleProcessRowUpdate: (newRow: GridRowModel, oldRow: GridRowModel) => GridRowModel;
  onCellEditStart: () => void;
}

export const ResponsesTable = ({
  isInEditMode,
  localRows,
  handleProcessRowUpdate,
  onCellEditStart,
}: ResponsesTableProps) => {
  const { form, rows } = useFormStore();
  const apiRef = useGridApiRef();
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  const { renderEditCell } = useCellEditors({
    apiRef,
    formFields: form?.fields,
  });

  const handleFileClick = useCallback((file: any) => {
    downloadFileFromResponse(file, String(form?.id));
  }, [form?.id]);

  const { formatCellValue } = useCellDisplay({
    formId: form?.id,
    onFileClick: handleFileClick,
  });

  const handleCellClick = useCallback((params: GridCellParams, event: any) => {
    if (params.field === "__check__") {
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

    // changes to in edit mode, set the local rows to the response rows
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

  const toggleRowExpanded = useCallback((rowId: string): void => {
    setExpandedRowIds((currentExpandedIds: Set<string>) => {
      const updatedExpandedIds = new Set(currentExpandedIds);
      if (updatedExpandedIds.has(rowId)) {
        updatedExpandedIds.delete(rowId);
      } else {
        updatedExpandedIds.add(rowId);
      }

      return updatedExpandedIds;
    });
  }, []);

  const toggleAllExpanded = useCallback((): void => {
    setExpandedRowIds((currentExpandedIds) =>
      currentExpandedIds.size === rows.length
        ? new Set()
        : new Set(rows.map((row: Row) => String(row.id)))
    );
  }, [rows]);

  const isRowExpanded = (row: Row): boolean => {
    return expandedRowIds.has(String(row.id));
  };

  const SyncStatusIcon: React.FC<{ pushedToMetro?: string | null }> = ({ pushedToMetro }) => (
    <SyncStatusIconBox>
      {pushedToMetro ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
    </SyncStatusIconBox>
  );


  const renderRowExpandIcon = (row: Row): JSX.Element => {
    const isExpanded: boolean = isRowExpanded(row);

    return (
      <ExpandIconBox>
        <Tooltip title={isExpanded ? "כיווץ" : "הרחבה"}>
          <IconButton
            size="small"
            onClick={(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              event.stopPropagation();
              toggleRowExpanded(String(row.id));
            }}
          >
            {isExpanded ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </ExpandIconBox>
    );
  };

  const renderExpandAllHeader = (): JSX.Element => {
    const allExpanded: boolean = expandedRowIds.size === responsesRows.length && responsesRows.length > 0;
    return (
      <Tooltip title={allExpanded ? "כיווץ הכל" : "הרחב הכל"}>
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            toggleAllExpanded();
          }}
        >
          {allExpanded ? (
            <KeyboardDoubleArrowUpIcon fontSize="small" />
          ) : (
            <KeyboardDoubleArrowDownIcon fontSize="small" />
          )}
        </IconButton>
      </Tooltip>
    );
  };

  const getFormColumns = (): GridColDef[] => {
    const baseFormColumns = (form?.columns && form.columns?.length > 0)
      ? form?.columns.map((column: GridColDef) => {
        const formField = form?.fields?.find((field) => field.displayName === column.field);

        return {
          flex: (column.field === "id") ? 0 : 2,
          minWidth: (column.field === "id") ? 120 : 200,
          width: (column.field === "id") ? 150 : 400,
          ...column,
          editable: column.field !== "id",
          fieldTypeId: formField?.typeId,
          renderEditCell: renderEditCell,
          renderCell: (params: GridRenderCellParams) => {
            if (formField && params.value !== undefined && params.value !== null) {
              return formatCellValue(params.value, formField);
            }
            return params.value;
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
      renderCell: (params: any) => (
        <SyncStatusIcon pushedToMetro={params.row?.pushed_to_metro} />
      ),
    };

    const expandColumn: GridColDef = {
      field: "expand",
      headerName: "",
      minWidth: 120,
      width: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      editable: false,
      align: "center" as const,
      headerAlign: "center" as const,
      renderHeader: () => renderExpandAllHeader(),
      renderCell: ({ row }: { row: Row }) => renderRowExpandIcon(row),
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
      expandColumn,
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
        />
      </MainContent>
    </ContentContainer>
  );
};
