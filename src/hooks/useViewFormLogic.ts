import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { ResponsesView, ViewColumn } from "../types/interfaces/tableViews.types";
import { ViewUserBase } from "../types/interfaces/view.types";
import { FormFieldDto, UserPersonalDto } from "../types/shared";
import { getUserName } from "../utils/utils";
import { PRE_SYSTEM_COLUMNS, POST_SYSTEM_VIEW_COLUMNS } from "./useViewColumnConfiguration";
import { MetaColumnIds } from "../utils/interfaces";

const PUBLIC_VIEW_DUPLICATE_NAME_ERROR = "קיימת כבר תצוגה ציבורית בשם הזה";

const normalizeViewName = (name: string): string => name.trim();

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

const mapResponseViewColumnsToViewColumns = (view: ResponsesView): ViewColumn[] => {
  return cloneColumns(
    view.columns?.map((column) => ({
      columnId:
        column.fieldId ||
        Object.keys(MetaColumnIds).find(
          (key) => MetaColumnIds[key as keyof typeof MetaColumnIds] === column.metaColumnId,
        ) ||
        "",
      displayName: column.displayName,
      visible: column.isVisible,
      order: column.index,
    })) ??
      view.config?.columns ??
      [],
  );
};

type ViewLogicForm = {
  id: string | number;
  name: string;
  fields: FormFieldDto[];
};

