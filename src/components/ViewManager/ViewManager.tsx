import React from "react";
import { Typography, Divider, Button } from "@mui/material";
import { TableView, ViewColumn, FormField } from "../../types/interfaces/tableViews.types";
import { useViewMode } from "../../hooks/useViewMode";
import ViewModeHeader from "../ViewModeHeader/ViewModeHeader";
import SavedViewsList from "../SavedViewsList/SavedViewsList";
import ViewForm from "../ViewForm/ViewForm";
import { ViewManagerContainer, CreateNewViewContainer, CreateNewViewButton } from "./styled";

interface Form {
  id: string;
  fields: FormField[];
  [key: string]: any;
}

interface User {
  upn?: string;
  email?: string;
  isSuperAdmin?: boolean;
  [key: string]: any;
}

interface ViewManagerProps {
  form?: Form;
  user?: User;
  onSaveView: (view: TableView) => void;
  onLoadView: (view: TableView) => void;
  onDeleteView?: (view: TableView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  currentView?: TableView;
  savedViews?: TableView[];
  permissionTypes?: number[];
  isSaving?: boolean;
}

const ViewManager: React.FC<ViewManagerProps> = ({
  form,
  user,
  onSaveView,
  onLoadView,
  onDeleteView,
  onApplyView,
  currentView,
  savedViews,
  permissionTypes = [],
  isSaving = false,
}) => {
  // View mode hook
  const { mode, editingView, switchToList, switchToCreate, switchToEdit } = useViewMode();

  const handleCreateNew = () => {
    switchToCreate();
  };

  const handleEditView = (view: TableView) => {
    switchToEdit(view);
  };

  const handleCancel = () => {
    switchToList();
  };

  const onSave = (view: TableView) => {
    onSaveView(view);
    switchToList();
  };

  return (
    <ViewManagerContainer>
      <ViewModeHeader mode={mode} onBack={handleCancel} />

      {mode === "list" && (
        <SavedViewsList
          savedViews={savedViews}
          user={user}
          permissionTypes={permissionTypes}
          onLoadView={onLoadView}
          onEditView={handleEditView}
          onDeleteView={onDeleteView}
          onCreateNew={handleCreateNew}
        />
      )}

      {(mode === "create" || mode === "edit") && (
        <ViewForm
          form={form}
          user={user}
          currentView={editingView || undefined}
          permissionTypes={permissionTypes}
          isSaving={isSaving}
          onSaveView={onSave}
          onApplyView={onApplyView}
          onCancel={handleCancel}
        />
      )}
    </ViewManagerContainer>
  );
};

export default ViewManager;
