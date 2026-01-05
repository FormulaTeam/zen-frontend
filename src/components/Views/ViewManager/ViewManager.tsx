import { ResponsesView, ViewColumn } from "../../../types/interfaces/tableViews.types";
import { ViewFormBase, ViewUserBase } from "../../../types/interfaces/view.types";
import { ViewManagerContainer } from "./styled";
import { SavedViewsList } from "../SavedViews/SavedViewsList";
import { ResponsesViewPage } from "../ResponsesView/ResponsesViewPage";
import { ViewModeHeader } from "../ViewModeHeader/ViewModeHeader";
import { useViewMode } from "../../../hooks/useViewMode";

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

  savedViews = [
    {
      id: 1,
      formId: "form-123",
      name: "תצוגת ברירת מחדל",
      createdBy: "baraskin@company.com",
      createdByName: "שי נחשון",
      isPublic: true,
      isDefault: true,
      config: { columns: [] },
      createdAt: new Date("2025-12-01T09:30:00"),
      updatedAt: new Date("2025-12-01T09:30:00"),
    },
    {
      id: 2,
      formId: "form-123",
      name: "פניות פתוחות",
      createdBy: "yael@company.com",
      createdByName: "מוטקה מהאפסנאות",
      isPublic: false,
      isDefault: false,
      config: { columns: [] },
      createdAt: new Date("2025-12-02T11:15:00"),
      updatedAt: new Date("2025-12-03T08:45:00"),
    },
    {
      id: 3,
      formId: "form-123",
      name: "סבב שאפו בומבו קומבו",
      createdBy: "admin@company.com",
      createdByName: "שירה שטיינבוך",
      isPublic: true,
      isDefault: false,
      config: { columns: [] },
      createdAt: new Date("2025-12-04T14:00:00"),
      updatedAt: new Date("2025-12-04T14:00:00"),
    },
    {
      id: 4,
      formId: "form-123",
      name: "גריזלרים",
      createdBy: "baraskin@company.com",
      createdByName: "ארז שיושב לידי",
      isPublic: false,
      isDefault: false,
      config: { columns: [] },
      createdAt: new Date("2025-12-05T10:20:00"),
      updatedAt: new Date("2025-12-06T09:10:00"),
    },
    {
      id: 5,
      formId: "form-123",
      name: "תצוגה בתוך תצוגה בתוך תצוגה",
      createdBy: "baraskin@company.com",
      createdByName: "גליה צביה",
      isPublic: false,
      isDefault: false,
      config: { columns: [] },
      createdAt: new Date("2025-12-05T10:20:00"),
      updatedAt: new Date("2025-12-06T09:10:00"),
    },
  ];

  const isListMode: boolean = mode === Modes.LIST;
  const isFormMode: boolean = mode === Modes.CREATE || mode === Modes.EDIT;
  const showHeader: boolean = (savedViews && savedViews.length > 0) || isFormMode;

  const handleSave = (view: ResponsesView) => {
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
