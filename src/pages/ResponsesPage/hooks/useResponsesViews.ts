import { useEffect, useMemo, useState } from "react";
import { useViewManager } from "../../../hooks/useViewManager";
import { useAuth } from "../../../contexts/AuthContext";
import { useFormStore } from "../stores/form.store";
import { ResponsesView, ViewColumn } from "../../../types/interfaces/tableViews.types";
import { FormDto, FormFieldDto, UserPersonalDto } from "../../../types/shared";
import { MetaColumnIds } from "../../../utils/interfaces";

export interface UseResponsesViewsReturn {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  currentViewConfig: ViewColumn[] | undefined;
  currentView: ResponsesView | undefined;
  savedViews: ResponsesView[];
  selectedViewId: string;
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
  const { form, filter, setFilter } = useFormStore();
  const { user } = useAuth();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

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
    isSaving,
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  } = useViewManager({
    form: viewManagerForm,
    user: viewManagerUser,
  });

  // Sync view sorting to store filter
  useEffect(() => {
    if (!currentView) return;

    let sortBy: string | undefined;

    if (currentView.sortColumnId) {
      const sortedColumn = currentView.columns?.find((col) => col.id === currentView.sortColumnId);
      if (sortedColumn) {
        if (sortedColumn.fieldId) {
          sortBy = `field:${sortedColumn.fieldId}`;
        } else if (sortedColumn.metaColumnId) {
          const metaName = Object.keys(MetaColumnIds).find(
            (key) => MetaColumnIds[key as keyof typeof MetaColumnIds] === sortedColumn.metaColumnId,
          );
          if (metaName) {
            sortBy = `meta:${metaName}`;
          }
        }
      }
    } else {
      // Legacy fallback
      const legacySort = currentView.config?.columns?.find(
        (col) => col.sortDirection && col.sortOrder === 1,
      );
      if (legacySort) {
        const isMeta =
          ["id", "index", "pushed_to_metro", "updated_by_name", "updated", "created_at", "created_by_name"].includes(legacySort.columnId);
        sortBy = isMeta ? `meta:${legacySort.columnId}` : `field:${legacySort.columnId}`;
      }
    }

    if (sortBy) {
      setFilter({
        ...filter,
        sortBy,
        orderBy: (currentView.sortDirection || "asc").toUpperCase() as any,
        before: undefined,
        after: undefined,
      });
    }
  }, [currentView?.id, currentView?.sortColumnId, currentView?.sortDirection]);

  return {
    isSidePanelOpen,
    setIsSidePanelOpen,
    currentViewConfig,
    currentView,
    savedViews,
    selectedViewId,
    isSaving,
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  };
};
