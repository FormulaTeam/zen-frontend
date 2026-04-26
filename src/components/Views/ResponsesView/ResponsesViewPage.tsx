import { useMemo, useCallback } from "react";
import { Box, Divider, Stack } from "@mui/material";

import { ResponsesView, ViewColumn } from "../../../types/interfaces/tableViews.types";
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
  permissionTypes?: number[];
  isSaving?: boolean;
  onSaveView: (view: ResponsesView) => void;
  onApplyView?: (view: ResponsesView) => void;
  onCancel: () => void;
}

const ACTIONS_HEIGHT: Number = 10;
const HEBREW_FORM: string = "טופס";

export function ResponsesViewPage({
  form,
  user,
  currentView,
  permissionTypes = [],
  isSaving = false,
  onSaveView,
  onApplyView,
  onCancel,
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
    user,
    form,
    columns,
    createDefaultColumns,
    resetToOriginalColumns,
    onSaveView,
    onApplyView,
    isSaving,
  });

  const { canManagePublicViews, canEditOrDeleteView } = useViewPermissions({ user, permissionTypes });
  const canEditCurrentView = canEditOrDeleteView(currentView);

  const visibleColumnsCount = useMemo(
    () => columns.filter((column) => column.visible).length,
    [columns],
  );

  const handleCancel = useCallback(() => {
    formLogic.handleCancel();
    onCancel();
  }, [formLogic, onCancel]);

  return (
    <Stack direction="column" height="100vh" justifyContent="space-between">
      <Box overflow="auto" pb={`${ACTIONS_HEIGHT}px`}>
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
      <Box position="sticky" bottom={0} zIndex={1} bgcolor="background.paper">
        <ResponsesViewFormActions
          isSaving={isSaving}
          isCreatingNew={formLogic.isCreatingNew}
          canSave={formLogic.canSave}
          onCancel={handleCancel}
          onApply={formLogic.handleApply}
          onSave={formLogic.handleSaveView}
        />
      </Box>
    </Stack>
  );
}
