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
  GridColumnHeaderParams,
} from "@mui/x-data-grid-pro";
import { useFormStore, useInitiateFormStore } from "../stores/form.store";
import clsx from "clsx";
import { ArrowDown, ArrowDownUp, ArrowUp, Cloud, CloudOff, Pin, PinOff, RefreshCw } from "lucide-react";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { heIL } from "@mui/x-data-grid/locales";
import ZoomCell from "@components/formInForm/ZoomCell";
import { Box, IconButton, MenuItem, Stack, Typography, Select, Tooltip } from "@mui/material";
import RtlProvider from "@mui/system/RtlProvider";
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
import { FormFieldDto, ResponsesTableColorRuleDto } from "../../../types/shared";
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
  useResponsesTableFilters,
} from "./ResponsesFilters";
import { useConnectedFormOptions } from "@src/hooks/useConnectedFormOptions";
import {
  buildColorRuleMatches,
  COLOR_RULE_PALETTE,
  formatColorRuleLabel,
  getRangeValue,
  isRangeComparator,
  isRangeValue,
  ROW_COLOR_RULE_FIELD,
} from "../utils/colorRules";
import "./responsesTableFilters.css";
import { useAuth } from "../../../contexts/AuthContext";
import { readPinnedColumns, writePinnedColumns } from "../utils/columnPinningCache";

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

const SortUnsortedIcon = () => <ArrowDownUp size={16} strokeWidth={2.4} />;
const SortAscendingIcon = () => <ArrowUp size={16} strokeWidth={2.4} />;
const SortDescendingIcon = () => <ArrowDown size={16} strokeWidth={2.4} />;

const FIELD_COLUMN_WIDTH = 190;
const FIELD_COLUMN_MAX_WIDTH = 450;
const STRUCTURAL_PINNED_COLUMNS = [
  "__check__",
  GRID_DETAIL_PANEL_TOGGLE_FIELD,
] as const;

const getResponsiveColumnProps = (
  minWidth: number,
  savedWidth?: number,
  maxWidth?: number,
  flex = 1,
): Pick<GridColDef, "width" | "minWidth" | "maxWidth" | "flex"> => {
  if (savedWidth) {
    return {
      width: Math.max(savedWidth, minWidth),
      minWidth,
      maxWidth,
    };
  }

  return {
    minWidth,
    flex,
  };
};

type Row = GridRowModel & {
  id: string | number;
  parentResponse?: string | null;
  syncStatusId?: number | null;
  syncStatusDescription?: string | null;
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
  showFilters: boolean;
  activeFiltersCount: number;
  onToggleFilters: () => void;
  onClearFilters: () => void;
  colorRules?: ResponsesTableColorRuleDto[];
}

const getSyncStatusLabel = (
  statusId?: number | null,
  statusDescription?: string | null,
): string => {
  if (typeof statusId === "number") {
    return (
      Gear.SYNC_STATUS_HEBREW_LABELS[statusId as Gear.SyncStatusId] ??
      statusDescription ??
      "סטטוס סנכרון לא ידוע"
    );
  }

  return statusDescription ?? "סטטוס סנכרון לא ידוע";
};

const SyncStatusIcon: React.FC<{
  statusId?: number | null;
  statusDescription?: string | null;
  disableTooltip?: boolean;
}> = ({ statusId, statusDescription, disableTooltip = false }) => {
  const label = getSyncStatusLabel(statusId, statusDescription);

  const icon =
    statusId === Gear.syncStatus.Completed ? (
      <Cloud size={18} strokeWidth={2.4} />
    ) : statusId === Gear.syncStatus.Failed ? (
      <CloudOff size={18} strokeWidth={2.4} color={"#E7000B"} />
    ) : (
      <RefreshCw size={18} strokeWidth={2.4} />
    );

  const iconContent = <SyncStatusIconBox>{icon}</SyncStatusIconBox>;

  if (disableTooltip) return iconContent;

  return (
    <Tooltip title={label} arrow placement="top">
      {iconContent}
    </Tooltip>
  );
};

const hasOverflowingText = (root: HTMLElement | null): boolean => {
  if (!root) return false;

  const elements = [root, ...Array.from(root.querySelectorAll<HTMLElement>("*"))];

  return elements.some((element) => {
    if (!element.textContent?.trim()) return false;

    return (
      element.scrollWidth > element.clientWidth + 1 ||
      element.scrollHeight > element.clientHeight + 1
    );
  });
};

