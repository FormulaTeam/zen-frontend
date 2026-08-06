import { useMemo, useCallback, useEffect, useState } from "react";
import { Box, Divider } from "@mui/material";

import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { useViewColumnConfiguration } from "../../../hooks/useViewColumnConfiguration";
import { useViewFormLogic } from "../../../hooks/useViewFormLogic";
import { useViewPermissions } from "../../../hooks/useViewPermissions";
import { ViewUserBase } from "../../../types/interfaces/view.types";
import { ResponsesViewSettings } from "./ResponsesViewSettings";
import { ResponsesViewColumns } from "./ResponsesViewColumns";
import { ResponsesViewFormActions } from "./ResponsesViewActions";
import { FormFieldDto, ResponseFiltersDto, UserPersonalDto } from "../../../types/shared";
import { useFormStore } from "../../../pages/ResponsesPage/stores/form.store";

const getResponseFiltersSignature = (responseFilters?: ResponseFiltersDto | null): string =>
  JSON.stringify(responseFilters?.items ?? []);

type ResponsesViewForm = {
  id: string | number;
  name: string;
  fields: FormFieldDto[];
};

type ResponsesViewUser = ViewUserBase | UserPersonalDto;

interface ResponsesViewPageProps {
  form?: ResponsesViewForm;
  user?: ResponsesViewUser;
  currentView?: ResponsesView;
  savedViews?: ResponsesView[];
  permissionTypes?: number[];
  isSaving?: boolean;
  onSaveView: (view: ResponsesView) => Promise<void>;
  onApplyView?: (view: ResponsesView) => void;
  onSaveFiltersPreset?: (viewId?: string | number) => void | Promise<void>;
  onClearFiltersPreset?: (viewId?: string | number) => void | Promise<void>;
  canSaveFiltersPreset?: boolean;
  canClearFiltersPreset?: boolean;
  isCurrentFilterPresetSaved?: boolean;
  hasActiveResponseFilters?: boolean;
}

const HEBREW_FORM: string = "טופס";

