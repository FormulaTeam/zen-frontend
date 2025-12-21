import React, { useState, useCallback } from "react";
import { MaterialReactTable } from "material-react-table";
import Loader from "../../../components/Responses/Loader";
import { ContentContainer, MainContent, StyledDataGrid } from "../styled";
import { useResponsesTable } from "../../../hooks/useResponsesTable";
import {
  useGridApiRef,
  GridPreferencePanelsValue,
  GridRowModel,
  GridCellParams,
  GridCellModesModel,
  GridCellModes,
  GridApiPro,
} from "@mui/x-data-grid-pro";
import { useFormStore } from "../stores/form.store";
import { Box, IconButton, Tooltip } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { heIL } from "@mui/x-data-grid/locales";
import ZoomCell from "../../../components/formInForm/ZoomCell";
import { Row } from "../../../utils/interfaces";
import { MutableRefObject } from "react";



interface ResponsesTableProps {
  isInEditMode: boolean;
  localRows: any[];
  handleProcessRowUpdate: (newRow: GridRowModel, oldRow: GridRowModel) => GridRowModel;
  onCellEditStart?: () => void;
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

  const handleCellClick = useCallback((params: GridCellParams, event: any) => {
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

    if (onCellEditStart) {
      onCellEditStart();
    }

    setCellModesModel((prevModel) => {
      return {
        ...prevModel,
        [params.id]: {
          ...prevModel[params.id],
          [params.field]: { mode: GridCellModes.Edit }
        }
      };
    });
  }, [isInEditMode, onCellEditStart]);

  const handleCellModesModelChange = useCallback((newModel: GridCellModesModel) => {
    setCellModesModel(newModel);
  }, []);

  const getCellClassName = useCallback(
    (params: GridCellParams) => {
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

  const handleOpenColumnsPanel = () => {
    if (apiRef.current) {
      apiRef.current.showPreferences(GridPreferencePanelsValue.columns);
    }
  };

  if (!form.columns) return null;

  const responsesRows = Array.isArray(rows)
    ? rows.reduce((rows, currRow: Row) => {
      const id =
        currRow?.id ??
        currRow?._id ??
        currRow?.responseId ??
        `${currRow?.formId ?? ""}-${currRow?.responseId ?? currRow?._id ?? currRow?.id}`;
      if (!rows._seen.has(id)) {
        rows._seen.add(id);
        rows.list.push(currRow);
      }
      return rows;
    }, { _seen: new Set<string>(), list: [] as any[] }).list
    : [];

  const hasParentResponses = responsesRows.some(
    (row: any) => !!(row?.parentResponse)
  );


  const toggleRowExpanded = (rowId: string) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(rowId)) {
        next.delete(rowId);
      } else {
        next.add(rowId);
      }
      return next;
    });
  };

  const toggleAllExpanded = () => {
    setExpandedRowIds((prev) => {
      if (prev.size === responsesRows.length) {
        return new Set();
      }
      const all = new Set<string>();
      responsesRows.forEach((r: Row) => {
        const id =
          r?.id ??
          r?._id ??
          r?.responseId ??
          `${r?.formId ?? ""}-${r?.responseId ?? r?._id ?? r?.id}`;
        all.add(String(id));
      });
      return all;
    });
  };

  const isRowExpanded = (row: Row) => {
    const id =
      row?.id ??
      row?._id ??
      row?.responseId ??
      `${row?.formId ?? ""}-${row?.responseId ?? row?._id ?? row?.id}`;
    return expandedRowIds.has(String(id));
  };


  const SyncStatusIcon: React.FC<{ pushedToMetro?: string | null }> = ({ pushedToMetro }) => (
    <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
      {pushedToMetro ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
    </Box>
  );


  const renderRowExpandIcon = (row: Row) => {
    const expanded = isRowExpanded(row);
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", height: "100%" }}>
        <Tooltip title={expanded ? "כיווץ" : "הרחבה"}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              const id =
                row?.id ??
                row?._id ??
                row?.responseId ??
                `${row?.formId ?? ""}-${row?.responseId ?? row?._id ?? row?.id}`;
              toggleRowExpanded(String(id));
            }}
          >
            {expanded ? (
              <KeyboardArrowUpIcon fontSize="small" />
            ) : (
              <KeyboardArrowDownIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      </Box >
    );
  };

  const renderExpandAllHeader = () => {
    const allExpanded = expandedRowIds.size === responsesRows.length && responsesRows.length > 0;
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


  const getFormColumns = () => {
    const baseFormColumns = Array.isArray(form?.columns)
      ? form?.columns.map((col: any) => ({
        flex: (col.field === "id" || col.field === "_id" || col.field === "responseId") ? 0 : 2,
        minWidth: (col.field === "id" || col.field === "_id" || col.field === "responseId") ? 150 : 400,
        ...col,
        editable: col.field !== "id" && col.field !== "_id" && col.field !== "responseId",
      }))
      : [];

    const syncColumn = {
      field: "sync",
      headerName: "",
      renderHeader: () => <CloudUploadIcon fontSize="large" />,
      minWidth: 150,
      editable: false,
      renderCell: (params: any) => (
        <SyncStatusIcon pushedToMetro={params.row?.pushed_to_metro} />
      ),
    };

    const expandColumn = {
      field: "expand",
      headerName: "",
      minWidth: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      editable: false,
      align: "center" as const,
      headerAlign: "center" as const,
      renderHeader: () => renderExpandAllHeader(),
      renderCell: ({ row }: { row: Row }) => renderRowExpandIcon(row),
    };

    const editedByColumn = {
      field: "editedByName",
      headerName: "השתנה ע״י",
      flex: 1,
      minWidth: 200,
      editable: false,
    };

    const editedAtColumn = {
      field: "edited",
      headerName: "תאריך שינוי",
      flex: 1,
      minWidth: 200,
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


  return (
    <ContentContainer>
      <MainContent $sidePanelOpen={false}>
        {/* {loadingTable ? <Loader /> :  */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center", mb: 1 }}>
          <Tooltip title="ניהול תצוגות">
            <IconButton size="small" onClick={handleOpenColumnsPanel}>
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <StyledDataGrid
          apiRef={apiRef}
          className={isInEditMode ? 'MuiDataGrid-root--edit-mode' : ''}
          isRowSelectable={({ row }) => true}
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
          rowHeight={65}
          loading={!rows}
          pagination
          checkboxSelection
          disableRowSelectionOnClick
          getRowClassName={(params) => params.indexRelativeToCurrentPage % 2 === 0 ? 'MuiDataGrid-row--even' : 'MuiDataGrid-row--odd'}
          getRowId={(row) => row.id ?? row._id ?? row.responseId ?? `${row.formId ?? ""}-${row.responseId ?? row._id ?? row.id}`}
          localeText={{
            ...heIL.components.MuiDataGrid.defaultProps.localeText,
            columnMenuLabel: "פעולות",
          }}
          columns={getFormColumns()}
          rows={isInEditMode && localRows.length > 0 ? localRows : responsesRows}
        />
      </MainContent>
    </ContentContainer>
  );
};
