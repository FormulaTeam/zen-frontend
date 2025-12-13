import React, { useState } from "react";
import { MaterialReactTable } from "material-react-table";
import Loader from "../../../components/Responses/Loader";
import { ContentContainer, MainContent } from "../styled";
import { useResponsesTable } from "../../../hooks/useResponsesTable";
import { DataGridPro, useGridApiRef, GridPreferencePanelsValue, GridRowModel } from "@mui/x-data-grid-pro";
import { useFormStore } from "../stores/form.store";
import { Box, IconButton, Tooltip, Button } from "@mui/material";
import { styled } from "@mui/material/styles";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { heIL } from "@mui/x-data-grid/locales";
import ZoomCell from "../../../components/formInForm/ZoomCell";
import { Row } from "../../../utils/interfaces";
import { showSuccessNotification, showErrorNotification } from "../../../utils/utils";
import { useBatchUpdateResponses, useGetResponses } from "../../../api/responsesApi";
import { useAuth } from "../../../contexts/AuthContext";

const StyledDataGrid = styled(DataGridPro)(({ theme }) => ({
  "&.MuiDataGrid-root": {
    "--DataGrid-t-header-background-base": "#f0f4f6",
  },
  "& .MuiDataGrid-columnSeparator": {
    right: "auto",
    left: -12,
  },
  "& .MuiDataGrid-columnHeader:hover .MuiDataGrid-columnSeparator": {
    opacity: 1,
  },
  "& .MuiDataGrid-columnHeaderTitle": {
    textAlign: "right",
    width: "100%",
  },
  "& .MuiDataGrid-cell": {
    textAlign: "right",
  },
  "& .MuiDataGrid-columnHeader": {
    textAlign: "right",
  },
  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
    outline: "none !important",
    boxShadow: "none",
  },
  "& .MuiDataGrid-columnHeader:focus, & .MuiDataGrid-columnHeader:focus-within": {
    outline: "none !important",
    boxShadow: "none",
  },
  "& .MuiDataGrid-cell.Mui-focusVisible, & .MuiDataGrid-columnHeader.Mui-focusVisible": {
    outline: "none !important",
    boxShadow: "none",
  },
}));

