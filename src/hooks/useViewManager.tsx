import { useState, useEffect, useMemo } from "react";
import {
  getDefaultFormView,
  createFormView,
  updateFormView,
  deleteFormView,
  useGetFormViews,
} from "../api/formViewsApi";
import { TableView, ViewColumn } from "../types/interfaces/tableViews.types";
import { showErrorNotification, showSuccessNotification, getUserName } from "../utils/utils";
import { applyViewSorting } from "../utils/viewSortingUtils";

interface UseViewManagerProps {
  form?: any;
  user?: any;
  onViewConfigChange?: (viewConfig: ViewColumn[] | undefined) => void;
  setSorting?: (sorting: any[]) => void; // Material React Table sorting
  tableColumns?: any[]; // Material React Table columns for ID mapping
}

export const useViewManager = ({
  form,
  user,
  onViewConfigChange,
  setSorting,
  tableColumns,
}: UseViewManagerProps) => {
  const [currentView, setCurrentView] = useState<TableView | undefined>(undefined);
  const [savedViews, setSavedViews] = useState<TableView[]>([]);
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewColumn[] | undefined>(undefined);
  const [selectedViewId, setSelectedViewId] = useState<number | string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Yahel's changes
  const {
    data: formViews,
    error: formViewsError,
    refetch: refetchFormViews,
  } = useGetFormViews(form?.id);

  useEffect(() => {
    if (formViewsError) {
      console.error("Error fetching form views:", formViewsError);
      showErrorNotification("נכשל בטעינת התצוגות");
    }
  }, [formViewsError]);

  const filteredFormViews = useMemo(() => {
    if (!formViews || !user) return [];
    const userUpn = user?.upn;
    return formViews;
  }, [formViews, user]);

  // Notify parent component when view config changes
  useEffect(() => {
    if (onViewConfigChange) {
      onViewConfigChange(currentViewConfig);
    }
  }, [currentViewConfig, onViewConfigChange]);

  // Re-apply sorting when both currentViewConfig and tableColumns are available
  useEffect(() => {
    if (setSorting && tableColumns && tableColumns.length > 0 && currentViewConfig) {
      console.log("Re-applying sorting after columns are available:", {
        tableColumnsCount: tableColumns.length,
        currentViewConfig: currentViewConfig.length,
      });
      applyViewSorting(setSorting, currentViewConfig, tableColumns);
    } else if (setSorting && (!tableColumns || tableColumns.length === 0 || !currentViewConfig)) {
      // Clear sorting if columns or view config are not available
      console.log("Clearing sorting - columns or view config not available");
      setSorting([]);
    }
  }, [setSorting, tableColumns, currentViewConfig]);

  const handleSaveView = async (view: TableView) => {
    setIsSaving(true);
    try {
      console.log("Saving view:", view);

      let savedView: TableView;

      // Check if view has an ID (update) or is new (create)
      if (view.id) {
        // Update existing view using the provided ID
        // Pass entire view object as requested
        savedView = await updateFormView(view.id, view);
        showSuccessNotification("תצוגה עודכנה בהצלחה");
      } else {
        // Create new view
        const newView = {
          ...view,
          createdBy: user?.upn || user?.email || "unknown",
          createdByName: getUserName(user?.firstName, user?.lastName),
        };
        savedView = await createFormView(newView);
        showSuccessNotification("תצוגה נשמרה בהצלחה");
      }

      // Update local state
      setSavedViews((prev) => {
        const existingIndex = prev.findIndex((v) => v.id === savedView.id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = savedView;
          return updated;
        } else {
          return [...prev, savedView];
        }
      });

      setCurrentView(savedView);
      setSelectedViewId(savedView.id || "");

      // If this view is set as default, reload the views to update other views' default status
      if (view.isDefault) {
        await refetchFormViews();
      }
      handleApplyView(savedView.config.columns);
    } catch (error) {
      console.error("Failed to save view:", error);
      showErrorNotification("נכשל בשמירת התצוגה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadView = (view: TableView) => {
    console.log("Loading view:", view);
    setCurrentView(view);
    setCurrentViewConfig(view.config.columns);
    setSelectedViewId(view.id || "");

    // Apply sorting from view configuration (triggers searchBySorting via useEffect)
    if (setSorting && tableColumns && view.config.columns) {
      applyViewSorting(setSorting, view.config.columns, tableColumns);
    }
  };

  const handleViewDropdownChange = (event: any) => {
    const viewId = event.target.value;
    setSelectedViewId(viewId);

    if (viewId === "") {
      // Clear current view (show default)
      setCurrentView(undefined);
      setCurrentViewConfig(undefined);

      // Clear sorting when no view is selected
      if (setSorting) {
        setSorting([]);
      }
    } else {
      // Load selected view
      const selectedView = filteredFormViews.find((v) => v.id?.toString() === viewId.toString());
      if (selectedView) {
        console.log("Selected view found:", selectedView);

        handleLoadView(selectedView);
      }
    }
  };

  const handleApplyView = (viewConfig: ViewColumn[]) => {
    console.log("Applying view configuration:", viewConfig);
    setCurrentViewConfig(viewConfig);

    // Apply sorting from view configuration (triggers searchBySorting via useEffect)
    if (setSorting && tableColumns) {
      applyViewSorting(setSorting, viewConfig, tableColumns);
    }
  };

  const handleDeleteView = async (view: TableView) => {
    try {
      if (!view.id) {
        showErrorNotification("נכשל במחיקת התצוגה");
        return;
      }

      await deleteFormView(view.id);

      // Update local state
      setSavedViews((prev) => prev.filter((v) => v.id !== view.id));

      // If deleted view was current, clear current view
      if (currentView && currentView.id === view.id) {
        setCurrentView(undefined);
        setCurrentViewConfig(undefined);
        setSelectedViewId("");
      }

      showSuccessNotification("התצוגה נמחקה בהצלחה");
    } catch (error) {
      console.error("Failed to delete view:", error);
      showErrorNotification("נכשל במחיקת התצוגה");
    }
  };

  return {
    // State
    currentView,
    savedViews: filteredFormViews,
    currentViewConfig,
    selectedViewId,
    isSaving,
    // Actions
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  };
};
