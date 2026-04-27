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
  GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
  GridSortModel,
} from "@mui/x-data-grid-pro";
import { useFormStore } from "../stores/form.store";
import clsx from "clsx";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CloudDoneIcon from "@mui/icons-material/CloudDone";
import CloudOffIcon from "@mui/icons-material/CloudOff";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
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
  IconButton,
  Stack,
  Typography,
  Select,
  Tooltip,
} from "@mui/material";
import { useCellEditors } from "../hooks/useCellEditors";
import { useCellDisplay } from "../hooks/useCellDisplay";
import { downloadFileFromResponse } from "@api/filesApi";
import {
  ContentContainer,
  MainContent,
  StyledDataGrid,
  SyncStatusIconBox,
  HeaderAsterisk,
  HeaderFlex,
  CellErrorWrapper,
  CellErrorText,
  CellValueFlex,
  PaginationContainer,
  FooterInfoContainer,
  PaginationButton,
} from "../styled";
import { useChildForms } from "../hooks/useChildForms";
import { useDetailPanel } from "../hooks/useDetailPanel";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { FormFieldDto } from "../../../types/shared";
import { FieldTypeIds, MetaColumnIds } from "../../../utils/interfaces";
import { DEFAULT_DATE_TIME_FORMAT } from "../../../utils/utils";
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
  currentView?: ResponsesView;
}

const SyncStatusIcon: React.FC<{ pushedToMetro?: string | null }> = ({ pushedToMetro }) => (
  <SyncStatusIconBox>
    {pushedToMetro ? <CloudDoneIcon fontSize="small" /> : <CloudOffIcon fontSize="small" />}
  </SyncStatusIconBox>
);

