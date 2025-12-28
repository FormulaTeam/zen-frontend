import React, { useMemo, useCallback } from "react";
import { Box, Divider } from "@mui/material";

import { TableView, ViewColumn } from "../../types/interfaces/tableViews.types";
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
  currentView?: TableView;
  permissionTypes?: number[];
  isSaving?: boolean;
  onSaveView: (view: TableView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  onCancel: () => void;
}

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

  const visibleColumnsCount = useMemo(() => columns.filter((c) => c.visible).length, [columns]);

  const handleCancel = useCallback(() => {
    formLogic.handleCancel();
    onCancel();
  }, [formLogic, onCancel]);

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <ViewFormSettings
        formId={+(form?.id ?? 0)}
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

      <Divider />

      <ViewFormColumns
        columns={columns}
        visibleCount={visibleColumnsCount}
        onToggleVisibility={toggleColumnVisibility}
        onDragEnd={handleDragEnd}
      />

      <Divider />

      <ViewFormActions
        isSaving={isSaving}
        isCreatingNew={formLogic.isCreatingNew}
        canSave={formLogic.hasChanges}
        onCancel={handleCancel}
        onApply={formLogic.handleApply}
        onSave={formLogic.handleSaveView}
      />
    </Box>
  );
};

export default ViewForm;
