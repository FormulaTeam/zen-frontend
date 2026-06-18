import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import {
  useGridApiRef,
  GridRowModel,
  GridCellParams,
  GridCellModesModel,
  GridCellModes,
  GridFooterContainer,
  GridColDef,
  GridRenderCellParams,
  GridRowSelectionModel,
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
} from "@mui/x-data-grid-pro";
import { useFormStore, useInitiateFormStore } from "../stores/form.store";
import clsx from "clsx";
import CloudIcon from "@mui/icons-material/Cloud";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Visibility from "@mui/icons-material/Visibility";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { heIL } from "@mui/x-data-grid/locales";
import ZoomCell from "@components/formInForm/ZoomCell";
import {
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Select,
  Tooltip,
  IconButton,
  Checkbox,
} from "@mui/material";
import { useCellEditors } from "../hooks/useCellEditors";
import { useCellDisplay } from "../hooks/useCellDisplay";
import { useResponsesTableSorting } from "../hooks/useResponsesTableSorting";
import { downloadFileFromResponse, type StoredFile } from "@api/filesApi";
import { useSoftDeleteResponses } from "../../../api";
import {
  ContentContainer,
  MainContent,
  StyledDataGrid,
  SyncStatusIconBox,
  HeaderAsterisk,
  HeaderFlex,
  CellErrorWrapper,
  CellErrorText,
  CellErrorInfoIcon,
  CellValueFlex,
  PaginationContainer,
  FooterInfoContainer,
  PaginationButton,
  CellErrorHeader,
  TableContainer,
} from "../styled";
import { useChildForms } from "../hooks/useChildForms";
import { useDetailPanel } from "../hooks/useDetailPanel";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { FormFieldDto } from "../../../types/shared";
import { MetaColumnIds } from "../../../utils/interfaces";
import {
  DEFAULT_DATE_TIME_FORMAT,
  showErrorNotification,
  showSuccessNotification,
} from "../../../utils/utils";
import * as Gear from "formula-gear";
import {
  getResponseFilterColumnProps,
  getResponseMetaFilterColumnProps,
  ResponsesColumnMenu,
  useResponsesTableFilters,
} from "./ResponsesFilters";
import { useConnectedFormOptions } from "@src/hooks/useConnectedFormOptions";

const responseHeaderFilterLocaleText = {
  headerFilterOperatorContains: "מכיל",
  headerFilterOperatorNotContains: "לא מכיל",
  headerFilterOperatorEquals: "שווה ל",
  headerFilterOperatorNotEquals: "שונה מ",

  headerFilterOperatorGreaterThan: "גדול מ",
  headerFilterOperatorGreaterThanOrEqual: "גדול או שווה ל",
  headerFilterOperatorLessThan: "קטן מ",
  headerFilterOperatorLessThanOrEqual: "קטן או שווה ל",

  headerFilterOperatorBetween: "בין",
  headerFilterOperatorNotBetween: "לא בין",

  headerFilterOperatorOn: "בתאריך",
  headerFilterOperatorNotOn: "לא בתאריך",
  headerFilterOperatorBefore: "לפני",
  headerFilterOperatorBeforeOrEqual: "לפני או שווה ל",
  headerFilterOperatorAfter: "אחרי",
  headerFilterOperatorAfterOrEqual: "אחרי או שווה ל",

  headerFilterOperatorContainsAny: "מכיל אחד מתוך",
  headerFilterOperatorNotContainsAny: "לא מכיל אף אחד מתוך",
  headerFilterOperatorContainsAll: "מכיל את כולם",
  headerFilterOperatorNotContainsAll: "לא מכיל את כולם",

  headerFilterOperatorIsEmpty: "ריק",
  headerFilterOperatorIsNotEmpty: "לא ריק",

  headerFilterOperatorIsTrue: "כן",
  headerFilterOperatorIsFalse: "לא",

  headerFilterOperatorHasFiles: "יש קבצים",
  headerFilterOperatorHasNoFiles: "אין קבצים",
  headerFilterOperatorFileNameContains: "שם קובץ מכיל",
  headerFilterOperatorFileNameNotContains: "שם קובץ לא מכיל",
};

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
  if (typeId === undefined) return true;

  return (gearComparableFieldTypes as number[]).includes(typeId);
};

const EmptyColumnHeaderFilterIconButton = () => null;
const EmptyColumnFilteredIcon = () => null;

type Row = GridRowModel & {
  id: string | number;
  parentResponse?: string | null;
  pushed_to_metro?: string | null;
  editedByName?: string;
  edited?: string;
  [key: string]: unknown;
};

type LocalDisplayFile = {
  name: string;
  file: File;
};

