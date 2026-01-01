import React from "react";
import { ResponsesView, ViewColumn, FormField } from "../../types/interfaces/tableViews.types";
import { useViewMode } from "../../hooks/useViewMode";
import ViewModeHeader from "../ViewModeHeader/ViewModeHeader";
import SavedViewsList from "../SavedViewsList/SavedViewsList";
import ViewForm from "../ViewForm/ViewForm";
import { ViewManagerContainer } from "./styled";
import { ViewFormBase, ViewUserBase } from "../../types/interfaces/view.types";

interface ViewManagerProps {
  form?: ViewFormBase;
  user?: ViewUserBase;
  onSaveView: (view: ResponsesView) => void;
  onLoadView: (view: ResponsesView) => void;
  onDeleteView?: (view: ResponsesView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  currentView?: ResponsesView;
  savedViews?: ResponsesView[];
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
  savedViews,
  permissionTypes = [],
  isSaving = false,
}) => {
  const { mode, editingView, switchToList, switchToCreate, switchToEdit } = useViewMode();

  const isListMode = mode === "list";
  const isFormMode = mode === "create" || mode === "edit";

  const handleSave = (view: ResponsesView) => {
    onSaveView(view);
    switchToList();
  };

  return (
    <ViewManagerContainer>
      <ViewModeHeader mode={mode} onBack={switchToList} />

      {isListMode && (
        <SavedViewsList
          savedViews={savedViews}
          user={user}
          permissionTypes={permissionTypes}
          onLoadView={onLoadView}
          onEditView={switchToEdit}
          onDeleteView={onDeleteView}
          onCreateNew={switchToCreate}
        />
      )}

      {isFormMode && (
        <ViewForm
          form={form}
          user={user}
          currentView={editingView || undefined}
          permissionTypes={permissionTypes}
          isSaving={isSaving}
          onSaveView={handleSave}
          onApplyView={onApplyView}
          onCancel={switchToList}
        />
      )}
    </ViewManagerContainer>
  );
};

export default ViewManager;
