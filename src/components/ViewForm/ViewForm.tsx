import React, { useMemo, useCallback } from "react";
import { Box, Divider } from "@mui/material";

import { ResponsesView, ViewColumn } from "../../types/interfaces/tableViews.types";
import { useViewColumnConfiguration } from "../../hooks/useViewColumnConfiguration";
import { useViewFormLogic } from "../../hooks/useViewFormLogic";
import { useViewPermissions } from "../../hooks/useViewPermissions";

import ViewFormSettings from "./ViewFormSettings";
import ViewFormColumns from "./ViewFormColumns";
import ViewFormActions from "./ViewFormActions";
import { ViewFormBase, ViewUserBase } from "../../types/interfaces/view.types";

interface ViewFormProps {
  form?: ViewFormBase;
  user?: ViewUserBase;
  currentView?: ResponsesView;
  permissionTypes?: number[];
  isSaving?: boolean;
  onSaveView: (view: ResponsesView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  onCancel: () => void;
}

const ACTIONS_HEIGHT = 10;

const ViewForm: React.FC<ViewFormProps> = ({
  form,
  user,
  currentView,
  permissionTypes = [],
  isSaving = false,
  onSaveView,
  onApplyView,
  onCancel,
}) => {
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

  const { hasFullAccess } = useViewPermissions({ user, permissionTypes });

  const visibleColumnsCount = useMemo(
    () => columns.filter((column) => column.visible).length,
    [columns],
  );

  const handleCancel = useCallback(() => {
    formLogic.handleCancel();
    onCancel();
  }, [formLogic, onCancel]);

  return (
    <>
      <Box overflow="auto" pb={`${ACTIONS_HEIGHT}px`}>
        <Box width="97%">
          <ViewFormSettings
            formId={+(form?.id ?? 0)}
            formName={form?.name ?? ""}
            columns={columns}
            hasFullAccess={hasFullAccess}
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

          <ViewFormColumns
            columns={columns}
            visibleCount={visibleColumnsCount}
            onToggleVisibility={toggleColumnVisibility}
            onDragEnd={handleDragEnd}
          />
        </Box>
      </Box>
      <Box position="sticky" bottom={0} zIndex={1} bgcolor="background.paper">
        <ViewFormActions
          isSaving={isSaving}
          isCreatingNew={formLogic.isCreatingNew}
          canSave={formLogic.canSave}
          onCancel={handleCancel}
          onApply={formLogic.handleApply}
          onSave={formLogic.handleSaveView}
        />
      </Box>
    </>
  );
};

export default ViewForm;