type ResponseDisplayFile = StoredFile | LocalDisplayFile;

type QuickEditValidationError = {
  message: string;
  detail?: string;
};

type KeyboardNavigationAction = "nextCell" | "previousCell" | "nextRow" | "previousRow";

interface ResponsesTableProps {
  isInEditMode: boolean;
  localRows: Row[];
  handleProcessRowUpdate: (newRow: GridRowModel, oldRow: GridRowModel) => GridRowModel;
  onCellEditStart: () => void;
  validationErrors?: Record<number | string, Record<string, QuickEditValidationError>>;
  onCellLiveChange?: (rowId: number | string, columnName: string, value: unknown) => void;
  onRowSelectionModelChange?: (model: GridRowSelectionModel) => void;
  rowSelectionModel?: GridRowSelectionModel;
  currentView?: ResponsesView;
  deletedRowIds?: (string | number)[];
}

const SyncStatusIcon: React.FC<{ pushedToMetro?: string | null }> = ({ pushedToMetro }) => (
  <SyncStatusIconBox>
    {pushedToMetro ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
  </SyncStatusIconBox>
);

const isInputLikeTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;

  if (!element) return false;

  return !!element.closest("input, textarea, [contenteditable='true']");
};

const isTextAreaTarget = (target: EventTarget | null): boolean => {
  const element = target as HTMLElement | null;

  if (!element) return false;

  return !!element.closest("textarea");
};

