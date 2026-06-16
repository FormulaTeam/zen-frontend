import { useMemo, useCallback } from "react";
import { Box, Divider, Stack } from "@mui/material";

import { ResponsesView } from "../../../types/interfaces/tableViews.types";
import { useViewColumnConfiguration } from "../../../hooks/useViewColumnConfiguration";
import { useViewFormLogic } from "../../../hooks/useViewFormLogic";
import { useViewPermissions } from "../../../hooks/useViewPermissions";
import { ViewUserBase } from "../../../types/interfaces/view.types";
import { ResponsesViewSettings } from "./ResponsesViewSettings";
import { ResponsesViewColumns } from "./ResponsesViewColumns";
import { ResponsesViewFormActions } from "./ResponsesViewActions";
import { FormFieldDto, UserPersonalDto } from "../../../types/shared";

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
}: ResponsesViewPageProps) {
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

  const visibleColumnsCount = useMemo(
    () => columns.filter((column) => column.visible).length,
    [columns],
  );

  return (
    <Stack direction="column" height="100%" justifyContent="space-between">
      <Box overflow="auto" flex={1}>
        <Box width="97%">
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
          />

          <Divider sx={{ my: 2 }} />

          <ResponsesViewColumns
            columns={columns}
            visibleCount={visibleColumnsCount}
            onToggleVisibility={toggleColumnVisibility}
            onDragEnd={handleDragEnd}
          />
        </Box>
      </Box>

      <Box
        position="sticky"
        bottom={-16}
        zIndex={10}
        bgcolor="#ffffff"
        pt={1}
        pb={2}
        px={2}
        sx={{
          borderTop: "1px solid #e0e0e0",
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.08)",
          mx: -2,
          width: "calc(100% + 32px)",
        }}>
        <ResponsesViewFormActions
          isSaving={isSaving}
          isCreatingNew={formLogic.isCreatingNew}
          canSave={formLogic.canSave}
          onApply={formLogic.handleApply}
          onSave={formLogic.handleSaveView}
        />
      </Box>
    </Stack>
  );
}