export function ResponsesViewPage({
  form,
  user,
  currentView,
  savedViews = [],
  permissionTypes = [],
  isSaving = false,
  onSaveView,
  onApplyView,
  onSaveFiltersPreset,
  onClearFiltersPreset,
  canSaveFiltersPreset = false,
  canClearFiltersPreset = false,
  isCurrentFilterPresetSaved = false,
  hasActiveResponseFilters = false,
}: ResponsesViewPageProps) {
  const { filter, setResponseFilters } = useFormStore();
  const [draftResponseFilters, setDraftResponseFilters] = useState<ResponseFiltersDto | null>(null);

  const {
    columns,
    toggleColumnVisibility,
    handleDragEnd,
    createDefaultColumns,
    resetToOriginalColumns,
    getSortedColumns,
    setSortColumn,
    clearSort,
  } = useViewColumnConfiguration({ form, currentView });

  const formLogic = useViewFormLogic({
    currentView,
    stagedResponseFilters: currentView?.responseFilters ?? draftResponseFilters,
    savedViews,
    user,
    form,
    columns,
    createDefaultColumns,
    resetToOriginalColumns,
    onSaveView,
    onApplyView,
    isSaving,
  });

  const { canManagePublicViews, canEditOrDeleteView } = useViewPermissions({
    user,
    permissionTypes,
  });

  const canEditCurrentView = canEditOrDeleteView(currentView);

  const [isPresetSyncedForCurrentView, setIsPresetSyncedForCurrentView] = useState(true);
  const effectiveViewResponseFilters = currentView?.responseFilters ?? draftResponseFilters;

  const isCurrentFilterPresetStagedForView = useMemo(
    () =>
      getResponseFiltersSignature(effectiveViewResponseFilters) ===
      getResponseFiltersSignature(filter?.responseFilters),
    [effectiveViewResponseFilters, filter?.responseFilters],
  );

  useEffect(() => {
    if (currentView) {
      setDraftResponseFilters(currentView.responseFilters ?? null);
    }
  }, [currentView]);

  useEffect(() => {
    setIsPresetSyncedForCurrentView(isCurrentFilterPresetStagedForView);
  }, [isCurrentFilterPresetStagedForView]);

  const canApplyFilterPresetChange = !isPresetSyncedForCurrentView;

  const hasSavedFiltersPresetOnCurrentView = useMemo(
    () => !!(effectiveViewResponseFilters?.items && effectiveViewResponseFilters.items.length > 0),
    [effectiveViewResponseFilters],
  );

  const handleStageSaveFiltersPreset = useCallback(() => {
    const stagedResponseFilters =
      filter?.responseFilters?.items?.length && filter.responseFilters.items.length > 0
        ? filter.responseFilters
        : { items: [] };

    if (!currentView) {
      setDraftResponseFilters(stagedResponseFilters);
      setIsPresetSyncedForCurrentView(true);
      return;
    }

    onApplyView?.({
      ...currentView,
      responseFilters: stagedResponseFilters,
    });

    setIsPresetSyncedForCurrentView(true);
  }, [currentView, filter?.responseFilters, onApplyView]);

  const handleStageClearFiltersPreset = useCallback(() => {
    const hasActiveTableFilters =
      !!(filter?.responseFilters?.items && filter.responseFilters.items.length > 0);

    // Avoid triggering loading/skeleton when there is nothing to clear.
    if (hasActiveTableFilters) {
      setResponseFilters(null);
    }

    if (!currentView) {
      setDraftResponseFilters(null);
      setIsPresetSyncedForCurrentView(true);
      return;
    }

    onApplyView?.({
      ...currentView,
      responseFilters: null,
    });

    setIsPresetSyncedForCurrentView(true);
  }, [currentView, filter?.responseFilters, onApplyView, setResponseFilters]);

  const visibleColumnsCount = useMemo(
    () => columns.filter((column) => column.visible).length,
    [columns],
  );

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ flex: 1, overflowY: "auto", px: 2, py: 1 }}>
        <ResponsesViewSettings
          formId={Number(form?.id ?? 0)}
          formName={form?.name ?? HEBREW_FORM}
          columns={columns}
          formFields={form?.fields}
          canManagePublicViews={canManagePublicViews}
          canEditCurrentView={canEditCurrentView}
          viewName={formLogic.viewName}
          setViewName={formLogic.setViewName}
          viewNameError={formLogic.viewNameError}
          isPublic={formLogic.isPublic}
          isDefault={formLogic.isDefault}
          setIsDefault={formLogic.setIsDefault}
          handleSwitchPublic={formLogic.handleSwitchPublic}
          getSortedColumns={getSortedColumns}
          setSortColumn={setSortColumn}
          clearSort={clearSort}
          activeViewId={currentView?.id}
          onSaveFiltersPreset={handleStageSaveFiltersPreset}
          onClearFiltersPreset={handleStageClearFiltersPreset}
          canSaveFiltersPreset={canSaveFiltersPreset}
          canClearFiltersPreset={canClearFiltersPreset}
          canApplyFilterPresetChange={canApplyFilterPresetChange}
          hasSavedFiltersPresetOnView={hasSavedFiltersPresetOnCurrentView}
          hasActiveResponseFilters={hasActiveResponseFilters}
        />

        <Divider sx={{ my: 3 }} />

        <ResponsesViewColumns
          columns={columns}
          visibleCount={visibleColumnsCount}
          onToggleVisibility={toggleColumnVisibility}
          onDragEnd={handleDragEnd}
        />
      </Box>

      <Box
        sx={{
          p: 2,
          bgcolor: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.05)",
        }}>
        <ResponsesViewFormActions
          isSaving={isSaving}
          isCreatingNew={formLogic.isCreatingNew}
          canSave={formLogic.canSave}
          onApply={formLogic.handleApply}
          onSave={formLogic.handleSaveView}
        />
      </Box>
    </Box>
  );
}