export const ResponsesTable = React.memo(
  ({
    isInEditMode,
    localRows,
    handleProcessRowUpdate,
    onCellEditStart,
    validationErrors,
    onCellLiveChange,
    onRowSelectionModelChange,
    rowSelectionModel,
    currentView,
    deletedRowIds = [],
  }: ResponsesTableProps) => {
    const { form, rows, pageInfo, filter, setFilter, setResponseFilters, isRowsLoading } =
      useFormStore();

    const navigate = useNavigate();

    const displayRows = useMemo(() => {
      let baseRows = isInEditMode && localRows.length > 0 ? localRows : rows;

      if (isInEditMode && deletedRowIds.length > 0) {
        const deletedSet = new Set(deletedRowIds.map(String));
        return baseRows.filter((row) => !deletedSet.has(String(row.id)));
      }

      return baseRows;
    }, [isInEditMode, localRows, rows, deletedRowIds]);

    const currentViewConfig = useMemo(() => currentView?.columns || [], [currentView]);

    if (!form) return null;

    const [isNavigating, setIsNavigating] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    const transitionInProgress = useRef(false);
    const lastIntendedPageNumber = useRef(filter?.pageNumber ?? 1);
    const lastFetchStartedRef = useRef(false);

    const activeFiltersCount = filter?.responseFilters?.items?.length ?? 0;

    useEffect(() => {
      if (activeFiltersCount > 0) {
        setShowFilters(true);
      }
    }, [activeFiltersCount]);

    useEffect(() => {
      if (isInEditMode) {
        setShowFilters(false);
      }
    }, [isInEditMode]);

    useEffect(() => {
      lastIntendedPageNumber.current = filter?.pageNumber ?? 1;
    }, [filter?.pageNumber]);

    useEffect(() => {
      if (isRowsLoading) {
        lastFetchStartedRef.current = true;
      }

      if (!isRowsLoading) {
        transitionInProgress.current = false;
        setIsNavigating(false);
        lastFetchStartedRef.current = false;
      }
    }, [isRowsLoading, pageInfo, rows]);

    const handleNextPage = useCallback(() => {
      if (
        pageInfo?.hasNextPage &&
        pageInfo.endCursor &&
        !isRowsLoading &&
        !transitionInProgress.current
      ) {
        transitionInProgress.current = true;
        setIsNavigating(true);

        const nextPage = lastIntendedPageNumber.current + 1;
        lastIntendedPageNumber.current = nextPage;

        setFilter({
          ...filter,
          after: pageInfo.endCursor,
          before: undefined,
          pageNumber: nextPage,
        });
      }
    }, [pageInfo, filter, setFilter, isRowsLoading]);

    const handlePreviousPage = useCallback(() => {
      const currentPage = lastIntendedPageNumber.current;

      if (
        pageInfo?.hasPreviousPage &&
        pageInfo.startCursor &&
        !isRowsLoading &&
        !transitionInProgress.current &&
        currentPage > 1
      ) {
        transitionInProgress.current = true;
        setIsNavigating(true);

        const prevPage = Math.max(currentPage - 1, 1);
        lastIntendedPageNumber.current = prevPage;

        setFilter({
          ...filter,
          before: pageInfo.startCursor,
          after: undefined,
          pageNumber: prevPage,
        });
      }
    }, [pageInfo, filter, setFilter, isRowsLoading]);

    const handleToggleFilters = useCallback(() => {
      setShowFilters((prev) => !prev);
    }, []);

    const handleClearFilters = useCallback(() => {
      setResponseFilters(null);
    }, [setResponseFilters]);

    const formFields = useMemo<FormFieldDto[]>(() => {
      const sectionsFields = (form?.sections ?? []).flatMap((section) => section.fields ?? []);
      if (sectionsFields.length > 0) return sectionsFields;
      return form?.fields ?? [];
    }, [form]);

    const { fieldOptions } = useConnectedFormOptions({
      formFields,
    });

    const { sortModel, handleSortModelChange } = useResponsesTableSorting({
      filter,
      setFilter,
      currentView,
      formFields,
    });

    const { filterModel, handleFilterModelChange } = useResponsesTableFilters({
      filter,
      formFields,
      setResponseFilters,
    });

    const apiRef = useGridApiRef();

    const columnWidths = useRef<Record<string, number>>({});

    const handleColumnWidthChange = useCallback((params: { colDef: GridColDef; width: number }) => {
      columnWidths.current[params.colDef.field] = params.width;
    }, []);

    const shouldUseHeaderFilters = showFilters && !isInEditMode;
    const shouldRequestTableSkeleton = !isInEditMode && isRowsLoading;
    const [showTableSkeleton, setShowTableSkeleton] = useState(false);

    useEffect(() => {
      if (!shouldRequestTableSkeleton) {
        setShowTableSkeleton(false);
        return;
      }

      const timeoutId = window.setTimeout(() => {
        setShowTableSkeleton(true);
      }, 300);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }, [shouldRequestTableSkeleton]);
    const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
    const [expandedRows, setExpandedRows] = useState<Record<string | number, Set<string>>>({});

    const handleCellExpandToggle = useCallback(
      (rowId: string | number, fieldId: string, isExpanded: boolean) => {
        const stringRowId = String(rowId);

        setExpandedRows((prev) => {
          const next = { ...prev };
          const rowExpandedFields = new Set(next[stringRowId] || []);

          if (isExpanded) {
            rowExpandedFields.add(fieldId);
          } else {
            rowExpandedFields.delete(fieldId);
          }

          if (rowExpandedFields.size > 0) {
            next[stringRowId] = rowExpandedFields;
          } else {
            delete next[stringRowId];
          }

          return next;
        });

        // Use a small timeout to allow the DOM to update before recalculating heights
        setTimeout(() => {
          apiRef.current?.resetRowHeights();
        }, 0);
      },
      [apiRef],
    );

    const activeEditingRowIds = useMemo(() => {
      const rowIds = new Set<string>();

      Object.entries(cellModesModel).forEach(([rowId, fields]) => {
        const isRowEditing = Object.values(fields).some(
          (fieldMode) => fieldMode.mode === GridCellModes.Edit,
        );

        if (isRowEditing) {
          rowIds.add(String(rowId));
        }
      });

      return rowIds;
    }, [cellModesModel]);

    useEffect(() => {
      apiRef.current?.resetRowHeights();
    }, [apiRef, activeEditingRowIds]);

    const { childrenFormsData, hasFormInFormFields, loadingChildForms, getChildFormData } =
      useChildForms({ form });

    const {
      expandColumn,
      getDetailPanelContent,
      getDetailPanelHeight,
      detailPanelExpandedRowIds,
      handleDetailPanelExpandedRowIdsChange,
    } = useDetailPanel({
      form,
      rows,
      hasFormInFormFields,
      loadingChildForms,
      childrenFormsData,
      isInEditMode,
      getChildFormData,
      currentViewConfig,
      searchQuery: filter?.query,
    });

    const { renderEditCell } = useCellEditors({
      apiRef,
      formFields,
      fieldOptions,
      validationErrors,
      onLiveChange: onCellLiveChange,
    });

    const handleFileClick = useCallback(
      (file: ResponseDisplayFile, rowId?: string | number) => {
        downloadFileFromResponse(file, String(form?.id), rowId ? String(rowId) : undefined);
      },
      [form?.id],
    );

    const { formatCellValue } = useCellDisplay({
      formId: form?.id,
      onFileClick: handleFileClick,
      searchQuery: filter?.query,
      isInEditMode,
      onCellExpandToggle: handleCellExpandToggle,
    });

    const handleCellClick = useCallback(
      (params: GridCellParams, event: any) => {
        if (params.field === "__check__" || params.field === GRID_DETAIL_PANEL_TOGGLE_FIELD) {
          return;
        }

        if (isInEditMode && !params.isEditable) {
          return;
        }

        if (!isInEditMode || !params.isEditable) {
          return;
        }

        onCellEditStart();

        setCellModesModel((prevModel: GridCellModesModel) => ({
          ...prevModel,
          [params.id]: {
            ...prevModel[params.id],
            [params.field]: { mode: GridCellModes.Edit },
          },
        }));
      },
      [isInEditMode, onCellEditStart],
    );

    const handleCellModesModelChange = useCallback((newModel: GridCellModesModel): void => {
      setCellModesModel(newModel);
    }, []);

    const getCellClassName = useCallback(
      (params: GridCellParams): string => {
        if (!isInEditMode || params.field === "__check__") {
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
          navigate(`/forms/${form.id}/responses/${rowData.id}/copy`);
        }
      },
      [form?.id, navigate],
    );

    const { mutateAsync: softDeleteResponses } = useSoftDeleteResponses(Number(form?.id ?? 0));

    const handleDeleteResponse = useCallback(
      async (rowId: string | number) => {
        try {
          const { setForm: storeSetForm } = useInitiateFormStore.getState();
          storeSetForm({
            ...form,
            responsesCount: Math.max(0, (form.responsesCount ?? 0) - 1),
          } as any);

          await softDeleteResponses({ responsesIds: [String(rowId)] });
          showSuccessNotification("מחיקת התגובה בוצעה בהצלחה");
        } catch {
          const { setForm: storeSetForm } = useInitiateFormStore.getState();
          storeSetForm(form);
          showErrorNotification("מחיקת התגובה נכשלה");
        }
      },
      [form, softDeleteResponses],
    );

    const getFormColumns = useMemo((): GridColDef[] => {
      const prefixes = {
        Field: "field:",
        Meta: "meta:",
      };

      const dynamicColumnsMap = new Map<string, GridColDef>();

      formFields.forEach((field) => {
        if (
          (field as any).typeId === Gear.fieldType.Form ||
          field.fieldType === Gear.fieldType.Form
        ) {
          return;
        }

        const columnId = `${prefixes.Field}${field.id}`;
        const gridField = columnId;

        const col: GridColDef = {
          field: gridField,
          headerName: field.displayName,
          width: columnWidths.current[gridField],
          minWidth: 120,
          maxWidth: 450,
          editable: true,
          sortable: isSortable(field.fieldType),
          ...getResponseFilterColumnProps(field, formFields),
          renderEditCell,
          renderHeader: () => (
            <HeaderFlex>
              <span>{field.displayName}</span>
              {isInEditMode && field.isRequired && <HeaderAsterisk>*</HeaderAsterisk>}
            </HeaderFlex>
          ),
          renderCell: (params: GridRenderCellParams) => {
            const rowId = params.id;
            const cellError = validationErrors?.[rowId]?.[gridField];

            const content =
              params.value !== undefined && params.value !== null
                ? formatCellValue(params.value, field, rowId)
                : null;

            const display = content ?? <Box component="span" className="cell-box" />;

            if (isInEditMode && cellError) {
              return (
                <CellErrorWrapper>
                  <CellErrorHeader>
                    <CellErrorText title={cellError.message}>{cellError.message}</CellErrorText>

                    {cellError.detail && (
                      <Tooltip title={cellError.detail} arrow placement="top">
                        <CellErrorInfoIcon aria-label="פירוט שגיאה">ⓘ</CellErrorInfoIcon>
                      </Tooltip>
                    )}
                  </CellErrorHeader>

                  <CellValueFlex>{display}</CellValueFlex>
                </CellErrorWrapper>
              );
            }

            return display;
          },
        };

        dynamicColumnsMap.set(columnId, col);
      });

      const metaColumnsMap = new Map<string, GridColDef>();

      metaColumnsMap.set(`${prefixes.Meta}index`, {
        field: `${prefixes.Meta}index`,
        headerName: "מזהה",
        renderHeader: () => (
          <HeaderFlex>
            <span>מזהה</span>
          </HeaderFlex>
        ),
        width: columnWidths.current[`${prefixes.Meta}index`] || 160,
        minWidth: 100,
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.index,
        ...getResponseMetaFilterColumnProps("index"),
      });

      metaColumnsMap.set(`${prefixes.Meta}created_by`, {
        field: `${prefixes.Meta}created_by`,
        headerName: "נוצר ע״י",
        width: columnWidths.current[`${prefixes.Meta}created_by`] || 200,
        minWidth: 150,
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.createdByName,
        ...getResponseMetaFilterColumnProps("created_by"),
      });

      metaColumnsMap.set(`${prefixes.Meta}created_at`, {
        field: `${prefixes.Meta}created_at`,
        headerName: "תאריך יצירה",
        width: columnWidths.current[`${prefixes.Meta}created_at`] || 200,
        minWidth: 150,
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.created,
        ...getResponseMetaFilterColumnProps("created_at"),
        renderCell: (params: GridRenderCellParams) =>
          params.value ? (
            <Box component="span" className="cell-box-date">
              <label>{moment(params.value).format(DEFAULT_DATE_TIME_FORMAT)}</label>
            </Box>
          ) : null,
      });

      metaColumnsMap.set(`${prefixes.Meta}pushed_to_metro`, {
        field: "sync",
        headerName: "",
        align: "left",
        headerAlign: "left",
        renderHeader: () => (
          <HeaderFlex sx={{ justifyContent: "flex-start", width: "100%" }}>
            <CloudIcon fontSize="small" />
          </HeaderFlex>
        ),
        minWidth: 150,
        width: columnWidths.current["sync"] || 150,
        editable: false,
        sortable: true,
        filterable: false,
        renderCell: (params: GridRenderCellParams) => (
          <SyncStatusIcon pushedToMetro={params.row?.pushed_to_metro} />
        ),
      });

      metaColumnsMap.set(`${prefixes.Meta}updated_by`, {
        field: `${prefixes.Meta}updated_by`,
        headerName: "השתנה ע״י",
        width: columnWidths.current[`${prefixes.Meta}updated_by`] || 200,
        minWidth: 150,
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.editedByName,
        ...getResponseMetaFilterColumnProps("updated_by"),
      });

      metaColumnsMap.set(`${prefixes.Meta}updated_at`, {
        field: `${prefixes.Meta}updated_at`,
        headerName: "תאריך שינוי",
        width: columnWidths.current[`${prefixes.Meta}updated_at`] || 200,
        minWidth: 150,
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.edited,
        ...getResponseMetaFilterColumnProps("updated_at"),
        renderCell: (params: GridRenderCellParams) =>
          params.value ? (
            <Box component="span" className="cell-box-date">
              <label>{moment(params.value).format(DEFAULT_DATE_TIME_FORMAT)}</label>
            </Box>
          ) : null,
      });

      metaColumnsMap.set(`${prefixes.Meta}id`, {
        field: `${prefixes.Meta}id`,
        headerName: "ID",
        width: columnWidths.current[`${prefixes.Meta}id`] || 150,
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.id,
        ...getResponseMetaFilterColumnProps("id"),
      });

      const structuralColumns: GridColDef[] = [
        metaColumnsMap.get(`${prefixes.Meta}index`)!,
        ...(expandColumn ? [{ ...expandColumn, filterable: false }] : []),
      ];

      const parentResponseColumns: GridColDef[] = hasParentResponses
        ? [
          {
            field: "parentResponse",
            headerName: "תגובת אב",
            width: columnWidths.current["parentResponse"] || 200,
            editable: false,
            filterable: false,
            sortable: false,
            renderCell: ({ row }: { row: Row }) => <ZoomCell row={row} form={form} />,
          },
        ]
        : [];

      let resultColumns: GridColDef[] = [];

      if (currentViewConfig && currentViewConfig.length > 0) {
        resultColumns = currentViewConfig
          .filter((vc) => vc.isVisible)
          .sort((a, b) => a.index - b.index)
          .map((vc) => {
            let columnId = "";

            if (vc.fieldId) {
              columnId = `${prefixes.Field}${vc.fieldId}`;
            } else if (vc.metaColumnId) {
              const metaName = Object.keys(MetaColumnIds).find(
                (key) => MetaColumnIds[key as keyof typeof MetaColumnIds] === vc.metaColumnId,
              );

              if (metaName) {
                columnId = `${prefixes.Meta}${metaName}`;
              }
            }

            // Skip index since it's now structural
            if (columnId === `${prefixes.Meta}index`) return undefined;

            if (dynamicColumnsMap.has(columnId)) return dynamicColumnsMap.get(columnId);
            if (metaColumnsMap.has(columnId)) return metaColumnsMap.get(columnId);

            return undefined;
          })
          .filter((col): col is GridColDef => col !== undefined);
      } else {
        resultColumns = [
          ...Array.from(dynamicColumnsMap.values()),
          metaColumnsMap.get(`${prefixes.Meta}pushed_to_metro`)!,
          metaColumnsMap.get(`${prefixes.Meta}created_by`)!,
          metaColumnsMap.get(`${prefixes.Meta}created_at`)!,
          metaColumnsMap.get(`${prefixes.Meta}updated_by`)!,
          metaColumnsMap.get(`${prefixes.Meta}updated_at`)!,
        ];
      }

      return [...structuralColumns, ...resultColumns, ...parentResponseColumns];
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
      navigateToCreateResponseCopy,
      navigate,
    ]);

    useEffect(() => {
      if (isRowsLoading || displayRows.length === 0 || isInEditMode) return;

      const timer = setTimeout(() => {
        apiRef.current?.autosizeColumns({
          includeHeaders: true,
          includeOutliers: true,
          expand: false,
        });
      }, 100);

      return () => clearTimeout(timer);
    }, [apiRef, isRowsLoading, displayRows.length]);

    const editableColumnFields = useMemo(
      () =>
        getFormColumns
          .filter((column) => Boolean(column.editable))
          .map((column) => column.field)
          .filter((field) => field !== "__check__" && field !== GRID_DETAIL_PANEL_TOGGLE_FIELD),
      [getFormColumns],
    );

    const getKeyboardNavigationTarget = useCallback(
      (
        rowId: string | number,
        field: string,
        action: KeyboardNavigationAction,
      ): { id: string | number; field: string } | null => {
        const rowIndex = localRows.findIndex((row) => String(row.id) === String(rowId));
        const columnIndex = editableColumnFields.indexOf(field);

        if (rowIndex === -1 || columnIndex === -1) {
          return null;
        }

        let nextRowIndex = rowIndex;
        let nextColumnIndex = columnIndex;

        const moveCell = (direction: 1 | -1) => {
          nextColumnIndex += direction;

          if (nextColumnIndex >= editableColumnFields.length) {
            nextColumnIndex = 0;
            nextRowIndex += 1;
          }

          if (nextColumnIndex < 0) {
            nextColumnIndex = editableColumnFields.length - 1;
            nextRowIndex -= 1;
          }
        };

        switch (action) {
          case "nextCell":
            moveCell(1);
            break;

          case "previousCell":
            moveCell(-1);
            break;

          case "nextRow":
            nextRowIndex += 1;
            break;

          case "previousRow":
            nextRowIndex -= 1;
            break;

          default:
            return null;
        }

        if (
          nextRowIndex < 0 ||
          nextRowIndex >= localRows.length ||
          nextColumnIndex < 0 ||
          nextColumnIndex >= editableColumnFields.length
        ) {
          return null;
        }

        return {
          id: localRows[nextRowIndex].id,
          field: editableColumnFields[nextColumnIndex],
        };
      },
      [editableColumnFields, localRows],
    );

    const openCellForEdit = useCallback(
      (rowId: string | number, field: string) => {
        const rowIndex = localRows.findIndex((row) => String(row.id) === String(rowId));
        const columnIndex = getFormColumns.findIndex((column) => column.field === field);

        requestAnimationFrame(() => {
          if (rowIndex !== -1 && columnIndex !== -1) {
            apiRef.current?.scrollToIndexes({
              rowIndex,
              colIndex: columnIndex,
            });
          }

          apiRef.current?.setCellFocus(rowId, field);

          setCellModesModel((prevModel) => {
            const nextModel: GridCellModesModel = {};

            Object.entries(prevModel).forEach(([modelRowId, fields]) => {
              nextModel[modelRowId] = {};

              Object.keys(fields).forEach((modelField) => {
                nextModel[modelRowId][modelField] = {
                  mode: GridCellModes.View,
                };
              });
            });

            return {
              ...nextModel,
              [rowId]: {
                ...(nextModel[rowId] || {}),
                [field]: { mode: GridCellModes.Edit },
              },
            };
          });
        });
      },
      [apiRef, getFormColumns, localRows],
    );

    const handleCellKeyDown = useCallback(
      (params: GridCellParams, event: any) => {
        if (!isInEditMode || !params.isEditable) {
          return;
        }

        if (
          params.field === "__check__" ||
          params.field === "expand" ||
          params.field === GRID_DETAIL_PANEL_TOGGLE_FIELD
        ) {
          return;
        }

        const isTextarea = isTextAreaTarget(event.target);
        let action: KeyboardNavigationAction | null = null;

        if (event.key === "Tab") {
          action = event.shiftKey ? "previousCell" : "nextCell";
        }

        if (event.key === "Enter") {
          if (isTextarea && !event.metaKey && !event.ctrlKey) {
            event.defaultMuiPrevented = true;
            return;
          }

          if (isTextarea && (event.metaKey || event.ctrlKey)) {
            action = event.shiftKey ? "previousRow" : "nextRow";
          }

          if (!isTextarea) {
            if (event.altKey || event.metaKey || event.ctrlKey) {
              return;
            }

            action = event.shiftKey ? "previousRow" : "nextRow";
          }
        }

        if (!isInputLikeTarget(event.target)) {
          if (event.key === "ArrowDown") {
            action = "nextRow";
          }

          if (event.key === "ArrowUp") {
            action = "previousRow";
          }

          if (event.key === "ArrowLeft") {
            action = "nextCell";
          }

          if (event.key === "ArrowRight") {
            action = "previousCell";
          }
        }

        if (!action) {
          return;
        }

        const targetCell = getKeyboardNavigationTarget(
          params.id as string | number,
          params.field,
          action,
        );

        if (!targetCell) {
          return;
        }

        event.preventDefault?.();
        event.stopPropagation?.();
        event.defaultMuiPrevented = true;

        try {
          apiRef.current?.stopCellEditMode({
            id: params.id,
            field: params.field,
          });
        } catch {
          // The cell may already be in view mode.
        }

        onCellEditStart();
        openCellForEdit(targetCell.id, targetCell.field);
      },
      [apiRef, getKeyboardNavigationTarget, isInEditMode, onCellEditStart, openCellForEdit],
    );

    const handlePageSizeChange = useCallback(
      (event: any) => {
        const newSize = Number(event.target.value);

        setFilter({
          ...filter,
          pageSize: newSize,
          before: undefined,
          after: undefined,
          pageNumber: 1,
        });
      },
      [filter, setFilter],
    );

    const CustomFooter = (): JSX.Element => {
      const pageNumber = filter?.pageNumber ?? 1;
      const pageSize = filter?.pageSize ?? 25;
      const totalCount = form?.responsesCount ?? 0;
      const currentRowsCount = displayRows.length;
      const startRange = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
      const endRange = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + currentRowsCount;

      return (
        <GridFooterContainer
          sx={{
            display: "flex",
            alignItems: "center",
            px: 3,
            py: 0.5,
            minHeight: "40px",
            borderTop: "none",
            direction: "rtl",
            gap: 4,
          }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="עמוד הבא">
              <span>
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <PaginationButton
                    onClick={handleNextPage}
                    disabled={
                      !pageInfo?.hasNextPage || isInEditMode || isRowsLoading || isNavigating
                    }
                    size="small">
                    <ArrowBackIosNewIcon />
                  </PaginationButton>
                </Box>
              </span>
            </Tooltip>

            <Tooltip title="עמוד קודם">
              <span>
                <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <PaginationButton
                    onClick={handlePreviousPage}
                    disabled={
                      !pageInfo?.hasPreviousPage ||
                      (filter?.pageNumber ?? 1) <= 1 ||
                      isInEditMode ||
                      isRowsLoading ||
                      isNavigating
                    }
                    size="small">
                    <ArrowForwardIosIcon />
                  </PaginationButton>
                </Box>
              </span>
            </Tooltip>
          </Stack>

          <Typography
            variant="body2"
            sx={{ fontWeight: 400, color: "#020618", fontSize: "0.875rem" }}>
            {endRange > 0
              ? `מציג ${endRange}-${startRange} תגובות מתוך ${totalCount}`
              : `מציג 0 תגובות מתוך ${totalCount}`}
          </Typography>

          <FooterInfoContainer sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 400, color: "#020618", fontSize: "0.875rem" }}>
              תגובות בעמוד
            </Typography>

            <Select
              value={filter?.pageSize ?? 25}
              onChange={handlePageSizeChange}
              size="small"
              variant="standard"
              disableUnderline
              sx={{
                minWidth: 30,
                fontSize: "0.875rem",
                textAlign: "center",
                fontWeight: 400,
                color: "#020618",
              }}
              disabled={isInEditMode}>
              {[10, 25, 50, 100].map((size) => (
                <MenuItem key={size} value={size}>
                  {size}
                </MenuItem>
              ))}
            </Select>
          </FooterInfoContainer>
        </GridFooterContainer>
      );
    };

    return (
      <ContentContainer>
        <MainContent>
          <TableContainer>
            <StyledDataGrid
              apiRef={apiRef}
              className={clsx({ "MuiDataGrid-root--edit-mode": isInEditMode })}
              disableColumnMenu={isInEditMode}
              disableColumnSorting={isInEditMode}
              disableColumnFilter={isInEditMode}
              disableColumnPinning
              headerFilters={shouldUseHeaderFilters}
              autosizeOptions={{
                includeHeaders: true,
                includeOutliers: true,
                expand: false,
              }}
              columnBufferPx={5000}
              initialState={{
                pinnedColumns: {
                  left: ["__check__", "meta:index", GRID_DETAIL_PANEL_TOGGLE_FIELD],
                },
              }}
              sortingMode="server"
              sortingOrder={["asc", "desc"]}
              onSortModelChange={handleSortModelChange}
              filterMode="server"
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              editMode="cell"
              cellModesModel={cellModesModel}
              onCellModesModelChange={handleCellModesModelChange}
              onCellClick={handleCellClick}
              onCellDoubleClick={handleCellDoubleClick}
              onCellKeyDown={handleCellKeyDown}
              processRowUpdate={handleProcessRowUpdate}
              onProcessRowUpdateError={(error) => {
                console.error("Error updating row:", error);
              }}
              getCellClassName={getCellClassName}
              rowHeight={49}
              getRowHeight={(params) => {
                const stringId = String(params.id);

                if (isInEditMode && activeEditingRowIds.has(stringId)) {
                  return "auto";
                }

                if (expandedRows[stringId]) {
                  return "auto";
                }

                return null;
              }}
              getEstimatedRowHeight={() => 72}
              columnHeaderHeight={40}
              loading={showTableSkeleton}
              checkboxSelection
              disableRowSelectionOnClick
              disableColumnResize
              onColumnWidthChange={handleColumnWidthChange}
              rowSelectionModel={rowSelectionModel}
              onRowSelectionModelChange={onRowSelectionModelChange}
              getRowClassName={(params) => {
                const classes: string[] = [];

                classes.push(
                  params.indexRelativeToCurrentPage % 2 === 0
                    ? "MuiDataGrid-row--even"
                    : "MuiDataGrid-row--odd",
                );

                if (isInEditMode) {
                  if (deletedRowIds.map(String).includes(String(params.id))) {
                    classes.push("pending-deletion-row");
                  }

                  if (activeEditingRowIds.has(String(params.id))) {
                    classes.push("active-editing-row");
                  }
                }

                return classes.join(" ");
              }}
              getRowId={(row) => row?.id}
              localeText={{
                ...heIL.components.MuiDataGrid.defaultProps.localeText,
                ...responseHeaderFilterLocaleText,
                noRowsLabel: "אין תגובות",
                columnMenuLabel: "פעולות",
                pinToLeft: "נעץ מימין",
                pinToRight: "נעץ משמאל",
              }}
              columns={getFormColumns}
              sortModel={sortModel}
              rows={displayRows}
              slots={{
                columnMenu: ResponsesColumnMenu,
                columnHeaderFilterIconButton: EmptyColumnHeaderFilterIconButton,
                columnFilteredIcon: EmptyColumnFilteredIcon,
                footer: CustomFooter,
              }}
              {...(hasFormInFormFields && {
                getDetailPanelContent,
                getDetailPanelHeight,
                detailPanelExpandedRowIds,
                onDetailPanelExpandedRowIdsChange: handleDetailPanelExpandedRowIdsChange,
              })}
              slotProps={{
                loadingOverlay: {
                  variant: "skeleton",
                  noRowsVariant: "skeleton",
                },
                columnMenu: {
                  showFilters,
                  activeFiltersCount,
                  disabled: isInEditMode,
                  onToggleFilters: handleToggleFilters,
                  onClearFilters: handleClearFilters,
                } as any,
                row: {},
              }}
              sx={{
                "& .MuiDataGrid-headerFilterCell": {
                  overflow: "hidden",
                  px: 0.5,
                  minWidth: 0,
                },
                "& .MuiDataGrid-headerFilterCell .MuiInputBase-root": {
                  backgroundColor: "transparent",
                  width: "100%",
                  minWidth: 0,
                },
                "& .MuiDataGrid-headerFilterCell .MuiFormControl-root": {
                  width: "100%",
                  minWidth: 0,
                },
                "& .MuiDataGrid-headerFilterCell .MuiStack-root": {
                  minWidth: 0,
                },
                "& .MuiDataGrid-headerFilterCell input": {
                  backgroundColor: "transparent",
                  minWidth: 0,
                },

                ...(isInEditMode
                  ? {
                    "& .active-editing-row .MuiDataGrid-cell": {
                      py: "4px",
                      alignItems: "center",
                    },
                    "& .active-editing-row .MuiDataGrid-cell--editing": {
                      p: "4px 6px",
                      overflow: "visible",
                    },
                    "& .active-editing-row .MuiDataGrid-cell--editing:focus-within": {
                      outline: "none",
                    },
                    "& .active-editing-row .MuiDataGrid-cell--editing .MuiInputBase-root": {
                      boxShadow: "none",
                    },
                  }
                  : {}),
              }}
            />
          </TableContainer>
        </MainContent>
      </ContentContainer>
    );
  },
);
