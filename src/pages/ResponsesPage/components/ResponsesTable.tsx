import React, { useState, useCallback, useMemo } from "react";
import { ContentContainer, MainContent, StyledDataGrid } from "../styled";
import {
  useGridApiRef,
  GridPreferencePanelsValue,
  GridRowModel,
  GridCellParams,
  GridCellModesModel,
  GridCellModes,
  GridRenderEditCellParams,
} from "@mui/x-data-grid-pro";
import { useFormStore } from "../stores/form.store";
import { Box, Checkbox, IconButton, TextField, Tooltip } from "@mui/material";
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
import { FieldTypeIds, Row } from "../../../utils/interfaces";
import { FormFieldsMapResponse } from "../../../api/responsesApi";

import FormFieldRenderer from "../../../components/Responses/FormFieldRenderer";


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
  const { form, rows, formFieldsMap } = useFormStore();
  const apiRef = useGridApiRef();
  const [expandedRowIds, setExpandedRowIds] = useState<Set<string>>(new Set());
  const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});

  type ColumnFieldMeta = {
    uniqueId: string;
    displayName?: string;
    name?: string;
    typeId: number;
  };

  type EditableFieldTypeId = number;

  type FormFieldLike = {
    uniqueId: string;
    displayName: string;
    typeId: number;
    required?: boolean;
    options?: string[];
    multiSelect?: boolean;
    validationRegex?: string;
    coordinateType?: string;
    numberType?: string;
    minValue?: number;
    maxValue?: number;
    defaultValue?: string;
    dateAndTime?: boolean;
  };

  const fieldMetaByColumnKey = useMemo(() => {
    const index = new Map<string, ColumnFieldMeta>();

    const typedMap = formFieldsMap as FormFieldsMapResponse | null;
    const fields = typedMap?.fields ?? [];

    fields.forEach((field) => {
      const meta: ColumnFieldMeta = {
        uniqueId: field.uniqueId,
        displayName: field.displayName,
        // `name` isn't included in the current API type. If you add it later in the backend,
        // extend `FormFieldsMapResponse` and it'll flow through here.
        name: undefined,
        typeId: field.typeId,
      };

      // DataGrid columns currently use the display name as `field`.
      if (meta.displayName) {
        index.set(meta.displayName, meta);
      }
    });

    return index;
  }, [formFieldsMap]);

  const formFieldByColumnKey = useMemo(() => {
    const index = new Map<string, FormFieldLike>();

    // Prefer using the full `form.fields` when available, because it contains important
    // configuration like options/multiSelect/required/etc.
    const formFields = (form?.fields ?? []) as unknown as Array<Partial<FormFieldLike> & { uniqueId: string }>;

    formFields.forEach((field) => {
      if (!field.displayName) {
        return;
      }

      index.set(field.displayName, {
        uniqueId: field.uniqueId,
        displayName: field.displayName,
        typeId: field.typeId ?? 0,
        required: field.required,
        options: field.options as string[] | undefined,
        multiSelect: field.multiSelect,
        validationRegex: field.validationRegex,
        coordinateType: field.coordinateType,
        numberType: field.numberType,
        minValue: field.minValue,
        maxValue: field.maxValue,
        defaultValue: field.defaultValue,
        dateAndTime: field.dateAndTime,
      });
    });

    // Fill any missing fields with the light-weight API map (typeId + ids)
    const typedMap = formFieldsMap as FormFieldsMapResponse | null;
    const mapFields = typedMap?.fields ?? [];
    mapFields.forEach((field) => {
      if (!field.displayName) {
        return;
      }
      if (index.has(field.displayName)) {
        return;
      }
      index.set(field.displayName, {
        uniqueId: field.uniqueId,
        displayName: field.displayName,
        typeId: field.typeId,
      });
    });

    return index;
  }, [form?.fields, formFieldsMap]);

  const setEditCellValue = useCallback(
    (params: GridRenderEditCellParams, newValue: unknown) => {
      apiRef.current?.setEditCellValue({
        id: params.id,
        field: params.field,
        value: newValue,
      });
    },
    [apiRef],
  );

  const renderEditCellWithFormFieldRenderer = useCallback(
    (params: GridRenderEditCellParams) => {
      const formField = formFieldByColumnKey.get(params.field);
      if (!formField) {
        return (
          <TextField
            variant="standard"
            fullWidth
            value={(params.value as string | null | undefined) ?? ""}
            onChange={(e) => setEditCellValue(params, e.target.value)}
            InputProps={{ disableUnderline: true }}
            sx={{ px: 1 }}
          />
        );
      }

      // Minimal maps expected by FormFieldRenderer
      const formFieldsByIdMap = new Map<string, any>([[formField.uniqueId, { ...formField }]]);
      const formFieldsValuesMap = new Map<string, any>([[formField.uniqueId, params.value]]);

      let initialValid: any = true;
      if (formField.typeId === FieldTypeIds.link) {
        initialValid = { link: true, linkTxt: true };
      } else if (formField.typeId === FieldTypeIds.location) {
        initialValid = { x: true, y: true };
      }
      const formFieldsValidMap = new Map<string, any>([[formField.uniqueId, initialValid]]);

      const cellFieldOptions = formField.typeId === FieldTypeIds.options ? { [formField.uniqueId]: [] } : {};

      return (
        <Box sx={{ zoom: 0.9, display: "flex", alignItems: "center", minHeight: "60px", width: "100%" }}>
          <FormFieldRenderer
            formField={formField as any}
            formFieldsByIdMap={formFieldsByIdMap}
            formFieldsValuesMap={formFieldsValuesMap}
            formFieldsValidMap={formFieldsValidMap}
            onChangeHandler={(newValue: any, _uniqueId: string, _valid: any) => {
              setEditCellValue(params, newValue);
            }}
            viewMode={false}
            fieldOptions={cellFieldOptions as any}
            formFields={[formField as any]}
            index={0}
            isTabularEdit={true}
          />
        </Box>
      );
    },
    [formFieldByColumnKey, setEditCellValue],
  );

  const renderEditCellByType = useCallback(
    (params: GridRenderEditCellParams, fieldTypeId?: EditableFieldTypeId) => {
      const typeId = fieldTypeId;
      // Delegate to the existing renderer to avoid duplicating editor logic.
      // It already supports list/file and uses the same custom components as the non-table UI.
      // For any field we still can’t fully support (e.g. connected-form options), it will fall back safely.
      if (typeId != null) {
        return renderEditCellWithFormFieldRenderer(params);
      }

      return renderEditCellWithFormFieldRenderer(params);
    },
    [renderEditCellWithFormFieldRenderer],
  );

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
        fieldTypeId: fieldMetaByColumnKey.get(col.field)?.typeId,
        renderEditCell: (params: GridRenderEditCellParams) =>
          renderEditCellByType(params, fieldMetaByColumnKey.get(col.field)?.typeId),
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
