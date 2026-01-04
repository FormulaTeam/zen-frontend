import { useState, useEffect, useMemo, useCallback } from "react";
import {
  createResponsesView,
  updateResponsesView,
  deleteResponsesView,
  useGetResponsesViews,
} from "../api/responsesViewsApi";
import { ResponsesView, ViewColumn } from "../types/interfaces/tableViews.types";
import { showErrorNotification, showSuccessNotification, getUserName } from "../utils/utils";
import { applyViewSorting } from "../utils/viewSortingUtils";
import { ViewFormBase, ViewUserBase } from "../types/interfaces/view.types";

interface UseViewManagerProps {
  form?: ViewFormBase;
  user?: ViewUserBase;
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

export const useViewManager = ({
  form,
  user,
  onViewConfigChange,
  setSorting,
  tableColumns,
}: UseViewManagerProps) => {
  const [currentView, setCurrentView] = useState<ResponsesView>();
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewColumn[]>();
  const [selectedViewId, setSelectedViewId] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const { data: formViews = [], error, refetch } = useGetResponsesViews(form?.id ?? "");

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
   * Filter views (future-proof)
   * -------------------------------- */
  const availableViews = useMemo(() => {
    return formViews;
  }, [formViews]);

  /** --------------------------------
   * Notify parent of config changes
   * -------------------------------- */
  useEffect(() => {
    onViewConfigChange?.(currentViewConfig);
  }, [currentViewConfig, onViewConfigChange]);

  /** --------------------------------
   * Apply sorting when config changes
   * -------------------------------- */
  useEffect(() => {
    if (!setSorting) return;

    if (currentViewConfig && tableColumns?.length) {
      applyViewSorting(setSorting, currentViewConfig, tableColumns);
    } else {
      setSorting([]);
    }
  }, [currentViewConfig, tableColumns, setSorting]);

  /** --------------------------------
   * Save / Update
   * -------------------------------- */
  const handleSaveView = useCallback(
    async (view: ResponsesView) => {
      if (!form) return;

      setIsSaving(true);

      try {
        const payload: ResponsesView = {
          ...view,
          formId: form.id,
          createdBy: user?.upn ?? "unknown",
          createdByName: getUserName(user?.firstName ?? "", user?.lastName ?? ""),
        };

        const saved = payload.id
          ? await updateResponsesView(payload.id, payload)
          : await createResponsesView(payload);

        showSuccessNotification(
          payload.id ? HebrewMessages.UpdateViewSuccess : HebrewMessages.SaveViewSuccess,
        );

        setCurrentView(saved);
        setSelectedViewId(saved.id?.toString() ?? "");
        setCurrentViewConfig(saved.config.columns);

        if (saved.isDefault) await refetch();
      } catch (err) {
        console.error(err);
        showErrorNotification(HebrewMessages.SaveViewError);
      } finally {
        setIsSaving(false);
      }
    },
    [form, user, refetch],
  );

  /** --------------------------------
   * Load
   * -------------------------------- */
  const handleLoadView = useCallback(
    (view: ResponsesView) => {
      setCurrentView(view);
      setCurrentViewConfig(view.config.columns);
      setSelectedViewId(view.id?.toString() ?? "");

      if (setSorting && tableColumns?.length) {
        applyViewSorting(setSorting, view.config.columns, tableColumns);
      }
    },
    [setSorting, tableColumns],
  );

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

      const view = availableViews.find((v) => v.id?.toString() === viewId);
      if (view) handleLoadView(view);
    },
    [availableViews, handleLoadView, setSorting],
  );

  /** --------------------------------
   * Apply config
   * -------------------------------- */
  const handleApplyView = useCallback(
    (config: ViewColumn[]) => {
      setCurrentViewConfig(config);

      if (setSorting && tableColumns?.length) {
        applyViewSorting(setSorting, config, tableColumns);
      }
    },
    [setSorting, tableColumns],
  );

  /** --------------------------------
   * Delete
   * -------------------------------- */
  const handleDeleteView = useCallback(
    async (view: ResponsesView) => {
      if (!view.id) return;

      try {
        await deleteResponsesView(view.id);

        if (currentView?.id === view.id) {
          setCurrentView(undefined);
          setCurrentViewConfig(undefined);
          setSelectedViewId("");
        }

        showSuccessNotification(HebrewMessages.DeleteViewSuccess);
        await refetch();
      } catch (err) {
        console.error(err);
        showErrorNotification(HebrewMessages.DeleteViewError);
      }
    },
    [currentView, refetch],
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
