import { useState, useEffect, useMemo, useCallback } from "react";
import {
  useGetResponsesViews,
  useCreateResponsesView,
  useUpdateResponsesView,
  useDeleteResponsesView,
} from "../api/responsesViewsApi";
import { ResponsesView, ViewColumn } from "../types/interfaces/tableViews.types";
import { showErrorNotification, showSuccessNotification, getUserName } from "../utils/utils";
import { applyViewSorting } from "../utils/viewSortingUtils";
import { ViewUserBase } from "../types/interfaces/view.types";
import { FormFieldDto, UserPersonalDto, MetaColumnIds } from "../types/shared";

type ViewManagerFormBase = {
  id: string | number;
  name: string;
  fields: FormFieldDto[];
};

type ViewManagerUserBase = ViewUserBase | UserPersonalDto;

interface UseViewManagerProps {
  form?: ViewManagerFormBase;
  user?: ViewManagerUserBase;
  onViewConfigChange?: (viewConfig?: ViewColumn[]) => void;
  setSorting?: (sorting: any[]) => void;
  tableColumns?: any[];
}

enum HebrewMessages {
  LoadViewsError = "נכשל בטעינת התצוגות",
  SaveViewSuccess = "תצוגה נשמרה",
  UpdateViewSuccess = "תצוגה עודכנה",
  SaveViewError = "נכשל בשמירת התצוגה",
  DeleteViewSuccess = "התצוגה נמחקה",
  DeleteViewError = "נכשל במחיקת התצוגה",
}

const getViewUserDisplayName = (user?: ViewManagerUserBase) => {
  if (!user) {
    return "";
  }

  if ("name" in user && typeof user.name === "string" && user.name.trim()) {
    return user.name;
  }

  const firstName = "firstName" in user && typeof user.firstName === "string" ? user.firstName : "";
  const lastName = "lastName" in user && typeof user.lastName === "string" ? user.lastName : "";

  return getUserName(firstName, lastName) || user.upn || "";
};

