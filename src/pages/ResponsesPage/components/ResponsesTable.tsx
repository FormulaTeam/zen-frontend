import React, { useState, useCallback, useMemo } from "react";
import {
  useGridApiRef,
  GridRowModel,
  GridCellParams,
  GridCellModesModel,
  GridCellModes,
  GridFooterContainer,
  GridFooter,
  GridRenderEditCellParams,
} from "@mui/x-data-grid-pro";
import { useFormStore } from "../stores/form.store";
import { Box, IconButton, TextField, Tooltip } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardDoubleArrowDownIcon from "@mui/icons-material/KeyboardDoubleArrowDown";
import KeyboardDoubleArrowUpIcon from "@mui/icons-material/KeyboardDoubleArrowUp";
import { heIL } from "@mui/x-data-grid/locales";
import ZoomCell from "../../../components/formInForm/ZoomCell";
import { FieldTypeIds, Row } from "../../../utils/interfaces";
import FormFieldRenderer from "../../../components/Responses/FormFieldRenderer";
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

  const formFieldByColumnKey = useMemo(() => {
    const index = new Map<string, FormFieldLike>();

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

    return index;
  }, [form?.fields]);

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

  const isRowExpanded = (row: Row) => {
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


  const getFormColumns = () => {
    const baseFormColumns = Array.isArray(form?.columns)
      ? form?.columns.map((col: any) => ({
        flex: (col.field === "id" || col.field === "_id" || col.field === "responseId") ? 0 : 2,
        minWidth: (col.field === "id" || col.field === "_id" || col.field === "responseId") ? 120 : 200,
        width: (col.field === "id" || col.field === "_id" || col.field === "responseId") ? 150 : 400,
        ...col,
        editable: col.field !== "id" && col.field !== "_id" && col.field !== "responseId",
        fieldTypeId: formFieldByColumnKey.get(col.field)?.typeId,
        renderEditCell: (params: GridRenderEditCellParams) =>
          renderEditCellByType(params, formFieldByColumnKey.get(col.field)?.typeId),
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
