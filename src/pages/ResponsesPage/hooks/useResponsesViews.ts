import { useEffect, useMemo, useState, useRef } from "react";
import { useViewManager } from "../../../hooks/useViewManager";
import { useAuth } from "../../../contexts/AuthContext";
import { useFormStore } from "../stores/form.store";
import { ResponsesView, ViewColumn } from "../../../types/interfaces/tableViews.types";
import { FormDto, FormFieldDto, ResponseFiltersDto, UserPersonalDto } from "../../../types/shared";
import { MetaColumnIds } from "../../../utils/interfaces";
import { IOrderBy } from "../../../types/enums/filtersAndSorts.enum";
import { showErrorNotification, showSuccessNotification } from "../../../utils/utils";
import {
  applyResponseFiltersToViewColumns,
  getResponseFiltersFromViewColumns,
} from "../utils/viewResponseFilters";

export interface UseResponsesViewsReturn {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  currentViewConfig: ViewColumn[] | undefined;
  currentView: ResponsesView | undefined;
  savedViews: ResponsesView[];
  hasSavedViews: boolean;
  selectedViewId: string;
  defaultViewId: string;
  isSaving: boolean;
  handleSaveView: (view: ResponsesView) => Promise<void>;
  handleLoadView: (view: ResponsesView) => void;
  handleViewDropdownChange: (viewId: string) => void;
  handleApplyView: (view: ResponsesView) => void;
  handleDeleteView: (view: ResponsesView) => Promise<void>;
  handleSaveCurrentFiltersPreset: (viewId?: string | number) => Promise<void>;
  handleClearSavedFiltersPreset: (viewId?: string | number) => Promise<void>;
  hasSavedFiltersPresetOnSelectedView: boolean;
  isCurrentFilterPresetSaved: boolean;
  hasActiveResponseFilters: boolean;
}

type ViewManagerForm = Pick<FormDto, "id" | "name"> & {
  fields: FormFieldDto[];
};

