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
  const lastViewSortDef = useRef({ sortBy: "", orderBy: "" });

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

  // Sync view sorting to store filter
  useEffect(() => {
    // 1. Determine target sort state
    let targetSortBy = "meta:index";
    let targetOrderBy = IOrderBy.DESC;

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
    }

    // 2. Check if the view or its sort definition changed
    const isNewViewSelection = currentView?.id !== lastSyncedViewId.current;
    const viewSortChanged =
      targetSortBy !== lastViewSortDef.current.sortBy ||
      targetOrderBy !== lastViewSortDef.current.orderBy;

    if (isNewViewSelection || viewSortChanged) {
      lastSyncedViewId.current = currentView?.id;
      lastViewSortDef.current = { sortBy: targetSortBy, orderBy: targetOrderBy };

      setFilter((prev) => ({
        ...prev,
        sortBy: targetSortBy,
        orderBy: targetOrderBy,
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
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  };
};
