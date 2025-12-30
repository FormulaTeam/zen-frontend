import { useState, useEffect, useMemo, useCallback } from "react";
import { TableView, ViewColumn } from "../types/interfaces/tableViews.types";
import { ViewFormBase, ViewUserBase } from "../types/interfaces/view.types";
import { getUserName } from "../utils/utils";

/* ------------------------ Utils ------------------------ */

const cloneColumns = (columns: ViewColumn[]): ViewColumn[] =>
  columns.map((column) => ({ ...column }));

const areColumnsEqual = (firstColumn: ViewColumn[], secondColumn: ViewColumn[]): boolean => {
  if (firstColumn.length !== secondColumn.length) return false;

  return firstColumn.every((first, index) => {
    const second = secondColumn[index];
    return (
      first.columnId === second.columnId &&
      first.displayName === second.displayName &&
      first.visible === second.visible &&
      first.order === second.order &&
      first.sortDirection === second.sortDirection &&
      first.sortOrder === second.sortOrder
    );
  });
};

/* ------------------------ Types ------------------------ */

interface UseViewFormLogicProps {
  currentView?: TableView;
  user?: ViewUserBase;
  form?: ViewFormBase;
  columns: ViewColumn[];
  createDefaultColumns: () => ViewColumn[];
  resetToOriginalColumns: (columns: ViewColumn[]) => void;
  onSaveView: (view: TableView) => void;
  onApplyView?: (columns: ViewColumn[]) => void;
  isSaving?: boolean;
}

interface OriginalState {
  viewName: string;
  isPublic: boolean;
  isDefault: boolean;
  columns: ViewColumn[];
}

/* ------------------------ Hook ------------------------ */

export const useViewFormLogic = ({
  currentView,
  user,
  form,
  columns,
  resetToOriginalColumns,
  onSaveView,
  onApplyView,
  isSaving = false,
}: UseViewFormLogicProps) => {
  const [viewName, setViewName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [isDefault, setIsDefault] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState(!currentView);

  const [originalState, setOriginalState] = useState<OriginalState>({
    viewName: "",
    isPublic: false,
    isDefault: false,
    columns: cloneColumns(columns),
  });

  /* ------------------------ Sync ------------------------ */

  useEffect(() => {
    if (!currentView) return;

    setIsCreatingNew(false);
    setViewName(currentView.name);
    setIsPublic(currentView.isPublic);
    setIsDefault(currentView.isDefault);

    setOriginalState({
      viewName: currentView.name,
      isPublic: currentView.isPublic,
      isDefault: currentView.isDefault,
      columns: cloneColumns(currentView.config.columns),
    });
  }, [currentView]);

  /* ------------------------ Derived ------------------------ */

  const hasChanges = useMemo(() => {
    const columnsChanged = !areColumnsEqual(columns, originalState.columns);
    return (
      isPublic !== originalState.isPublic || isDefault !== originalState.isDefault || columnsChanged
    );
  }, [isPublic, isDefault, columns, originalState]);

  const canSave = useMemo(
    () => !!viewName.trim() && hasChanges && !isSaving,
    [viewName, hasChanges, isSaving],
  );

  /* ------------------------ Actions ------------------------ */

  const handleCancel = useCallback(() => {
    setViewName(originalState.viewName);
    setIsPublic(originalState.isPublic);
    setIsDefault(originalState.isDefault);

    const restoredColumns = cloneColumns(originalState.columns);
    resetToOriginalColumns(restoredColumns);
    onApplyView?.(restoredColumns);
  }, [originalState, resetToOriginalColumns, onApplyView]);

  const handleApply = useCallback(() => {
    onApplyView?.(columns);
  }, [columns, onApplyView]);

  const handleSwitchPublic = useCallback(
    (next: boolean) => {
      if (!next && isDefault) setIsDefault(false);
      setIsPublic(next);
    },
    [isDefault],
  );

  const handleSaveView = useCallback(() => {
    if (!form || !viewName.trim()) return;

    const view: TableView = {
      ...(currentView?.id && !isCreatingNew ? { id: currentView.id } : {}),
      formId: form.id,
      name: viewName.trim(),
      createdBy: user?.upn ?? "unknown",
      createdByName: getUserName(user?.firstName ?? "", user?.lastName ?? ""),
      isPublic,
      isDefault,
      config: { columns: cloneColumns(columns) },
      createdAt: currentView?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    setOriginalState({
      viewName: view.name,
      isPublic: view.isPublic,
      isDefault: view.isDefault,
      columns: cloneColumns(view.config.columns),
    });

    onSaveView(view);
    setIsCreatingNew(false);
  }, [form, viewName, user, isPublic, isDefault, columns, currentView, isCreatingNew, onSaveView]);

  /* ------------------------ API ------------------------ */

  return {
    viewName,
    setViewName,
    isPublic,
    isDefault,
    setIsDefault,
    isCreatingNew,
    isSaving,
    canSave,
    handleCancel,
    handleApply,
    handleSaveView,
    handleSwitchPublic,
  };
};
