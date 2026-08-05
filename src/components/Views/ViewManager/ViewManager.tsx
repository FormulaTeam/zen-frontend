import { Box } from "@mui/material";
import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { ViewUserBase } from "../../../types/interfaces/view.types";
import { ViewManagerContainer } from "./styled";
import { SavedViewsList } from "../SavedViews/SavedViewsList";
import { ResponsesViewPage } from "../ResponsesView/ResponsesViewPage";
import { ViewModeHeader } from "../ViewModeHeader/ViewModeHeader";
import { useViewMode } from "../../../hooks/useViewMode";
import { FormFieldDto, UserPersonalDto } from "../../../types/shared";

type ViewManagerForm = {
  id: string | number;
  name: string;
  fields: FormFieldDto[];
};

type ViewManagerUser = ViewUserBase | UserPersonalDto;

interface ViewManagerProps {
  form?: ViewManagerForm;
  user?: ViewManagerUser;
  onSaveView: (view: ResponsesView) => Promise<void>;
  onLoadView: (view: ResponsesView) => void;
  onDeleteView?: (view: ResponsesView) => void;
  onApplyView?: (view: ResponsesView) => void;
  currentView?: ResponsesView;
  savedViews?: ResponsesView[];
  permissionTypes?: number[];
  isSaving?: boolean;
  onSaveFiltersPreset?: (viewId?: string | number) => void | Promise<void>;
  onClearFiltersPreset?: (viewId?: string | number) => void | Promise<void>;
  canSaveFiltersPreset?: boolean;
  canClearFiltersPreset?: boolean;
  isCurrentFilterPresetSaved?: boolean;
  hasActiveResponseFilters?: boolean;
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
  onSaveFiltersPreset,
  onClearFiltersPreset,
  canSaveFiltersPreset = false,
  canClearFiltersPreset = false,
  isCurrentFilterPresetSaved = false,
  hasActiveResponseFilters = false,
}: ViewManagerProps) {
  const { mode, editingView, setEditingView, switchToList, switchToCreate, switchToEdit } = useViewMode();

  const isListMode: boolean = mode === Modes.LIST;
  const isFormMode: boolean = mode === Modes.CREATE || mode === Modes.EDIT;
  const showHeader: boolean = (savedViews && savedViews.length > 0) || isFormMode;

  const handleSave = async (view: ResponsesView) => {
    await onSaveView(view);
    switchToList();
  };

  const handleApplyInForm = (view: ResponsesView) => {
    if (isFormMode) {
      setEditingView(view);
    }

    onApplyView?.(view);
  };

  return (
    <ViewManagerContainer>
      {showHeader && (
        <Box sx={{ p: 2, pb: 0 }}>
          <ViewModeHeader mode={mode} onBack={switchToList} />
        </Box>
      )}

      <Box sx={{ flex: 1, overflow: "hidden" }}>
        {isListMode && (
          <Box sx={{ height: "100%", overflowY: "auto", p: 2, pt: showHeader ? 0 : 2 }}>
            <SavedViewsList
              savedViews={savedViews}
              user={user}
              permissionTypes={permissionTypes}
              onLoadView={onLoadView}
              onEditView={switchToEdit}
              onDeleteView={onDeleteView}
              onCreateNew={switchToCreate}
            />
          </Box>
        )}

        {isFormMode && (
          <ResponsesViewPage
            form={form}
            user={user}
            currentView={editingView || undefined}
            savedViews={savedViews ?? []}
            permissionTypes={permissionTypes}
            isSaving={isSaving}
            onSaveView={handleSave}
            onApplyView={handleApplyInForm}
            onSaveFiltersPreset={onSaveFiltersPreset}
            onClearFiltersPreset={onClearFiltersPreset}
            canSaveFiltersPreset={canSaveFiltersPreset || !!editingView?.id}
            canClearFiltersPreset={canClearFiltersPreset || !!editingView?.id}
            isCurrentFilterPresetSaved={isCurrentFilterPresetSaved}
            hasActiveResponseFilters={hasActiveResponseFilters}
          />
        )}
      </Box>
    </ViewManagerContainer>
  );
}
