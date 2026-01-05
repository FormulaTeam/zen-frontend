import {
  ResponsesView as IResponsesView,
  ViewColumn,
} from "../../../types/interfaces/tableViews.types";
import { ViewFormBase, ViewUserBase } from "../../../types/interfaces/view.types";
import { ViewManagerContainer } from "./styled";
import { SavedViewsList } from "../SavedViews/SavedViewsList";
import { ResponsesViewPage } from "../ResponsesView/ResponsesViewPage";
import { ViewModeHeader } from "../ViewModeHeader/ViewModeHeader";
import { useViewMode } from "../../../hooks/useViewMode";

interface ViewManagerProps {
  form?: ViewFormBase;
  user?: ViewUserBase;
  onSaveView: (view: IResponsesView) => void;
  onLoadView: (view: IResponsesView) => void;
  onDeleteView?: (view: IResponsesView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  currentView?: IResponsesView;
  savedViews?: IResponsesView[];
  permissionTypes?: number[];
  isSaving?: boolean;
}

enum Modes {
  LIST = "list",
  CREATE = "create",
  EDIT = "edit",
}

export function ViewManager({
  form,
  user,
  onSaveView,
  onLoadView,
  onDeleteView,
  onApplyView,
  savedViews,
  permissionTypes = [],
  isSaving = false,
}: ViewManagerProps) {
  const { mode, editingView, switchToList, switchToCreate, switchToEdit } = useViewMode();

  const isListMode: boolean = mode === Modes.LIST;
  const isFormMode: boolean = mode === Modes.CREATE || mode === Modes.EDIT;
  const showHeader: boolean = (savedViews && savedViews.length > 0) || isFormMode;

  const handleSave = (view: IResponsesView) => {
    onSaveView(view);
    switchToList();
  };

  return (
    <ViewManagerContainer>
      {showHeader && <ViewModeHeader mode={mode} onBack={switchToList} />}

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
        <ResponsesViewPage
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
}
