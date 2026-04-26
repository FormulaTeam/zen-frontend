import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ResponsesView, ViewColumn } from "../types/interfaces/tableViews.types";
import { ViewUserBase } from "../types/interfaces/view.types";
import { FormFieldDto, UserPersonalDto } from "../types/shared";
import { getUserName } from "../utils/utils";
import { PRE_SYSTEM_COLUMNS, POST_SYSTEM_VIEW_COLUMNS } from "./useViewColumnConfiguration";
import { MetaColumnIds } from "../utils/interfaces";

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

const getViewUserDisplayName = (user?: ViewUserBase | UserPersonalDto): string => {
  if (!user) {
    return "";
  }

  if ("name" in user && typeof user.name === "string" && user.name.trim()) {
    return user.name;
  }

  const firstName = "firstName" in user && typeof user.firstName === "string" ? user.firstName : "";
  const lastName = "lastName" in user && typeof user.lastName === "string" ? user.lastName : "";

  return getUserName(firstName, lastName) || user.upn || "";
};

/* ------------------------ Types ------------------------ */

type ViewLogicForm = {
  id: string | number;
  name: string;
  fields: FormFieldDto[];
};

interface UseViewFormLogicProps {
  currentView?: ResponsesView;
  user?: ViewUserBase | UserPersonalDto;
  form?: ViewLogicForm;
  columns: ViewColumn[];
  createDefaultColumns: () => ViewColumn[];
  resetToOriginalColumns: (columns: ViewColumn[]) => void;
  onSaveView: (view: ResponsesView) => void;
  onApplyView?: (view: ResponsesView) => void;
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

  const lastSyncedViewId = useRef<string | number | undefined>(undefined);

  /* ------------------------ Sync ------------------------ */

  useEffect(() => {
    if (!currentView) return;
    if (currentView.id === lastSyncedViewId.current) return;
    lastSyncedViewId.current = currentView.id;

    setIsCreatingNew(false);
    setViewName(currentView.name);
    setIsPublic(currentView.isPublic);
    setIsDefault(currentView.isDefault);

    setOriginalState({
      viewName: currentView.name,
      isPublic: currentView.isPublic,
      isDefault: currentView.isDefault,
      columns: cloneColumns(currentView.columns?.map(c => ({
        columnId: c.fieldId || (Object.keys(MetaColumnIds).find(key => MetaColumnIds[key as keyof typeof MetaColumnIds] === c.metaColumnId)) || "",
        displayName: c.displayName,
        visible: c.isVisible,
        order: c.index
      })) ?? currentView.config?.columns ?? []),
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
    
    if (currentView) {
      onApplyView?.(currentView);
    }
  }, [originalState, resetToOriginalColumns, onApplyView, currentView]);

  const handleApply = useCallback(() => {
    if (!form) return;
    
    const sortedCol = columns.find(c => c.sortOrder === 1);

    const view: ResponsesView = {
      formId: String(form.id),
      name: viewName.trim() || "Temporary View",
      createdBy: (user as any)?.upn || (user as any)?.UPN || "unknown",
      isPublic,
      isDefault,
      sortColumnId: sortedCol?.id,
      sortDirection: sortedCol?.sortDirection || "asc",
      columns: columns.map((c, i) => {
        const isSystem = PRE_SYSTEM_COLUMNS.some(sc => sc.columnId === c.columnId) || 
                        POST_SYSTEM_VIEW_COLUMNS.some(sc => sc.columnId === c.columnId);
        
        return {
          id: c.id,
          fieldId: isSystem ? null : c.columnId,
          metaColumnId: isSystem ? MetaColumnIds[c.columnId as keyof typeof MetaColumnIds] : null,
          displayName: c.displayName,
          isVisible: c.visible,
          index: i,
        };
      }),
    };
    
    onApplyView?.(view);
  }, [columns, onApplyView, form, viewName, user, isPublic, isDefault]);

  const handleSwitchPublic = useCallback(
    (next: boolean) => {
      if (!next && isDefault) setIsDefault(false);
      setIsPublic(next);
    },
    [isDefault],
  );

  const handleSaveView = useCallback(() => {
    if (!form || !viewName.trim()) return;

    const sortedCol = columns.find(c => c.sortOrder === 1);

    const view: any = {
      ...(currentView?.id && !isCreatingNew ? { id: currentView.id } : {}),
      formId: String(form.id),
      name: viewName.trim(),
      createdBy: (user as any)?.upn || (user as any)?.UPN || "unknown",
      createdByName: getViewUserDisplayName(user),
      isPublic,
      isDefault,
      sortColumnId: sortedCol?.id,
      sortDirection: sortedCol?.sortDirection || "asc",
      columns: columns.map((c, i) => {
        const isSystem = PRE_SYSTEM_COLUMNS.some(sc => sc.columnId === c.columnId) || 
                        POST_SYSTEM_VIEW_COLUMNS.some(sc => sc.columnId === c.columnId);
        
        return {
          id: c.id,
          fieldId: isSystem ? null : c.columnId,
          metaColumnId: isSystem ? MetaColumnIds[c.columnId as keyof typeof MetaColumnIds] : null,
          displayName: c.displayName,
          isVisible: c.visible,
          index: i,
        };
      }),
      config: { columns: cloneColumns(columns) },
      createdAt: currentView?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    setOriginalState({
      viewName: view.name,
      isPublic: view.isPublic,
      isDefault: view.isDefault,
      columns: cloneColumns(columns),
    });

    onSaveView(view as ResponsesView);
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