interface UseViewFormLogicProps {
  currentView?: ResponsesView;
  savedViews?: ResponsesView[];
  user?: ViewUserBase | UserPersonalDto;
  form?: ViewLogicForm;
  columns: ViewColumn[];
  createDefaultColumns: () => ViewColumn[];
  resetToOriginalColumns: (columns: ViewColumn[]) => void;
  onSaveView: (view: ResponsesView) => Promise<void>;
  onApplyView?: (view: ResponsesView) => void;
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
  savedViews = [],
  user,
  form,
  columns,
  resetToOriginalColumns,
  onSaveView,
  onApplyView,
  isSaving = false,
}: UseViewFormLogicProps) => {
  const [viewName, setViewName] = useState("");
  const [viewNameError, setViewNameError] = useState("");
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

  useEffect(() => {
    if (!currentView) return;
    if (currentView.id === lastSyncedViewId.current) return;

    lastSyncedViewId.current = currentView.id;

    setIsCreatingNew(false);
    setViewName(currentView.name);
    setViewNameError("");
    setIsPublic(currentView.isPublic);
    setIsDefault(currentView.isDefault);

    setOriginalState({
      viewName: currentView.name,
      isPublic: currentView.isPublic,
      isDefault: currentView.isDefault,
      columns: mapResponseViewColumnsToViewColumns(currentView),
    });
  }, [currentView]);

  const hasDuplicatePublicViewName = useCallback(
    (name: string, viewId?: string | number): boolean => {
      const normalizedName = normalizeViewName(name);

      return savedViews.some((savedView) => {
        if (!savedView.isPublic) return false;
        if (String(savedView.id ?? "") === String(viewId ?? "")) return false;

        return normalizeViewName(savedView.name) === normalizedName;
      });
    },
    [savedViews],
  );

  const hasChanges = useMemo(() => {
    const columnsChanged = !areColumnsEqual(columns, originalState.columns);
    const nameChanged = normalizeViewName(viewName) !== normalizeViewName(originalState.viewName);

    return (
      isCreatingNew ||
      nameChanged ||
      isPublic !== originalState.isPublic ||
      isDefault !== originalState.isDefault ||
      columnsChanged
    );
  }, [viewName, isPublic, isDefault, columns, originalState, isCreatingNew]);

  const canSave = useMemo(
    () => !!viewName.trim() && hasChanges && !isSaving,
    [viewName, hasChanges, isSaving],
  );

  const handleViewNameChange = useCallback((nextName: string) => {
    setViewName(nextName);
    setViewNameError("");
  }, []);

  const handleCancel = useCallback(() => {
    setViewName(originalState.viewName);
    setViewNameError("");
    setIsPublic(originalState.isPublic);
    setIsDefault(originalState.isDefault);

    const restoredColumns = cloneColumns(originalState.columns);
    resetToOriginalColumns(restoredColumns);

    if (isCreatingNew) {
      onApplyView?.(undefined as unknown as ResponsesView);
      return;
    }

    if (currentView) {
      onApplyView?.(currentView);
    }
  }, [originalState, resetToOriginalColumns, onApplyView, currentView, isCreatingNew]);

  const handleApply = useCallback(() => {
    if (!form) return;

    const sortedCol = columns.find((column) => column.sortOrder === 1);

    const view: ResponsesView = {
      ...(currentView?.id && !isCreatingNew ? { id: currentView.id } : {}),
      formId: String(form.id),
      name: viewName.trim() || "Temporary View",
      createdBy: (user as any)?.upn || (user as any)?.UPN || "unknown",
      isPublic,
      isDefault,
      sortDirection: sortedCol?.sortDirection || "desc",
      columns: columns.map((column, index) => {
        const isSystem =
          PRE_SYSTEM_COLUMNS.some((systemColumn) => systemColumn.columnId === column.columnId) ||
          POST_SYSTEM_VIEW_COLUMNS.some(
            (systemColumn) => systemColumn.columnId === column.columnId,
          );

        return {
          id: column.id,
          fieldId: isSystem ? null : column.columnId,
          metaColumnId: isSystem
            ? MetaColumnIds[column.columnId as keyof typeof MetaColumnIds]
            : null,
          displayName: column.displayName,
          isVisible: column.visible,
          index,
          isSortColumn: sortedCol?.columnId === column.columnId,
        };
      }),
    };

    onApplyView?.(view);
  }, [columns, onApplyView, form, viewName, user, isPublic, isDefault, currentView, isCreatingNew]);

  const handleSwitchPublic = useCallback(
    (next: boolean) => {
      if (!next && isDefault) setIsDefault(false);

      setIsPublic(next);
      setViewNameError("");
    },
    [isDefault],
  );

  const handleSaveView = useCallback(async () => {
    if (!form || !viewName.trim()) return;

    const normalizedName = normalizeViewName(viewName);
    const sortedCol = columns.find((column) => column.sortOrder === 1);

    const effectiveIsPublic = isDefault ? true : isPublic;
    const currentViewId = currentView?.id && !isCreatingNew ? currentView.id : undefined;

    if (effectiveIsPublic && hasDuplicatePublicViewName(normalizedName, currentViewId)) {
      setViewNameError(PUBLIC_VIEW_DUPLICATE_NAME_ERROR);
      return;
    }

    const view: ResponsesView = {
      ...(currentViewId ? { id: currentViewId } : {}),
      formId: String(form.id),
      name: normalizedName,
      createdBy: (user as any)?.upn || (user as any)?.UPN || "unknown",
      createdByName: getViewUserDisplayName(user),
      isPublic: effectiveIsPublic,
      isDefault,
      sortDirection: sortedCol?.sortDirection || "desc",
      columns: columns.map((column, index) => {
        const isSystem =
          PRE_SYSTEM_COLUMNS.some((systemColumn) => systemColumn.columnId === column.columnId) ||
          POST_SYSTEM_VIEW_COLUMNS.some(
            (systemColumn) => systemColumn.columnId === column.columnId,
          );

        return {
          id: column.id,
          fieldId: isSystem ? null : column.columnId,
          metaColumnId: isSystem
            ? MetaColumnIds[column.columnId as keyof typeof MetaColumnIds]
            : null,
          displayName: column.displayName,
          isVisible: column.visible,
          index,
          isSortColumn: sortedCol?.columnId === column.columnId,
        };
      }),
      config: { columns: cloneColumns(columns) },
      createdAt: currentView?.createdAt ?? new Date(),
      updatedAt: new Date(),
    };

    await onSaveView(view);

    setOriginalState({
      viewName: view.name,
      isPublic: view.isPublic,
      isDefault: view.isDefault,
      columns: cloneColumns(columns),
    });

    setIsCreatingNew(false);
    setViewNameError("");
  }, [
    form,
    viewName,
    user,
    isPublic,
    isDefault,
    columns,
    currentView,
    isCreatingNew,
    onSaveView,
    hasDuplicatePublicViewName,
  ]);

  return {
    viewName,
    setViewName: handleViewNameChange,
    viewNameError,
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