export const useViewManager = ({
  form,
  user,
  onViewConfigChange,
  setSorting,
  tableColumns,
}: UseViewManagerProps) => {
  const formId = form ? String(form.id) : "";
  const [currentView, setCurrentView] = useState<ResponsesView>();
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewColumn[]>();
  const [selectedViewId, setSelectedViewId] = useState<string>("");

  const {
    data: formViews = [],
    error,
  } = useGetResponsesViews(formId);

  const { mutateAsync: createView, isPending: isCreating } = useCreateResponsesView(formId);
  const { mutateAsync: updateView, isPending: isUpdating } = useUpdateResponsesView(formId);
  const { mutateAsync: deleteView, isPending: isDeleting } = useDeleteResponsesView(formId);

  const isSaving = isCreating || isUpdating;

  /** --------------------------------
   * Error handling
   * -------------------------------- */
  useEffect(() => {
    if (error) {
      console.error(error);
      showErrorNotification(HebrewMessages.LoadViewsError);
    }
  }, [error]);

  /** --------------------------------
   * Filter and sort views
   * Order: Default first -> Other Public -> Personal. 
   * Internal group sorting: Most recent first.
   * -------------------------------- */
  const availableViews = useMemo(() => {
    const userUpn = ((user as any)?.upn || (user as any)?.UPN || "").toLowerCase();

    return [...formViews].sort((a, b) => {
      // 1. Default view always first
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;

      // 2. Public views before personal views
      if (a.isPublic && !b.isPublic) return -1;
      if (!a.isPublic && b.isPublic) return 1;

      // 3. Within same group, sort by createdAt descending (most recent first)
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      
      if (dateA !== dateB) {
        return dateB - dateA;
      }

      // Final fallback: name
      return a.name.localeCompare(b.name);
    });
  }, [formViews, user]);

  /** --------------------------------
   * Notify parent of config changes
   * -------------------------------- */
  useEffect(() => {
    onViewConfigChange?.(currentViewConfig);
  }, [currentViewConfig, onViewConfigChange]);

  /** --------------------------------
   * Save / Update
   * -------------------------------- */
  const handleSaveView = useCallback(
    async (view: ResponsesView) => {
      if (!form) return;

      try {
        // Spec Rule 3: isPublic must be true if isDefault is true
        const isPublic = view.isDefault ? true : view.isPublic;

        const payload: any = {
          ...view,
          isPublic,
          formId: String(form.id),
          createdBy: (user as any)?.upn || (user as any)?.UPN || "unknown",
          createdByName: getViewUserDisplayName(user),
        };

        let saved: ResponsesView;

        if (payload.id) {
           // Spec Rule 6: Read-Only Removal for PATCH
           const patchPayload = { ...payload };
           delete patchPayload.id;
           delete patchPayload.createdAt;
           delete patchPayload.updatedAt;
           delete patchPayload.createdBy;
           delete patchPayload.formId;

           saved = await updateView({ responsesViewId: payload.id, updates: patchPayload });
        } else {
           saved = await createView(payload);
        }

        showSuccessNotification(
          payload.id ? HebrewMessages.UpdateViewSuccess : HebrewMessages.SaveViewSuccess,
        );

        setCurrentView(saved);
        setSelectedViewId(saved.id ? String(saved.id) : "");
        setCurrentViewConfig(saved.config?.columns ?? []);
      } catch (err) {
        console.error(err);
        showErrorNotification(HebrewMessages.SaveViewError);
      }
    },
    [form, user, createView, updateView],
  );

  /** --------------------------------
   * Load
   * -------------------------------- */
  const handleLoadView = useCallback(
    (view: ResponsesView) => {
      setCurrentView(view);
      setCurrentViewConfig(view.config?.columns ?? []);
      setSelectedViewId(view.id ? String(view.id) : "");

      if (setSorting && tableColumns?.length) {
        applyViewSorting(setSorting, view, tableColumns);
      }
    },
    [setSorting, tableColumns],
  );

  /** --------------------------------
   * Auto-load default view
   * -------------------------------- */
  useEffect(() => {
    if (!currentView && !selectedViewId && availableViews.length > 0) {
      const defaultView = availableViews.find((v) => v.isDefault);
      if (defaultView) {
        handleLoadView(defaultView);
      }
    }
  }, [availableViews, currentView, selectedViewId, handleLoadView]);

  /** --------------------------------
   * Apply sorting when view or columns change
   * -------------------------------- */
  const lastAppliedViewId = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (!setSorting) return;

    if (currentView && tableColumns?.length) {
      if (currentView.id !== lastAppliedViewId.current) {
        applyViewSorting(setSorting, currentView, tableColumns);
        lastAppliedViewId.current = currentView.id;
      }
    } else {
      if (lastAppliedViewId.current !== undefined) {
        setSorting([]);
        lastAppliedViewId.current = undefined;
      }
    }
  }, [currentView, tableColumns, setSorting]);

  /** --------------------------------
   * Dropdown change
   * -------------------------------- */
  const handleViewDropdownChange = useCallback(
    (viewId: string) => {
      setSelectedViewId(viewId);

      if (!viewId) {
        setCurrentView(undefined);
        setCurrentViewConfig(undefined);
        setSorting?.([]);
        return;
      }

      const view = availableViews.find((v) => (v.id ? String(v.id) : "") === viewId);
      if (view) handleLoadView(view);
    },
    [availableViews, handleLoadView, setSorting],
  );

  /** --------------------------------
   * Apply config
   * -------------------------------- */
  const handleApplyView = useCallback(
    (view: ResponsesView) => {
      setCurrentView(view);
      setCurrentViewConfig(view.columns?.map(c => ({
        columnId: c.fieldId || (Object.keys(MetaColumnIds).find(key => MetaColumnIds[key as keyof typeof MetaColumnIds] === c.metaColumnId)) || "",
        displayName: c.displayName,
        visible: c.isVisible,
        order: c.index
      })) ?? view.config?.columns ?? []);

      if (setSorting && tableColumns?.length) {
        applyViewSorting(setSorting, view, tableColumns);
      }
    },
    [setSorting, tableColumns],
  );

  /** --------------------------------
   * Delete
   * -------------------------------- */
  const handleDeleteView = useCallback(
    async (view: ResponsesView) => {
      if (!view.id || !form) return;

      try {
        await deleteView(view.id);

        if (currentView?.id === view.id) {
          setCurrentView(undefined);
          setCurrentViewConfig(undefined);
          setSelectedViewId("");
        }

        showSuccessNotification(HebrewMessages.DeleteViewSuccess);
      } catch (err) {
        console.error(err);
        showErrorNotification(HebrewMessages.DeleteViewError);
      }
    },
    [currentView, deleteView, form],
  );

  return {
    currentView,
    savedViews: availableViews,
    currentViewConfig,
    selectedViewId,
    isSaving,
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  };
};
