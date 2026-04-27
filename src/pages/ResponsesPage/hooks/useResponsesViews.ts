import { useEffect, useMemo, useState, useRef } from "react";
import { useViewManager } from "../../../hooks/useViewManager";
import { useAuth } from "../../../contexts/AuthContext";
import { useFormStore } from "../stores/form.store";
import { ResponsesView, ViewColumn } from "../../../types/interfaces/tableViews.types";
import { FormDto, FormFieldDto, UserPersonalDto } from "../../../types/shared";
import { MetaColumnIds } from "../../../utils/interfaces";
import { IOrderBy } from "../../../types/enums/filtersAndSorts.enum";

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
}

type ViewManagerForm = Pick<FormDto, "id" | "name"> & {
  fields: FormFieldDto[];
};

export const useResponsesViews = (): UseResponsesViewsReturn => {
  const { form, filter, setFilter, isRowsLoading, setIsRowsLoading } = useFormStore();
  const { user } = useAuth();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);
  const lastSyncedViewId = useRef<string | number | undefined>(undefined);

  const viewManagerForm = useMemo<ViewManagerForm | undefined>(() => {
    if (!form) {
      return undefined;
    }

    const flattenedFields = (form.sections ?? [])
      .flatMap((section) => section.fields ?? [])
      .sort((a, b) => a.index - b.index);

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

  // Sync view sorting to store filter
  useEffect(() => {
    // 1. Determine target sort state
    let targetSortBy = "meta:index";
    let targetOrderBy = IOrderBy.DESC;

    if (currentView) {
      if (currentView.sortColumnId) {
        const sortedColumn = currentView.columns?.find((col) => col.id === currentView.sortColumnId);
        if (sortedColumn) {
          if (sortedColumn.fieldId) {
            targetSortBy = `field:${sortedColumn.fieldId}`;
          } else if (sortedColumn.metaColumnId) {
            const metaName = Object.keys(MetaColumnIds).find(
              (key) =>
                MetaColumnIds[key as keyof typeof MetaColumnIds] === sortedColumn.metaColumnId,
            );
            if (metaName) targetSortBy = `meta:${metaName}`;
          }
        }
      } else {
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
      targetOrderBy = (currentView.sortDirection || "asc").toUpperCase() as any;
    }

    // 2. Check if a view selection change occurred
    const isNewViewSelection = currentView?.id !== lastSyncedViewId.current;

    if (isNewViewSelection) {
      // If the view changed (or switched to All Fields), we MUST reset pagination
      lastSyncedViewId.current = currentView?.id;
      setFilter({
        ...filter,
        sortBy: targetSortBy,
        orderBy: targetOrderBy,
        before: undefined,
        after: undefined,
        pageNumber: 1,
      });
      return;
    }

    // 3. If the view is the same, but the sort state is out of sync (e.g., from manual grid sorting)
    // we sync the sort but PRESERVE the current page/cursors if they were intended.
    // However, usually manual sorting resets page anyway.
    const isSortOutOfSync = filter?.sortBy !== targetSortBy || filter?.orderBy !== targetOrderBy;
    
    if (isSortOutOfSync) {
      // Note: We only reach here if isNewViewSelection is false.
      // This means currentView.id matches lastSyncedViewId.
      // If the filter sort changed but view didn't, it might be a manual grid sort.
      // We don't want to fight the user's manual sort here.
    }
    
    // Fallback: Clear loading if nothing triggered
    if (isRowsLoading) {
      setIsRowsLoading(false);
    }
  }, [currentView, setFilter, isRowsLoading, setIsRowsLoading]);

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
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  };
};