export const ResponsesTable = () => {
  // const responsesTable = useResponsesTable({});
  const { responses, form, rows, setRows, filter } = useFormStore();
  const { user } = useAuth();
  const apiRef = useGridApiRef();
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState<Map<string, any>>(new Map());
  const [localRows, setLocalRows] = useState<any[]>([]);

  // Fetch full responses when we need them for editing
  const { data: fullResponses } = useGetResponses({
    filter: { ...filter, form_id: form?.id },
  });

  const { mutateAsync: batchUpdateResponses, isPending: isUpdating } = useBatchUpdateResponses({
    formId: form?.id || 0,
  });

  const handleOpenColumnsPanel = () => {
    if (apiRef.current) {
      apiRef.current.showPreferences(GridPreferencePanelsValue.columns);
    }
  };

  const handleToggleEditMode = () => {
    if (isEditMode) {
      // Exiting edit mode - revert to original rows
      setEditedRows(new Map());
      setLocalRows(responsesRows);
    } else {
      // Entering edit mode - initialize local rows from current data
      setLocalRows([...responsesRows]);
    }
    setIsEditMode(!isEditMode);
  };

  const handleProcessRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    // Update local rows immediately so changes persist when moving between cells
    setLocalRows((prevRows) =>
      prevRows.map((row) => {
        const rowId = row.id ?? row._id ?? row.responseId;
        const newRowId = newRow.id ?? newRow._id ?? newRow.responseId;
        return String(rowId) === String(newRowId) ? { ...row, ...newRow } : row;
      })
    );

    // Track the edited row
    const rowId = newRow.id ?? newRow._id ?? newRow.responseId;
    setEditedRows((prev) => {
      const updated = new Map(prev);
      updated.set(String(rowId), newRow);
      return updated;
    });

    return newRow;
  };

  const handleSaveChanges = async () => {
    if (editedRows.size === 0) {
      showSuccessNotification("אין שינויים לשמירה");
      return;
    }

    if (!fullResponses || fullResponses.length === 0) {
      showErrorNotification("לא נמצאו תגובות לעדכון");
      return;
    }

    try {
      const updatesToSend = Array.from(editedRows.entries()).map(([rowId, editedRowData]) => {
        const originalResponse = fullResponses?.find((r) => String(r.id) === String(rowId));

        if (!originalResponse) {
          return null;
        }

        // Map column field names to uniqueIds
        const uniqueIdToColumnField = new Map();
        form.columns?.forEach((col: any) => {
          const field = form.fields?.find(f =>
            f.displayName === col.field || f.name === col.field
          );
          if (field && field.uniqueId) {
            uniqueIdToColumnField.set(field.uniqueId, col.field);
          }
        });

        // Build updated response with full structure
        const updatedData: any = {
          ...originalResponse,
          edited_by: user?.upn?.toLowerCase() || originalResponse.edited_by,
          edited_by_name: user?.displayName || originalResponse.edited_by_name,
          data: originalResponse.data.map((field) => {
            const columnFieldName = uniqueIdToColumnField.get(field.uniqueId);
            if (columnFieldName && editedRowData.hasOwnProperty(columnFieldName)) {
              return {
                ...field,
                value: editedRowData[columnFieldName],
              };
            }
            return field;
          }),
        };


        return {
          id: Number(originalResponse.id),
          responseData: updatedData,
        };
      }).filter((item): item is { id: number; responseData: any } => item !== null && !isNaN(item.id));

      if (updatesToSend.length === 0) {
        showErrorNotification("לא נמצאו שינויים תקינים לשמירה");
        return;
      }

      await batchUpdateResponses(updatesToSend);
      setRows(localRows);
      setEditedRows(new Map());
      setIsEditMode(false);

      showSuccessNotification(`נשמרו ${editedRows.size} שינויים בהצלחה!`);
    } catch (error) {
      console.error("Error saving changes:", error);
      showErrorNotification("שגיאה בשמירת השינויים");
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
    <>
      {pushedToMetro ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
    </>
  );


  const renderRowExpandIcon = (row: Row) => {
    const expanded = isRowExpanded(row);
    return (
      <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
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
        flex: 1,
        ...col,
        // Make id field non-editable, allow editing of other form columns
        editable: col.field !== "id" && col.field !== "_id" && col.field !== "responseId",
      }))
      : [];

    const syncColumn = {
      field: "sync",
      headerName: "",
      renderHeader: () => <CloudUploadIcon fontSize="large" />,
      flex: 1,
      editable: false,
      renderCell: (params: any) => (
        <SyncStatusIcon pushedToMetro={params.row?.pushed_to_metro} />
      ),
    };

    const expandColumn = {
      field: "expand",
      headerName: "",
      flex: 1,
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
      editable: false,
    };

    const editedAtColumn = {
      field: "edited",
      headerName: "השתנה",
      flex: 1,
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
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Box sx={{ display: "flex", gap: 1 }}>
            {!isEditMode ? (
              <Tooltip title="מצב עריכה">
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={handleToggleEditMode}
                >
                  ערוך
                </Button>
              </Tooltip>
            ) : (
              <>
                <Tooltip title="שמור שינויים">
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<SaveIcon />}
                    onClick={handleSaveChanges}
                    disabled={editedRows.size === 0 || isUpdating}
                  >
                    {isUpdating ? "שומר..." : `שמור ${editedRows.size > 0 ? `(${editedRows.size})` : ""}`}
                  </Button>
                </Tooltip>
                <Tooltip title="בטל עריכה">
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={handleToggleEditMode}
                  >
                    בטל
                  </Button>
                </Tooltip>
              </>
            )}
          </Box>
          <Tooltip title="ניהול תצוגות">
            <IconButton size="small" onClick={handleOpenColumnsPanel}>
              <ViewColumnIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <StyledDataGrid
          apiRef={apiRef}
          isRowSelectable={({ row }) => true}
          editMode="cell"
          processRowUpdate={handleProcessRowUpdate}
          onProcessRowUpdateError={(error) => {
            console.error("Error updating row:", error);
          }}
          density="comfortable"
          rowHeight={38}
          loading={!rows}
          pagination
          pageSizeOptions={[25, 50, 100]}
          checkboxSelection
          getRowId={(row) => row.id ?? row._id ?? row.responseId ?? `${row.formId ?? ""}-${row.responseId ?? row._id ?? row.id}`}
          localeText={{
            ...heIL.components.MuiDataGrid.defaultProps.localeText,
            columnMenuLabel: "פעולות",
          }}
          columns={getFormColumns()}
          rows={isEditMode && localRows.length > 0 ? localRows : responsesRows}
        />
      </MainContent>
    </ContentContainer>
  );
};