export const useResponsesViews = (): UseResponsesViewsReturn => {
  const { form, filter, setFilter, isRowsLoading, setIsRowsLoading } = useFormStore();
  const { user } = useAuth();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const lastSyncedViewId = useRef<string | number | undefined>(undefined);
  const lastViewSortDef = useRef({ sortBy: "", orderBy: "" });
  const lastViewFiltersSignature = useRef("");
  const forceExactFilterSyncOnNextViewUpdate = useRef(false);

  const viewManagerForm = useMemo<ViewManagerForm | undefined>(() => {
    if (!form) {
      return undefined;
    }

    const sectionsFields = (form.sections ?? [])
      .flatMap((section) => section.fields ?? [])
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    const flattenedFields = sectionsFields.length > 0 ? sectionsFields : form.fields ?? [];

    return {
      id: form.id,
      name: form.name ?? "",
      fields: flattenedFields,
    };
  }, [form]);

  const viewManagerUser = useMemo<UserPersonalDto | undefined>(() => {
    if (!user) {
      return undefined;
    }

    const safeUpn = (user as any)?.upn || (user as any)?.UPN || "";
    const safeEmail = (user as any)?.email || (user as any)?.mail || "";

    let displayName = (user as any)?.name || "";
    if (!displayName) {
      const firstName = (user as any)?.firstName || "";
      const lastName = (user as any)?.lastName || "";
      displayName = `${firstName} ${lastName}`.trim();
    }

    return {
      ...user,
      name: displayName || safeUpn || safeEmail,
      upn: safeUpn,
      email: safeEmail,
    };
  }, [user]);

  const {
    currentView,
    savedViews,
    currentViewConfig,
    selectedViewId,
    defaultViewId,
    isSaving,
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  } = useViewManager({
    form: viewManagerForm,
    user: viewManagerUser,
    isRowsLoading,
    setIsRowsLoading,
  });

  const hasSavedViews = useMemo(() => savedViews.length > 0, [savedViews]);

  const selectedOrCurrentView = useMemo(
    () => currentView ?? savedViews.find((view) => view.id && String(view.id) === selectedViewId),
    [currentView, savedViews, selectedViewId],
  );

  const getFiltersSignature = (responseFilters?: ResponseFiltersDto | null): string =>
    JSON.stringify(responseFilters?.items ?? []);

  const selectedViewResponseFilters = useMemo(
    () =>
      selectedOrCurrentView?.responseFilters ??
      getResponseFiltersFromViewColumns((selectedOrCurrentView?.columns as any) ?? undefined),
    [selectedOrCurrentView],
  );

  const hasSavedFiltersPresetOnSelectedView = useMemo(
    () => !!(selectedViewResponseFilters?.items && selectedViewResponseFilters.items.length > 0),
    [selectedViewResponseFilters],
  );

  const hasActiveResponseFilters = useMemo(
    () => !!(filter?.responseFilters?.items && filter.responseFilters.items.length > 0),
    [filter?.responseFilters],
  );

  const isCurrentFilterPresetSaved = useMemo(() => {
    const currentSignature = getFiltersSignature(filter?.responseFilters);
    const savedSignature = getFiltersSignature(selectedViewResponseFilters);

    return currentSignature === savedSignature;
  }, [filter?.responseFilters, selectedViewResponseFilters]);

  const handleSaveViewWithResponseFilters = async (view: ResponsesView): Promise<void> => {
    const currentResponseFilters =
      filter?.responseFilters?.items?.length && filter.responseFilters.items.length > 0
        ? filter.responseFilters
        : { items: [] };

    const responseFiltersForSave =
      view.responseFilters !== undefined ? view.responseFilters : currentResponseFilters;

    await handleSaveView({
      ...view,
      responseFilters: responseFiltersForSave,
      columns: applyResponseFiltersToViewColumns(view.columns as any, responseFiltersForSave) as any,
    });
  };

  const resolveTargetView = (viewId?: string | number): ResponsesView | undefined => {
    if (viewId !== undefined && viewId !== null) {
      const byId = savedViews.find((view) => view.id && String(view.id) === String(viewId));

      if (byId) return byId;
      if (currentView?.id && String(currentView.id) === String(viewId)) return currentView;
    }

    return selectedOrCurrentView;
  };

  const handleSaveCurrentFiltersPreset = async (
    viewId?: string | number,
  ): Promise<void> => {
    const targetView = resolveTargetView(viewId);

    if (!targetView?.id) {
      showErrorNotification("יש לבחור תצוגה לפני שמירת הסינון");
      return;
    }

    const currentResponseFilters =
      filter?.responseFilters?.items?.length && filter.responseFilters.items.length > 0
        ? filter.responseFilters
        : { items: [] };

    forceExactFilterSyncOnNextViewUpdate.current = true;

    try {
      await handleSaveViewWithResponseFilters({
        ...targetView,
        responseFilters: currentResponseFilters,
        columns: applyResponseFiltersToViewColumns(
          targetView.columns as any,
          currentResponseFilters,
        ) as any,
      });

      showSuccessNotification("הסינון נשמר לתצוגה");
    } catch {
      forceExactFilterSyncOnNextViewUpdate.current = false;
    }
  };

  const handleClearSavedFiltersPreset = async (
    viewId?: string | number,
  ): Promise<void> => {
    const targetView = resolveTargetView(viewId);

    if (!targetView?.id) {
      showErrorNotification("יש לבחור תצוגה לפני הסרת הסינון השמור");
      return;
    }

    forceExactFilterSyncOnNextViewUpdate.current = true;

    try {
      await handleSaveView({
        ...targetView,
        responseFilters: { items: [] },
        columns: applyResponseFiltersToViewColumns(targetView.columns as any, null) as any,
      });

      showSuccessNotification("הסינון השמור הוסר מהתצוגה");
    } catch {
      forceExactFilterSyncOnNextViewUpdate.current = false;
    }
  };

  // Sync view sorting to store filter
  useEffect(() => {
    // 1. Determine target sort state
    let targetSortBy = "meta:index";
    let targetOrderBy = IOrderBy.DESC;
    let targetResponseFilters: ResponseFiltersDto | undefined = undefined;

    if (currentView) {
      // Find the intended sort column
      const sortedColumn = currentView.columns?.find(
        (col) => col.id === currentView.sortColumnId || col.isSortColumn,
      );

      if (sortedColumn) {
        if (sortedColumn.fieldId) {
          targetSortBy = `field:${sortedColumn.fieldId}`;
        } else if (sortedColumn.metaColumnId) {
          const metaName = Object.keys(MetaColumnIds).find(
            (key) => MetaColumnIds[key as keyof typeof MetaColumnIds] === sortedColumn.metaColumnId,
          );
          if (metaName) targetSortBy = `meta:${metaName}`;
        }
      } else {
        // Legacy fallback
        const legacySort = currentView.config?.columns?.find(
          (col) => col.sortDirection && col.sortOrder === 1,
        );
        if (legacySort) {
          const isMeta = [
            "id",
            "index",
            "pushed_to_metro",
            "updated_by_name",
            "updated",
            "created_at",
            "created_by_name",
          ].includes(legacySort.columnId);
          targetSortBy = isMeta ? `meta:${legacySort.columnId}` : `field:${legacySort.columnId}`;
        }
      }
      targetOrderBy = (currentView.sortDirection || "desc").toUpperCase() as any;
      targetResponseFilters =
        currentView.responseFilters ??
        getResponseFiltersFromViewColumns((currentView.columns as any) ?? undefined) ??
        undefined;
    }

    const nextFiltersSignature = JSON.stringify(targetResponseFilters?.items ?? []);

    // 2. Check if the view or its sort definition changed
    const isNewViewSelection = currentView?.id !== lastSyncedViewId.current;
    const viewSortChanged =
      targetSortBy !== lastViewSortDef.current.sortBy ||
      targetOrderBy !== lastViewSortDef.current.orderBy;
    const viewFiltersChanged = nextFiltersSignature !== lastViewFiltersSignature.current;

    if (isNewViewSelection || viewSortChanged || viewFiltersChanged) {
      const shouldApplyExactViewFilters =
        isNewViewSelection || forceExactFilterSyncOnNextViewUpdate.current;

      forceExactFilterSyncOnNextViewUpdate.current = false;
      lastSyncedViewId.current = currentView?.id;
      lastViewSortDef.current = { sortBy: targetSortBy, orderBy: targetOrderBy };
      lastViewFiltersSignature.current = nextFiltersSignature;

      setFilter((prev) => ({
        ...prev,
        sortBy: targetSortBy,
        orderBy: targetOrderBy,
        responseFilters: shouldApplyExactViewFilters
          ? targetResponseFilters
          : targetResponseFilters ?? prev?.responseFilters,
        before: undefined,
        after: undefined,
        pageNumber: 1,
      }));
    }
    }, [currentView, setFilter]);

  return {
    isSidePanelOpen,
    setIsSidePanelOpen,
    currentViewConfig,
    currentView,
    savedViews,
    hasSavedViews,
    selectedViewId,
    defaultViewId,
    isSaving,
    handleSaveView: handleSaveViewWithResponseFilters,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
    handleSaveCurrentFiltersPreset,
    handleClearSavedFiltersPreset,
    hasSavedFiltersPresetOnSelectedView,
    isCurrentFilterPresetSaved,
    hasActiveResponseFilters,
  };
};