const ColorRuleTooltipCell: React.FC<{
  children: React.ReactNode;
  cellTooltipText?: string;
  ruleTooltipText: string;
}> = ({ children, cellTooltipText, ruleTooltipText }) => {
  const contentRef = useRef<HTMLSpanElement | null>(null);
  const [showCellTooltipText, setShowCellTooltipText] = useState(false);

  if (!ruleTooltipText) {
    return <>{children}</>;
  }

  const title = (
    <Box sx={{ whiteSpace: "pre-line" }}>
      {showCellTooltipText && cellTooltipText && (
        <Box component="span" sx={{ display: "block", fontWeight: 400 }}>
          {cellTooltipText}
        </Box>
      )}
      <Box component="span" sx={{ display: "block", fontWeight: showCellTooltipText ? 700 : 400 }}>
        {ruleTooltipText}
      </Box>
    </Box>
  );

  return (
    <Tooltip title={title} arrow placement="top">
      <Box
        ref={contentRef}
        component="span"
        className="cell-box"
        onMouseEnter={() => {
          setShowCellTooltipText(
            Boolean(cellTooltipText) && hasOverflowingText(contentRef.current),
          );
        }}
        sx={{
          width: "100%",
          alignSelf: "stretch",
          display: "flex",
          alignItems: "center",
        }}>
        {children}
      </Box>
    </Tooltip>
  );
};

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
    showFilters,
    activeFiltersCount,
    onToggleFilters,
    onClearFilters,
    colorRules = [],
  }: ResponsesTableProps) => {
    const { form, rows, pageInfo, filter, setFilter, setResponseFilters, isRowsLoading } =
      useFormStore();
    const { user } = useAuth();

    const navigate = useNavigate();

    const baseDisplayRows = useMemo(() => {
      let baseRows = isInEditMode && localRows.length > 0 ? localRows : rows;

      if (isInEditMode && deletedRowIds.length > 0) {
        const deletedSet = new Set(deletedRowIds.map(String));
        return baseRows.filter((row) => !deletedSet.has(String(row.id)));
      }

      return baseRows;
    }, [isInEditMode, localRows, rows, deletedRowIds]);

    const currentViewConfig = useMemo(() => currentView?.columns || [], [currentView]);
    const colorRuleMatches = useMemo(
      () => buildColorRuleMatches(baseDisplayRows, colorRules),
      [baseDisplayRows, colorRules],
    );
    const colorRulesById = useMemo(
      () => new Map(colorRules.map((colorRule) => [colorRule.id, colorRule])),
      [colorRules],
    );
    const displayRows = baseDisplayRows;

    if (!form) return null;

    const userIdentifier =
      user?.upn ?? user?.email ?? user?.UPN ?? user?.mail;
    const [pinnedColumnFields, setPinnedColumnFields] = useState<string[]>(() =>
      readPinnedColumns(userIdentifier, form.id),
    );

    const toggleColumnPin = useCallback((field: string) => {
      setPinnedColumnFields((currentFields) =>
        currentFields.includes(field)
          ? currentFields.filter((currentField) => currentField !== field)
          : [...currentFields, field],
      );
    }, []);

    const [isNavigating, setIsNavigating] = useState(false);

    const transitionInProgress = useRef(false);
    const lastIntendedPageNumber = useRef(filter?.pageNumber ?? 1);
    const lastFetchStartedRef = useRef(false);
    const horizontalScrollbarTrackRef = useRef<HTMLDivElement | null>(null);
    const horizontalScrollbarThumbRef = useRef<HTMLDivElement | null>(null);
    const horizontalScrollbarFrame = useRef<number | null>(null);
    const verticalScrollbarTrackRef = useRef<HTMLDivElement | null>(null);
    const verticalScrollbarThumbRef = useRef<HTMLDivElement | null>(null);
    const verticalScrollbarFrame = useRef<number | null>(null);

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

    const formFields = useMemo<FormFieldDto[]>(() => {
      const sectionsFields = (form?.sections ?? []).flatMap((section) => section.fields ?? []);
      if (sectionsFields.length > 0) return sectionsFields;
      return form?.fields ?? [];
    }, [form]);

    const formFieldsById = useMemo(
      () => new Map(formFields.map((field) => [String(field.id), field])),
      [formFields],
    );

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
      let scroller: HTMLElement | null = null;
      let root: HTMLElement | null = null;
      let initFrame: number | null = null;
      let cancelled = false;
      let isDragging = false;
      let dragStartClientX = 0;
      let dragStartThumbLeft = 0;
      let isVerticalDragging = false;
      let verticalDragStartClientY = 0;
      let verticalDragStartThumbTop = 0;

      const getScrollRange = (element: HTMLElement) =>
        Math.max(element.scrollWidth - element.clientWidth, 0);

      const getNormalizedScrollLeft = (element: HTMLElement) => {
        const maxScrollLeft = getScrollRange(element);

        if (maxScrollLeft <= 0) return 0;

        const direction = window.getComputedStyle(element).direction;

        if (direction === "rtl") {
          return element.scrollLeft <= 0
            ? maxScrollLeft - Math.min(Math.abs(element.scrollLeft), maxScrollLeft)
            : Math.min(element.scrollLeft, maxScrollLeft);
        }

        return Math.min(Math.max(element.scrollLeft, 0), maxScrollLeft);
      };

      const setNormalizedScrollLeft = (element: HTMLElement, normalizedLeft: number) => {
        const maxScrollLeft = getScrollRange(element);
        const nextLeft = Math.min(Math.max(normalizedLeft, 0), maxScrollLeft);
        const direction = window.getComputedStyle(element).direction;

        if (direction === "rtl") {
          element.scrollLeft = element.scrollLeft <= 0 ? nextLeft - maxScrollLeft : nextLeft;
          return;
        }

        element.scrollLeft = nextLeft;
      };

      const updateHorizontalScrollbar = () => {
        const currentScroller = scroller;

        if (!currentScroller || horizontalScrollbarFrame.current !== null) return;

        horizontalScrollbarFrame.current = window.requestAnimationFrame(() => {
          horizontalScrollbarFrame.current = null;

          const track = horizontalScrollbarTrackRef.current;
          const thumb = horizontalScrollbarThumbRef.current;

          if (!currentScroller || !track || !thumb) return;

          const maxScrollLeft = getScrollRange(currentScroller);

          if (maxScrollLeft <= 1) {
            track.style.display = "none";
            return;
          }

          const containerRect = track.parentElement?.getBoundingClientRect();
          const scrollerRect = currentScroller.getBoundingClientRect();

          if (!containerRect || scrollerRect.width <= 0 || scrollerRect.height <= 0) {
            track.style.display = "none";
            return;
          }

          const trackHeight = 14;
          const trackWidth = scrollerRect.width;
          const thumbWidth = Math.max(
            (currentScroller.clientWidth / currentScroller.scrollWidth) * trackWidth,
            64,
          );
          const maxThumbLeft = Math.max(trackWidth - thumbWidth, 0);
          const normalizedLeft = getNormalizedScrollLeft(currentScroller);
          const thumbLeft = maxScrollLeft > 0 ? (normalizedLeft / maxScrollLeft) * maxThumbLeft : 0;

          track.style.display = "block";
          track.style.left = `${scrollerRect.left - containerRect.left}px`;
          track.style.right = "auto";
          track.style.top = `${scrollerRect.bottom - containerRect.top - trackHeight}px`;
          track.style.width = `${trackWidth}px`;
          track.style.height = `${trackHeight}px`;

          thumb.style.left = "0px";
          thumb.style.right = "auto";
          thumb.style.width = `${thumbWidth}px`;
          thumb.style.transform = `translate3d(${thumbLeft}px, 0, 0)`;
        });
      };

      const updateVerticalScrollbar = () => {
        const currentScroller = scroller;

        if (!currentScroller || verticalScrollbarFrame.current !== null) return;

        verticalScrollbarFrame.current = window.requestAnimationFrame(() => {
          verticalScrollbarFrame.current = null;

          const track = verticalScrollbarTrackRef.current;
          const thumb = verticalScrollbarThumbRef.current;

          if (!currentScroller || !track || !thumb) return;

          const maxScrollTop = currentScroller.scrollHeight - currentScroller.clientHeight;

          if (maxScrollTop <= 1) {
            track.style.display = "none";
            return;
          }

          const containerRect = track.parentElement?.getBoundingClientRect();
          const scrollerRect = currentScroller.getBoundingClientRect();

          if (!containerRect || scrollerRect.width <= 0 || scrollerRect.height <= 0) {
            track.style.display = "none";
            return;
          }

          const hasHorizontalOverflow = getScrollRange(currentScroller) > 1;
          const horizontalScrollbarHeight = hasHorizontalOverflow ? 14 : 0;
          const trackWidth = 14;
          const trackHeight = Math.max(scrollerRect.height - horizontalScrollbarHeight, 48);
          const thumbHeight = Math.max(
            (currentScroller.clientHeight / currentScroller.scrollHeight) * trackHeight,
            48,
          );
          const maxThumbTop = Math.max(trackHeight - thumbHeight, 0);
          const thumbTop = (currentScroller.scrollTop / maxScrollTop) * maxThumbTop;

          track.style.display = "block";
          track.style.left = `${scrollerRect.left - containerRect.left}px`;
          track.style.right = "auto";
          track.style.top = `${scrollerRect.top - containerRect.top}px`;
          track.style.width = `${trackWidth}px`;
          track.style.height = `${trackHeight}px`;

          thumb.style.left = "2px";
          thumb.style.right = "auto";
          thumb.style.height = `${thumbHeight}px`;
          thumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`;
        });
      };

      const getThumbLeft = () => {
        const thumb = horizontalScrollbarThumbRef.current;
        if (!thumb) return 0;

        const transform = window.getComputedStyle(thumb).transform;
        if (!transform || transform === "none") return 0;

        const matrix = new DOMMatrixReadOnly(transform);
        return matrix.m41;
      };

      const getVerticalThumbTop = () => {
        const thumb = verticalScrollbarThumbRef.current;
        if (!thumb) return 0;

        const transform = window.getComputedStyle(thumb).transform;
        if (!transform || transform === "none") return 0;

        const matrix = new DOMMatrixReadOnly(transform);
        return matrix.m42;
      };

      const scrollToThumbPosition = (thumbLeft: number) => {
        if (!scroller) return;

        const track = horizontalScrollbarTrackRef.current;
        const thumb = horizontalScrollbarThumbRef.current;
        if (!track || !thumb) return;

        const maxThumbLeft = Math.max(track.clientWidth - thumb.offsetWidth, 0);
        const ratio =
          maxThumbLeft > 0 ? Math.min(Math.max(thumbLeft, 0), maxThumbLeft) / maxThumbLeft : 0;

        setNormalizedScrollLeft(scroller, ratio * getScrollRange(scroller));
      };

      const scrollToVerticalThumbPosition = (thumbTop: number) => {
        if (!scroller) return;

        const track = verticalScrollbarTrackRef.current;
        const thumb = verticalScrollbarThumbRef.current;
        if (!track || !thumb) return;

        const maxThumbTop = Math.max(track.clientHeight - thumb.offsetHeight, 0);
        const ratio =
          maxThumbTop > 0 ? Math.min(Math.max(thumbTop, 0), maxThumbTop) / maxThumbTop : 0;

        scroller.scrollTop = ratio * Math.max(scroller.scrollHeight - scroller.clientHeight, 0);
      };

      const handleTrackPointerDown = (event: PointerEvent) => {
        const track = horizontalScrollbarTrackRef.current;
        const thumb = horizontalScrollbarThumbRef.current;
        if (!track || !thumb || !scroller) return;

        event.preventDefault();

        const thumbRect = thumb.getBoundingClientRect();
        const nextThumbLeft =
          event.clientX - track.getBoundingClientRect().left - thumbRect.width / 2;

        scrollToThumbPosition(nextThumbLeft);
        updateHorizontalScrollbar();
      };

      const handleVerticalTrackPointerDown = (event: PointerEvent) => {
        const track = verticalScrollbarTrackRef.current;
        const thumb = verticalScrollbarThumbRef.current;
        if (!track || !thumb || !scroller) return;

        event.preventDefault();

        const thumbRect = thumb.getBoundingClientRect();
        const nextThumbTop =
          event.clientY - track.getBoundingClientRect().top - thumbRect.height / 2;

        scrollToVerticalThumbPosition(nextThumbTop);
        updateVerticalScrollbar();
      };

      const handleThumbPointerDown = (event: PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();

        isDragging = true;
        dragStartClientX = event.clientX;
        dragStartThumbLeft = getThumbLeft();
        horizontalScrollbarThumbRef.current?.setPointerCapture(event.pointerId);
      };

      const handleVerticalThumbPointerDown = (event: PointerEvent) => {
        event.preventDefault();
        event.stopPropagation();

        isVerticalDragging = true;
        verticalDragStartClientY = event.clientY;
        verticalDragStartThumbTop = getVerticalThumbTop();
        verticalScrollbarThumbRef.current?.setPointerCapture(event.pointerId);
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!isDragging) return;

        event.preventDefault();
        scrollToThumbPosition(dragStartThumbLeft + event.clientX - dragStartClientX);
        updateHorizontalScrollbar();
      };

      const handleVerticalPointerMove = (event: PointerEvent) => {
        if (!isVerticalDragging) return;

        event.preventDefault();
        scrollToVerticalThumbPosition(
          verticalDragStartThumbTop + event.clientY - verticalDragStartClientY,
        );
        updateVerticalScrollbar();
      };

      const handlePointerUp = (event: PointerEvent) => {
        if (!isDragging) return;

        isDragging = false;
        horizontalScrollbarThumbRef.current?.releasePointerCapture(event.pointerId);
      };

      const handleVerticalPointerUp = (event: PointerEvent) => {
        if (!isVerticalDragging) return;

        isVerticalDragging = false;
        verticalScrollbarThumbRef.current?.releasePointerCapture(event.pointerId);
      };

      const init = () => {
        if (cancelled) return;

        root = apiRef.current?.rootElementRef?.current ?? null;
        scroller = root?.querySelector(".MuiDataGrid-virtualScroller") as HTMLElement | null;

        if (!root || !scroller) {
          initFrame = window.requestAnimationFrame(init);
          return;
        }

        updateHorizontalScrollbar();
        updateVerticalScrollbar();
        scroller.addEventListener("scroll", updateHorizontalScrollbar, { passive: true });
        scroller.addEventListener("scroll", updateVerticalScrollbar, { passive: true });
        window.addEventListener("resize", updateHorizontalScrollbar);
        window.addEventListener("resize", updateVerticalScrollbar);
        horizontalScrollbarTrackRef.current?.addEventListener(
          "pointerdown",
          handleTrackPointerDown,
        );
        horizontalScrollbarThumbRef.current?.addEventListener(
          "pointerdown",
          handleThumbPointerDown,
        );
        verticalScrollbarTrackRef.current?.addEventListener(
          "pointerdown",
          handleVerticalTrackPointerDown,
        );
        verticalScrollbarThumbRef.current?.addEventListener(
          "pointerdown",
          handleVerticalThumbPointerDown,
        );
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointermove", handleVerticalPointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointerup", handleVerticalPointerUp);
      };

      initFrame = window.requestAnimationFrame(init);

      return () => {
        cancelled = true;

        if (initFrame !== null) {
          window.cancelAnimationFrame(initFrame);
        }

        if (horizontalScrollbarFrame.current !== null) {
          window.cancelAnimationFrame(horizontalScrollbarFrame.current);
          horizontalScrollbarFrame.current = null;
        }

        if (verticalScrollbarFrame.current !== null) {
          window.cancelAnimationFrame(verticalScrollbarFrame.current);
          verticalScrollbarFrame.current = null;
        }

        scroller?.removeEventListener("scroll", updateHorizontalScrollbar);
        scroller?.removeEventListener("scroll", updateVerticalScrollbar);
        window.removeEventListener("resize", updateHorizontalScrollbar);
        window.removeEventListener("resize", updateVerticalScrollbar);
        horizontalScrollbarTrackRef.current?.removeEventListener(
          "pointerdown",
          handleTrackPointerDown,
        );
        horizontalScrollbarThumbRef.current?.removeEventListener(
          "pointerdown",
          handleThumbPointerDown,
        );
        verticalScrollbarTrackRef.current?.removeEventListener(
          "pointerdown",
          handleVerticalTrackPointerDown,
        );
        verticalScrollbarThumbRef.current?.removeEventListener(
          "pointerdown",
          handleVerticalThumbPointerDown,
        );
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointermove", handleVerticalPointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointerup", handleVerticalPointerUp);
      };
    }, [
      apiRef,
      currentViewConfig.length,
      displayRows.length,
      form?.fields?.length,
      form?.sections?.length,
      isInEditMode,
      showTableSkeleton,
    ]);

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

    const filteredCellModesModel = useMemo(() => {
      if (!isInEditMode) {
        return {};
      }

      const validRowIds = new Set(displayRows.map((row) => String(row.id)));
      const filtered: GridCellModesModel = {};

      Object.entries(cellModesModel).forEach(([rowId, fields]) => {
        if (validRowIds.has(String(rowId))) {
          filtered[rowId] = fields;
        }
      });

      return filtered;
    }, [cellModesModel, displayRows, isInEditMode]);

    useEffect(() => {
      if (!isInEditMode && Object.keys(cellModesModel).length > 0) {
        setCellModesModel({});
      }
    }, [cellModesModel, isInEditMode]);

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

      Object.entries(filteredCellModesModel).forEach(([rowId, fields]) => {
        const isRowEditing = Object.values(fields).some(
          (fieldMode) => fieldMode.mode === GridCellModes.Edit,
        );

        if (isRowEditing) {
          rowIds.add(String(rowId));
        }
      });

      return rowIds;
    }, [filteredCellModesModel]);

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

    const { formatCellValue, formatCellTooltipValue } = useCellDisplay({
      formId: form?.id,
      onFileClick: handleFileClick,
      searchQuery: filter?.query,
      isInEditMode,
      onCellExpandToggle: handleCellExpandToggle,
    });

    const formatColorRuleTooltipText = useCallback(
      (ruleId: string): string => {
        const rule = colorRulesById.get(ruleId);

        if (!rule) return "";

        const ruleField = formFieldsById.get(String(rule.fieldId));
        const targetValueLabel =
          isRangeComparator(rule.comparatorId) && isRangeValue(rule.targetValue)
            ? (() => {
                const { from, to } = getRangeValue(rule.targetValue);
                const fromLabel =
                  ruleField && from ? formatCellTooltipValue(from, ruleField) : from;
                const toLabel = ruleField && to ? formatCellTooltipValue(to, ruleField) : to;

                if (!fromLabel && !toLabel) return "";

                return `${fromLabel} - ${toLabel}`;
              })()
            : ruleField &&
                rule.targetValue !== null &&
                rule.targetValue !== undefined &&
                rule.targetValue !== ""
              ? formatCellTooltipValue(rule.targetValue, ruleField)
              : "";
        const colorLabel = COLOR_RULE_PALETTE[rule.color]?.label ?? "";
        const conditionText = formatColorRuleLabel(rule, ruleField, formFields, targetValueLabel);

        return [conditionText, colorLabel].filter(Boolean).join(" ← ");
      },
      [colorRulesById, formFields, formFieldsById, formatCellTooltipValue],
    );

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
        const rowMatches = colorRuleMatches[String(params.id)] ?? {};
        const colorMatch = rowMatches[params.field] ?? rowMatches[ROW_COLOR_RULE_FIELD];
        const colorClass = colorMatch
          ? `response-color-rule-cell response-color-rule-cell--${colorMatch.color}`
          : "";

        if (!isInEditMode || params.field === "__check__") {
          return colorClass;
        }

        const hasError = !!validationErrors?.[params.id]?.[params.field];
        const editableClass = params.isEditable
          ? "MuiDataGrid-cell--editable"
          : "MuiDataGrid-cell--non-editable-in-edit-mode";
        const classes = `${editableClass}${colorClass ? ` ${colorClass}` : ""}`;

        return hasError ? `${classes} cell--has-error` : classes;
      },
      [colorRuleMatches, isInEditMode, validationErrors],
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
      const getColorMatchForCell = (params: GridRenderCellParams) => {
        const rowMatches = colorRuleMatches[String(params.id)] ?? {};

        return rowMatches[params.field] ?? rowMatches[ROW_COLOR_RULE_FIELD];
      };
      const renderDisplayWithColorRuleTooltip = (
        params: GridRenderCellParams,
        display: React.ReactNode,
        cellTooltipText?: string,
      ): React.ReactNode => {
        const colorMatch = getColorMatchForCell(params);
        const ruleTooltipText = colorMatch ? formatColorRuleTooltipText(colorMatch.ruleId) : "";

        if (!ruleTooltipText) return display;

        return (
          <ColorRuleTooltipCell cellTooltipText={cellTooltipText} ruleTooltipText={ruleTooltipText}>
            {display}
          </ColorRuleTooltipCell>
        );
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
          headerClassName: "response-field-column-header",
          ...getResponsiveColumnProps(
            FIELD_COLUMN_WIDTH,
            columnWidths.current[gridField],
            FIELD_COLUMN_MAX_WIDTH,
          ),
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
            const colorMatch = getColorMatchForCell(params);

            const content =
              params.value !== undefined && params.value !== null
                ? formatCellValue(params.value, field, rowId, {
                    disableTooltip: !!colorMatch,
                  })
                : null;

            const display = content ?? <Box component="span" className="cell-box" />;
            const displayWithTooltip = renderDisplayWithColorRuleTooltip(
              params,
              display,
              formatCellTooltipValue(params.value, field),
            );

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

                  <CellValueFlex>{displayWithTooltip}</CellValueFlex>
                </CellErrorWrapper>
              );
            }

            return displayWithTooltip;
          },
        };

        dynamicColumnsMap.set(columnId, col);
      });

      const metaColumnsMap = new Map<string, GridColDef>();

      metaColumnsMap.set(`${prefixes.Meta}index`, {
        field: `${prefixes.Meta}index`,
        headerName: "מזהה",
        headerClassName: "response-index-column-header",
        renderHeader: () => (
          <HeaderFlex>
            <span>מזהה</span>
          </HeaderFlex>
        ),
        width: columnWidths.current[`${prefixes.Meta}index`] || 190,
        minWidth: 170,
        maxWidth: 220,
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.index,
        renderCell: (params: GridRenderCellParams) =>
          renderDisplayWithColorRuleTooltip(
            params,
            <Box component="span" className="cell-box" dir="ltr">
              {params.value}
            </Box>,
            String(params.value ?? ""),
          ),
        ...getResponseMetaFilterColumnProps("index"),
      });

      metaColumnsMap.set(`${prefixes.Meta}created_by`, {
        field: `${prefixes.Meta}created_by`,
        headerName: "נוצר ע״י",
        ...getResponsiveColumnProps(
          180,
          columnWidths.current[`${prefixes.Meta}created_by`],
          280,
          0.9,
        ),
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.createdByName,
        renderCell: (params: GridRenderCellParams) =>
          renderDisplayWithColorRuleTooltip(
            params,
            <Box component="span" className="cell-box">
              {params.value}
            </Box>,
            String(params.value ?? ""),
          ),
        ...getResponseMetaFilterColumnProps("created_by"),
      });

      metaColumnsMap.set(`${prefixes.Meta}created_at`, {
        field: `${prefixes.Meta}created_at`,
        headerName: "תאריך יצירה",
        ...getResponsiveColumnProps(190, columnWidths.current[`${prefixes.Meta}created_at`], 300),
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.created,
        ...getResponseMetaFilterColumnProps("created_at"),
        renderCell: (params: GridRenderCellParams) => {
          const displayValue = params.value
            ? moment(params.value).format(DEFAULT_DATE_TIME_FORMAT)
            : "";

          return renderDisplayWithColorRuleTooltip(
            params,
            displayValue ? (
              <Box component="span" className="cell-box-date">
                <label>{displayValue}</label>
              </Box>
            ) : null,
            displayValue,
          );
        },
      });

      metaColumnsMap.set(`${prefixes.Meta}pushed_to_metro`, {
        field: "sync",
        headerName: "",
        align: "left",
        headerAlign: "left",
        renderHeader: () => (
          <Tooltip title="סטטוס סנכרון">
            <SyncStatusIconBox>
              <Cloud size={20} strokeWidth={2.4} />
            </SyncStatusIconBox>
          </Tooltip>
        ),
        minWidth: 90,
        width: columnWidths.current["sync"] || 90,
        maxWidth: 110,
        editable: false,
        sortable: true,
        filterable: false,
        renderCell: (params: GridRenderCellParams) =>
          renderDisplayWithColorRuleTooltip(
            params,
            <SyncStatusIcon
              statusId={params.row?.syncStatusId}
              statusDescription={params.row?.syncStatusDescription}
              disableTooltip={!!getColorMatchForCell(params)}
            />,
            getSyncStatusLabel(params.row?.syncStatusId, params.row?.syncStatusDescription),
          ),
      });

      metaColumnsMap.set(`${prefixes.Meta}updated_by`, {
        field: `${prefixes.Meta}updated_by`,
        headerName: "השתנה ע״י",
        ...getResponsiveColumnProps(
          180,
          columnWidths.current[`${prefixes.Meta}updated_by`],
          280,
          0.9,
        ),
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.editedByName,
        renderCell: (params: GridRenderCellParams) =>
          renderDisplayWithColorRuleTooltip(
            params,
            <Box component="span" className="cell-box">
              {params.value}
            </Box>,
            String(params.value ?? ""),
          ),
        ...getResponseMetaFilterColumnProps("updated_by"),
      });

      metaColumnsMap.set(`${prefixes.Meta}updated_at`, {
        field: `${prefixes.Meta}updated_at`,
        headerName: "תאריך שינוי",
        ...getResponsiveColumnProps(190, columnWidths.current[`${prefixes.Meta}updated_at`], 300),
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.edited,
        ...getResponseMetaFilterColumnProps("updated_at"),
        renderCell: (params: GridRenderCellParams) => {
          const displayValue = params.value
            ? moment(params.value).format(DEFAULT_DATE_TIME_FORMAT)
            : "";

          return renderDisplayWithColorRuleTooltip(
            params,
            displayValue ? (
              <Box component="span" className="cell-box-date">
                <label>{displayValue}</label>
              </Box>
            ) : null,
            displayValue,
          );
        },
      });

      metaColumnsMap.set(`${prefixes.Meta}id`, {
        field: `${prefixes.Meta}id`,
        headerName: "ID",
        ...getResponsiveColumnProps(180, columnWidths.current[`${prefixes.Meta}id`], 300, 0.9),
        editable: false,
        sortable: true,
        valueGetter: (_value, row: Row) => row.id,
        renderCell: (params: GridRenderCellParams) =>
          renderDisplayWithColorRuleTooltip(
            params,
            <Box component="span" className="cell-box" dir="ltr">
              {params.value}
            </Box>,
            String(params.value ?? ""),
          ),
        ...getResponseMetaFilterColumnProps("id"),
      });

      const indexColumnConfig = currentViewConfig?.find((vc) => vc.metaColumnId === 1);
      const isIndexVisible = indexColumnConfig ? indexColumnConfig.isVisible : true;

      const structuralColumns: GridColDef[] = [
        ...(isIndexVisible ? [metaColumnsMap.get(`${prefixes.Meta}index`)!] : []),
        ...(expandColumn ? [{ ...expandColumn, filterable: false }] : []),
      ];

      const parentResponseColumns: GridColDef[] = hasParentResponses
        ? [
            {
              field: "parentResponse",
              headerName: "תגובת אב",
              ...getResponsiveColumnProps(190, columnWidths.current["parentResponse"]),
              editable: false,
              filterable: false,
              sortable: false,
              renderCell: (params: GridRenderCellParams) =>
                renderDisplayWithColorRuleTooltip(
                  params,
                  <ZoomCell row={params.row} form={form} />,
                ),
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

      const columnsInOriginalOrder = [
        ...structuralColumns,
        ...resultColumns,
        ...parentResponseColumns,
      ];
      const columnsWithPinning = columnsInOriginalOrder.map((column) => {
        if (column.field === GRID_DETAIL_PANEL_TOGGLE_FIELD) return column;

        const originalRenderHeader = column.renderHeader;

        return {
          ...column,
          headerClassName: clsx(column.headerClassName, "response-pinnable-column-header"),
          renderHeader: (params: GridColumnHeaderParams) => {
            const isPinned = pinnedColumnFields.includes(column.field);
            const headerContent = originalRenderHeader
              ? originalRenderHeader(params)
              : <span>{column.headerName}</span>;

            return (
              <Box className="response-pinnable-header-content">
                <Box className="response-pinnable-header-label">{headerContent}</Box>
                <Tooltip title={isPinned ? "בטל נעיצה" : "נעץ עמודה"} arrow>
                  <IconButton
                    className="response-column-pin-button"
                    size="small"
                    aria-label={isPinned ? "בטל נעיצה" : "נעץ עמודה"}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleColumnPin(column.field);
                    }}
                    onMouseDown={(event) => event.stopPropagation()}>
                    {isPinned ? <PinOff size={17} /> : <Pin size={17} />}
                  </IconButton>
                </Tooltip>
              </Box>
            );
          },
        };
      });

      return columnsWithPinning;
    }, [
      form,
      formFields,
      hasParentResponses,
      expandColumn,
      hasFormInFormFields,
      isInEditMode,
      validationErrors,
      colorRuleMatches,
      renderEditCell,
      formatCellValue,
      formatCellTooltipValue,
      formatColorRuleTooltipText,
      currentViewConfig,
      navigateToCreateResponseCopy,
      navigate,
      pinnedColumnFields,
      toggleColumnPin,
    ]);

    const orderedPinnedColumnFields = useMemo(() => {
      const selectedFields = new Set(pinnedColumnFields);
      return getFormColumns
        .map((column) => column.field)
        .filter(
          (field) =>
            selectedFields.has(field) &&
            !(STRUCTURAL_PINNED_COLUMNS as readonly string[]).includes(field),
        );
    }, [getFormColumns, pinnedColumnFields]);

    useEffect(() => {
      if (
        orderedPinnedColumnFields.length !== pinnedColumnFields.length ||
        orderedPinnedColumnFields.some((field, index) => field !== pinnedColumnFields[index])
      ) {
        setPinnedColumnFields(orderedPinnedColumnFields);
        return;
      }

      writePinnedColumns(userIdentifier, form.id, orderedPinnedColumnFields);
    }, [form.id, orderedPinnedColumnFields, pinnedColumnFields, userIdentifier]);

    const pinnedColumns = useMemo(
      () => ({
        left: [...STRUCTURAL_PINNED_COLUMNS, ...orderedPinnedColumnFields],
      }),
      [orderedPinnedColumnFields],
    );

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
            <RtlProvider value>
              <StyledDataGrid
              scrollbarSize={14}
              key={isInEditMode ? "quick-edit-grid" : "view-grid"}
              apiRef={apiRef}
              className={clsx({ "MuiDataGrid-root--edit-mode": isInEditMode })}
              disableColumnMenu
              disableColumnSorting={isInEditMode}
              disableColumnFilter={isInEditMode}
              disableVirtualization
              headerFilters={shouldUseHeaderFilters}
              autosizeOptions={{
                includeHeaders: true,
                includeOutliers: true,
                expand: true,
              }}
              columnBufferPx={5000}
              pinnedColumns={pinnedColumns}
              pinnedColumnsSectionSeparator="border"
              sortingMode="server"
              sortingOrder={["asc", "desc"]}
              onSortModelChange={handleSortModelChange}
              filterMode="server"
              filterModel={filterModel}
              onFilterModelChange={handleFilterModelChange}
              editMode="cell"
              cellModesModel={filteredCellModesModel}
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
                unpin: "בטל נעיצה",
              }}
              columns={getFormColumns}
              sortModel={sortModel}
              rows={displayRows}
              slots={{
                columnHeaderFilterIconButton: EmptyColumnHeaderFilterIconButton,
                columnFilteredIcon: EmptyColumnFilteredIcon,
                columnUnsortedIcon: SortUnsortedIcon,
                columnSortedAscendingIcon: SortAscendingIcon,
                columnSortedDescendingIcon: SortDescendingIcon,
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
                headerFilterCell: {
                  showClearIcon: true,
                } as any,
                row: {},
              }}
              sx={{
                ...Object.fromEntries(
                  Object.entries(COLOR_RULE_PALETTE).map(([color, meta]) => [
                    `& .response-color-rule-cell--${color}`,
                    {
                      "--response-color-rule-background": meta.background,
                      backgroundColor: `${meta.background} !important`,
                    },
                  ]),
                ),
                "& .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft.response-color-rule-cell, & .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedRight.response-color-rule-cell":
                  {
                    backgroundColor:
                      "var(--response-color-rule-background) !important",
                  },
                "& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer .MuiIconButton-root":
                  {
                    backgroundColor: "transparent !important",
                    boxShadow: "none !important",
                    border: "none !important",
                  },

                "& .MuiDataGrid-columnHeader .MuiDataGrid-iconButtonContainer .MuiIconButton-root:hover":
                  {
                    backgroundColor: "rgba(15, 23, 42, 0.06) !important",
                    boxShadow: "none !important",
                  },

                "& .response-field-column-header .MuiDataGrid-iconButtonContainer": {
                  visibility: "visible",
                  width: 0,
                  opacity: 0,
                  transition: "opacity 0.15s ease, width 0.15s ease",
                },

                "& .response-field-column-header:hover .MuiDataGrid-iconButtonContainer, & .response-field-column-header.MuiDataGrid-columnHeader--sorted .MuiDataGrid-iconButtonContainer":
                  {
                    width: 24,
                    opacity: 1,
                  },

                "& .response-field-column-header .MuiDataGrid-sortButton": {
                  width: 24,
                  height: 24,
                  padding: 0,
                  borderRadius: "6px",
                  backgroundColor: "transparent !important",
                  boxShadow: "none !important",
                  color: "#334155",
                },

                "& .response-field-column-header .MuiDataGrid-sortButton:hover": {
                  backgroundColor: "rgba(15, 23, 42, 0.06) !important",
                },

                "& .response-field-column-header .MuiDataGrid-sortButton svg": {
                  color: "currentColor",
                },

                ...(isInEditMode
                  ? {
                      "& .active-editing-row .MuiDataGrid-cell": {
                        paddingTop: "4px",
                        paddingBottom: "4px",
                        alignItems: "center",
                      },
                      "& .active-editing-row .MuiDataGrid-cell--editing": {
                        padding: "4px 6px",
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
            </RtlProvider>
            <Box
              ref={horizontalScrollbarTrackRef}
              sx={{
                position: "absolute",
                display: "none",
                height: "14px",
                borderRadius: "999px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                direction: "ltr",
                cursor: "default",
                pointerEvents: "auto",
                zIndex: 20,
              }}>
              <Box
                ref={horizontalScrollbarThumbRef}
                sx={{
                  position: "absolute",
                  top: "2px",
                  left: 0,
                  height: "8px",
                  minWidth: "64px",
                  borderRadius: "999px",
                  backgroundColor: "#cbd5e1",
                  cursor: "default",
                  touchAction: "none",
                  transform: "translate3d(0, 0, 0)",
                  willChange: "transform",
                  "&:hover": {
                    backgroundColor: "#94a3b8",
                  },
                  "&:active": {
                    cursor: "default",
                    backgroundColor: "#64748b",
                  },
                }}
              />
            </Box>
            <Box
              ref={verticalScrollbarTrackRef}
              sx={{
                position: "absolute",
                display: "none",
                width: "14px",
                borderRadius: "999px",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                direction: "ltr",
                cursor: "default",
                pointerEvents: "auto",
                zIndex: 21,
              }}>
              <Box
                ref={verticalScrollbarThumbRef}
                sx={{
                  position: "absolute",
                  top: 0,
                  left: "2px",
                  width: "8px",
                  minHeight: "48px",
                  borderRadius: "999px",
                  backgroundColor: "#cbd5e1",
                  cursor: "default",
                  touchAction: "none",
                  transform: "translate3d(0, 0, 0)",
                  willChange: "transform",
                  "&:hover": {
                    backgroundColor: "#94a3b8",
                  },
                  "&:active": {
                    cursor: "default",
                    backgroundColor: "#64748b",
                  },
                }}
              />
            </Box>
          </TableContainer>
        </MainContent>
      </ContentContainer>
    );
  },
);