export const ResponsesTable = React.memo(
  ({
    isInEditMode,
    localRows,
    handleProcessRowUpdate,
    onCellEditStart,
    validationErrors,
    onCellLiveChange,
    onRowSelectionModelChange,
    currentView,
  }: ResponsesTableProps) => {
    const { form, rows, pageInfo, filter, setFilter, isRowsLoading } = useFormStore();
    const navigate = useNavigate();

    const currentViewConfig = useMemo(() => currentView?.columns || [], [currentView]);

    const [isNavigating, setIsNavigating] = useState(false);
    const transitionInProgress = useRef(false);
    const lastIntendedPageNumber = useRef(filter?.pageNumber ?? 1);
    const lastFetchStartedRef = useRef(false);

    // Sync ref with store filter
    useEffect(() => {
      lastIntendedPageNumber.current = filter?.pageNumber ?? 1;
    }, [filter?.pageNumber]);

    // Robust loading reset logic
    useEffect(() => {
      if (isRowsLoading) {
        lastFetchStartedRef.current = true;
      }

      if (!isRowsLoading && lastFetchStartedRef.current) {
        transitionInProgress.current = false;
        setIsNavigating(false);
        lastFetchStartedRef.current = false;
      }
    }, [isRowsLoading]);

    const handleNextPage = useCallback(() => {
      if (pageInfo?.hasNextPage && pageInfo.endCursor && !isRowsLoading && !transitionInProgress.current) {
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

    const formFields = useMemo<FormFieldDto[]>(
      () => (form?.sections ?? []).flatMap((section) => section.fields ?? []),
      [form],
    );

    const handleSortModelChange = useCallback(
      (newSortModel: GridSortModel) => {
        if (newSortModel.length > 0) {
          const { field, sort } = newSortModel[0];
          let sortBy: string;

          const columnPrefix = getGearConstant("column" + "Prefix") || {
            Field: "field:",
            Meta: "meta:",
          };
          const prefixes = {
            Field: columnPrefix.Field,
            Meta: columnPrefix.Meta,
          };

          const fieldObj = formFields.find((f) => f.displayName === field);
          if (fieldObj) {
            sortBy = `${prefixes.Field}${fieldObj.id}`;
          } else {
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

          setFilter({
            ...filter,
            sortBy,
            orderBy: sort?.toUpperCase() as any,
            before: undefined,
            after: undefined,
            pageNumber: 1,
          });
        } else {
          setFilter({
            ...filter,
            sortBy: undefined,
            orderBy: undefined,
            before: undefined,
            after: undefined,
            pageNumber: 1,
          });
        }
      },
      [formFields, filter, setFilter],
    );

    const apiRef = useGridApiRef();
    const [cellModesModel, setCellModesModel] = useState<GridCellModesModel>({});
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
      const prefixes = {
        Field: "field:",
        Meta: "meta:",
      };

      // 1. Build all possible columns
      const dynamicColumnsMap = new Map<string, GridColDef>();
      formFields.forEach((field) => {
        if (
          (field as any).typeId === FieldTypeIds.linkedForm ||
          field.fieldType === FieldTypeIds.linkedForm
        )
          return;

        const columnId = `${prefixes.Field}${field.id}`;
        const gridField = field.displayName || field.name || field.id;

        const col: GridColDef = {
          field: gridField,
          headerName: field.displayName,
          flex: 2,
          minWidth: 200,
          width: 400,
          editable: true,
          sortable: isSortable(field.fieldType),
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
                ? formatCellValue(params.value, field)
                : null;
            const display = content ?? <Box component="span" className="cell-box" />;

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
        dynamicColumnsMap.set(columnId, col);
      });

      const metaColumnsMap = new Map<string, GridColDef>();

      metaColumnsMap.set(`${prefixes.Meta}index`, {
        field: "index",
        headerName: "מזהה",
        width: 100,
        minWidth: 80,
        editable: false,
        sortable: true,
      });

      metaColumnsMap.set(`${prefixes.Meta}created_by`, {
        field: "createdByName",
        headerName: "נוצר ע״י",
        flex: 1,
        width: 200,
        minWidth: 150,
        editable: false,
        sortable: true,
      });

      metaColumnsMap.set(`${prefixes.Meta}created_at`, {
        field: "created",
        headerName: "תאריך יצירה",
        flex: 1,
        width: 200,
        minWidth: 150,
        editable: false,
        sortable: true,
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
        renderHeader: () => <CloudUploadIcon fontSize="large" />,
        minWidth: 150,
        editable: false,
        sortable: true,
        align: "center",
        headerAlign: "center",
        renderCell: (params: GridRenderCellParams) => (
          <SyncStatusIcon pushedToMetro={params.row?.pushed_to_metro} />
        ),
      });

      metaColumnsMap.set(`${prefixes.Meta}updated_by`, {
        field: "editedByName",
        headerName: "השתנה ע״י",
        flex: 1,
        width: 200,
        minWidth: 150,
        editable: false,
        sortable: true,
      });

      metaColumnsMap.set(`${prefixes.Meta}updated_at`, {
        field: "edited",
        headerName: "תאריך שינוי",
        flex: 1,
        width: 200,
        minWidth: 150,
        editable: false,
        sortable: true,
        renderCell: (params: GridRenderCellParams) =>
          params.value ? (
            <Box component="span" className="cell-box-date">
              <label>{moment(params.value).format(DEFAULT_DATE_TIME_FORMAT)}</label>
            </Box>
          ) : null,
      });

      // Special meta columns that are not in the standard list
      metaColumnsMap.set(`${prefixes.Meta}id`, {
        field: "id",
        headerName: "ID",
        width: 150,
        editable: false,
        sortable: true,
      });

      // Structural columns
      const structuralColumns: GridColDef[] = [
        ...(expandColumn ? [expandColumn] : []),
        ...(hasFormInFormFields
          ? [
              {
                ...GRID_DETAIL_PANEL_TOGGLE_COL_DEF,
                field: GRID_DETAIL_PANEL_TOGGLE_FIELD,
                renderHeader: (params: any) => (
                  <div aria-label={params?.colDef?.headerName ?? ""} />
                ),
              },
            ]
          : []),
      ];

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

      // 2. Resolve columns based on view config or default
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
              if (metaName) columnId = `${prefixes.Meta}${metaName}`;
            }

            if (dynamicColumnsMap.has(columnId)) return dynamicColumnsMap.get(columnId);
            if (metaColumnsMap.has(columnId)) return metaColumnsMap.get(columnId);

            return undefined;
          })
          .filter((col): col is GridColDef => col !== undefined);
      } else {
        // Default columns if no view config
        resultColumns = [
          metaColumnsMap.get(`${prefixes.Meta}index`)!,
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
    ]);

    const sortModel = useMemo((): GridSortModel => {
      const prefixes = {
        Field: "field:",
        Meta: "meta:",
      };

      // 1. If we have an active filter.sortBy, use it (highest priority)
      if (filter?.sortBy) {
        let gridField: string | undefined;
        if (filter.sortBy.startsWith(prefixes.Field)) {
          const fieldId = filter.sortBy.replace(prefixes.Field, "");
          const fieldObj = formFields.find((f) => String(f.id) === String(fieldId));
          gridField = fieldObj?.displayName || fieldObj?.name || fieldId;
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

      // 2. If we have a current view with a primary sort, use it
      if (currentView?.sortColumnId) {
        const sortedColumn = currentView.columns?.find(
          (col) => col.id === currentView.sortColumnId,
        );
        if (sortedColumn) {
          let gridField: string | undefined;
          if (sortedColumn.fieldId) {
            const fieldObj = formFields.find((f) => String(f.id) === String(sortedColumn.fieldId));
            gridField = fieldObj?.displayName || fieldObj?.name || sortedColumn.fieldId;
          } else if (sortedColumn.metaColumnId) {
            const metaName = Object.keys(MetaColumnIds).find(
              (key) =>
                MetaColumnIds[key as keyof typeof MetaColumnIds] === sortedColumn.metaColumnId,
            );
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
            return [{ field: gridField, sort: currentView.sortDirection || "asc" }];
          }
        }
      }

      const legacySort = currentView?.config?.columns?.find(
        (col) => col.sortDirection && col.sortOrder === 1,
      );
      if (legacySort) {
        let gridField = legacySort.columnId;
        const fieldObj = formFields.find(
          (f) => f.id === legacySort.columnId || (f as any).uniqueId === legacySort.columnId,
        );
        if (fieldObj) gridField = fieldObj.displayName || fieldObj.name || fieldObj.id;

        return [{ field: gridField, sort: legacySort.sortDirection as "asc" | "desc" }];
      }

      return [];
    }, [currentView, formFields, filter]);

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
      const startRange = totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1;
      const endRange = Math.min(pageNumber * pageSize, totalCount);

      return (
        <GridFooterContainer
          sx={{ justifyContent: "space-between", px: 3, py: 1.5, minHeight: "60px" }}>
          <FooterInfoContainer>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "#4a5568" }}>
              {`מציג ${endRange}-${startRange} תגובות מתוך ${totalCount}`}
            </Typography>
          </FooterInfoContainer>

          <Stack direction="row" spacing={2} alignItems="center">
            <FooterInfoContainer>
              <Select
                value={filter?.pageSize ?? 25}
                onChange={handlePageSizeChange}
                size="small"
                variant="standard"
                disableUnderline
                sx={{
                  minWidth: 40,
                  fontSize: "0.875rem",
                  textAlign: "center",
                  fontWeight: 600,
                  color: "#4a5568",
                }}
                disabled={isInEditMode}>
                {[10, 25, 50, 100].map((size) => (
                  <MenuItem key={size} value={size}>
                    {size}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#4a5568" }}>
                תגובות בעמוד
              </Typography>
            </FooterInfoContainer>

            <PaginationContainer>
              <Tooltip title="עמוד קודם">
                <span>
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
                </span>
              </Tooltip>

              <Tooltip title="עמוד הבא">
                <span>
                  <PaginationButton
                    onClick={handleNextPage}
                    disabled={
                      !pageInfo?.hasNextPage || isInEditMode || isRowsLoading || isNavigating
                    }
                    size="small">
                    <ArrowBackIosNewIcon />
                  </PaginationButton>
                </span>
              </Tooltip>
            </PaginationContainer>
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
            sortingOrder={["asc", "desc"]}
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
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
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
  },
);
