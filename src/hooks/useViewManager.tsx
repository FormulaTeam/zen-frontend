import { useState, useEffect } from "react";
import {
  getFormViewsForForm,
  getDefaultFormView,
  createFormView,
  updateFormView,
  deleteFormView,
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

  // Load form views when form changes
  useEffect(() => {
    if (form?.id) {
      const loadViewsAndDefaults = async () => {
        try {
          // Load views and default view in parallel
          await Promise.all([loadFormViews(), loadDefaultView()]);
        } catch (error) {
          console.error("Failed to load views:", error);
        }
      };

      loadViewsAndDefaults();
    }
  }, [form?.id]);

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

  const loadFormViews = async () => {
    if (!form?.id) return;

    try {
      // Fetch all views for the current form
      const allViews = await getFormViewsForForm(form.id.toString());

      // Filter to show only:
      // 1. Public views (visible to everyone)
      // 2. Private views created by the current user
      console.log("Loaded form views:", allViews);

      const userUpn = user?.upn;
      const filteredViews = allViews.filter(
        (view) => view.isPublic || view.createdBy.toLowerCase() === userUpn?.toLowerCase(),
      );

      setSavedViews(filteredViews);
    } catch (error) {
      console.error("Failed to load form views:", error);
      showErrorNotification("נכשל בטעינת התצוגות");
    }
  };

  const loadDefaultView = async () => {
    if (!form?.id) return;

    try {
      const defaultView = await getDefaultFormView(form.id.toString());
      if (defaultView) {
        // Set the current view and config
        setCurrentView(defaultView);
        setCurrentViewConfig(defaultView.config.columns);
        setSelectedViewId(defaultView.id || "");

        // Apply sorting from default view configuration (triggers searchBySorting via useEffect)
        if (setSorting && tableColumns && defaultView.config.columns) {
          applyViewSorting(setSorting, defaultView.config.columns, tableColumns);
        }
      }
    } catch (error) {
      console.error("Failed to load default view:", error);
    }
  };

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
        await loadFormViews();
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
      const selectedView = savedViews.find((v) => v.id?.toString() === viewId.toString());
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
    savedViews,
    currentViewConfig,
    selectedViewId,
    isSaving,
    // Actions
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
    // Utility functions
    loadFormViews,
    loadDefaultView,
  };
};
