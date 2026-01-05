import React, { useState, useCallback } from "react";
import {
  useGridApiRef,
  GridRowModel,
  GridCellParams,
  GridCellModesModel,
  GridCellModes,
  GridFooterContainer,
  GridFooter,
} from "@mui/x-data-grid-pro";
import { useFormStore } from "../stores/form.store";
import { IconButton, Tooltip } from "@mui/material";
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
import { ContentContainer, MainContent, StyledDataGrid, ResponsesAmountText, ResponsesAmountBox, ExpandIconBox, SyncStatusIconBox } from "../styled";

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

  const handleCellClick = useCallback((params: GridCellParams, event: any): void => {
    // Makes clicking on the checkbox possible even in edit mode
    if (params.field === "__check__" || !isInEditMode || !params.isEditable) {
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

  // disable double click to edit when not in edit mode
  const handleCellDoubleClick = useCallback((params: GridCellParams, event: any): void => {
    if (!isInEditMode) {
      event.defaultMuiPrevented = true;
    }
  }, [isInEditMode]);

  const hasParentResponses: boolean = rows.some(
    (row: Row) => !!(row?.parentResponse)
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
    const allExpanded: boolean = expandedRowIds.size === rows.length && rows.length > 0;
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
        minWidth: (col.field === "id" || col.field === "_id" || col.field === "responseId") ? 120 : 200,
        width: (col.field === "id" || col.field === "_id" || col.field === "responseId") ? 150 : 400,
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
      align: "center" as const,
      headerAlign: "center" as const,
      renderCell: (params: any) => (
        <SyncStatusIcon pushedToMetro={params.row?.pushed_to_metro} />
      ),
    };

    const expandColumn = {
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

    const editedByColumn = {
      field: "editedByName",
      headerName: "השתנה ע״י",
      flex: 1,
      width: 200,
      minWidth: 150,
      editable: false,
    };

    const editedAtColumn = {
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
          getRowId={(row) => row?.id}
          localeText={{
            ...heIL.components.MuiDataGrid.defaultProps.localeText,
            columnMenuLabel: "פעולות",
          }}
          columns={getFormColumns()}
          rows={isInEditMode && localRows.length > 0 ? localRows : rows}
          slots={{
            footer: CustomFooter,
          }}
        />
      </MainContent>
    </ContentContainer>
  );
};
