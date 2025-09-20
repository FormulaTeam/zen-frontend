import { useState, useEffect } from "react";
import { TableView, ViewColumn } from "../types/interfaces/tableViews.types";
import { getUserName } from "../utils/utils";

interface UseViewFormLogicProps {
  currentView?: TableView;
  user?: any;
  form?: {
    id: string;
    fields: any[];
  };
  onSaveView: (view: TableView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  columns: ViewColumn[];
  createDefaultColumns: () => ViewColumn[];
  resetToOriginalColumns: (originalColumns: ViewColumn[]) => void;
  isSaving?: boolean;
}

interface OriginalState {
  viewName: string;
  isPublic: boolean;
  isDefault: boolean;
  columns: ViewColumn[];
}

interface UseViewFormLogicReturn {
  viewName: string;
  setViewName: (name: string) => void;
  isPublic: boolean;
  setIsPublic: (isPublic: boolean) => void;
  isDefault: boolean;
  setIsDefault: (isDefault: boolean) => void;
  isCreatingNew: boolean;
  setIsCreatingNew: (creating: boolean) => void;
  originalState: OriginalState;
  isSaving: boolean;
  handleCreateNew: () => void;
  handleCancel: () => void;
  handleApply: () => void;
  handleSaveView: () => void;
  handleSwitchPublic: (isPublic: boolean) => void;
}

export const useViewFormLogic = ({
  currentView,
  user,
  form,
  onSaveView,
  onApplyView,
  columns,
  createDefaultColumns,
  resetToOriginalColumns,
  isSaving = false,
}: UseViewFormLogicProps): UseViewFormLogicReturn => {
  const [viewName, setViewName] = useState(currentView?.name || "");
  const [isPublic, setIsPublic] = useState(currentView?.isPublic || false);
  const [isDefault, setIsDefault] = useState(currentView?.isDefault || false);
  const [isCreatingNew, setIsCreatingNew] = useState(!currentView);
  const [originalState, setOriginalState] = useState<OriginalState>({
    viewName: "",
    isPublic: false,
    isDefault: false,
    columns: [],
  });

  // Update form fields when currentView changes
  useEffect(() => {
    if (currentView) {
      setViewName(currentView.name);
      setIsPublic(currentView.isPublic);
      setIsDefault(currentView.isDefault);
      setIsCreatingNew(false); // If we have a current view, we're not creating new

      // Update original state
      setOriginalState({
        viewName: currentView.name,
        isPublic: currentView.isPublic,
        isDefault: currentView.isDefault,
        columns: currentView.config.columns,
      });
    } else {
      // Clear state when no current view
      setViewName("");
      setIsPublic(false);
      setIsDefault(false);
      setIsCreatingNew(true);

      setOriginalState({
        viewName: "",
        isPublic: false,
        isDefault: false,
        columns: [],
      });
    }
  }, [currentView]);

  // Handle starting a new view creation
  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setViewName("");
    setIsPublic(false);
    setIsDefault(false);

    // Reset columns to default state is handled by the parent component
    // since it needs access to createDefaultColumns
  };

  // Handle cancel - reset to original state
  const handleCancel = () => {
    if (isCreatingNew) {
      setIsCreatingNew(false);
      setViewName("");
      setIsPublic(false);
      setIsDefault(false);

      // If there's a current view, restore it
      if (currentView) {
        setViewName(currentView.name);
        setIsPublic(currentView.isPublic);
        setIsDefault(currentView.isDefault);
        resetToOriginalColumns(originalState.columns);
      }
    } else if (originalState) {
      setViewName(originalState.viewName);
      setIsPublic(originalState.isPublic);
      setIsDefault(originalState.isDefault);
      resetToOriginalColumns(originalState.columns);
    }
    handleApply(); // Apply original state to the table if needed
  };

  // Handle apply - apply current column configuration to the table
  const handleApply = () => {
    console.log("Applying view configuration:", {
      name: viewName,
      isPublic,
      isDefault,
      columns,
    });

    // Apply the current column configuration to the table via callback
    if (onApplyView && columns.length > 0) {
      onApplyView(columns);
    }
  };

  const handleSwitchPublic = (newIsPublic: boolean) => {
    if (!newIsPublic && isDefault) {
      setIsDefault(false); // Remove default if switching off public
    }
    setIsPublic(newIsPublic);
  };

  const handleSaveView = () => {
    if (!viewName.trim()) {
      alert("Please enter a view name");
      return;
    }

    if (!form?.id) {
      alert("Form is not available");
      return;
    }

    const view: TableView = {
      formId: form.id,
      name: viewName.trim(),
      createdBy: user?.upn || user?.email || "unknown",
      createdByName: getUserName(user?.firstName, user?.lastName),
      isPublic,
      isDefault,
      config: {
        columns: columns,
      },
      createdAt: currentView?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    // If we're editing an existing view (not creating new), include the ID
    if (!isCreatingNew && currentView) {
      if (currentView.id) {
        view.id = currentView.id;
      }
    }
    setOriginalState({
      viewName: view.name,
      isPublic: view.isPublic,
      isDefault: view.isDefault,
      columns: view.config.columns,
    });
    onSaveView(view);
    setViewName(view.name);
    // Reset creation state
    if (isCreatingNew) {
      setIsCreatingNew(false);
    }
  };

  return {
    viewName,
    setViewName,
    isPublic,
    setIsPublic,
    isDefault,
    setIsDefault,
    isCreatingNew,
    setIsCreatingNew,
    originalState,
    isSaving,
    handleCreateNew,
    handleCancel,
    handleApply,
    handleSaveView,
    handleSwitchPublic,
  };
};
