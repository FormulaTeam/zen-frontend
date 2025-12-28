import { useState, useEffect, useMemo, useCallback } from "react";
import { TableView, ViewColumn } from "../types/interfaces/tableViews.types";
import { ViewFormBase, ViewUserBase } from "../types/interfaces/view.types";
import { getUserName } from "../utils/utils";

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
    columns: [],
  });

  /* ---------------------------- Sync ---------------------------- */

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
      columns: currentView.config.columns,
    });
  }, [currentView]);

  /* -------------------------- Derived --------------------------- */

  const hasChanges = useMemo(() => {
    if (!currentView) return true;

    if (
      viewName !== originalState.viewName ||
      isPublic !== originalState.isPublic ||
      isDefault !== originalState.isDefault
    ) {
      return true;
    }

    const normalize = (cols: ViewColumn[]) =>
      [...cols]
        .sort((a, b) => a.columnId.localeCompare(b.columnId))
        .map((c) => ({
          id: c.columnId,
          v: c.visible,
          sd: c.sortDirection ?? null,
          so: c.sortOrder ?? null,
        }));

    return JSON.stringify(normalize(columns)) !== JSON.stringify(normalize(originalState.columns));
  }, [viewName, isPublic, isDefault, columns, originalState, currentView]);

  /* --------------------------- Actions --------------------------- */

  const handleCancel = useCallback(() => {
    setViewName(originalState.viewName);
    setIsPublic(originalState.isPublic);
    setIsDefault(originalState.isDefault);
    resetToOriginalColumns(originalState.columns);
    onApplyView?.(originalState.columns);
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
      config: { columns },
      createdAt: currentView?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    setOriginalState({
      viewName: view.name,
      isPublic: view.isPublic,
      isDefault: view.isDefault,
      columns: view.config.columns,
    });

    onSaveView(view);
    setIsCreatingNew(false);
  }, [form, viewName, user, isPublic, isDefault, columns, currentView, isCreatingNew, onSaveView]);

  return {
    viewName,
    setViewName,
    isPublic,
    isDefault,
    setIsDefault,
    isCreatingNew,
    isSaving,
    hasChanges,
    handleCancel,
    handleApply,
    handleSaveView,
    handleSwitchPublic,
  };
};
