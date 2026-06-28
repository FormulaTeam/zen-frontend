import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  useGetResponsesViews,
  useCreateResponsesView,
  useUpdateResponsesView,
  useDeleteResponsesView,
} from "../api/responsesViewsApi";
import { ResponsesView, ViewColumn } from "../types/interfaces/tableViews.types";
import { showErrorNotification, showSuccessNotification, getUserName } from "../utils/utils";
import { applyViewSorting } from "../utils/viewSortingUtils";
import { ViewUserBase } from "../types/interfaces/view.types";
import { FormFieldDto, UserPersonalDto, MetaColumnIds } from "../types/shared";

type ViewManagerFormBase = {
  id: string | number;
  name: string;
  fields: FormFieldDto[];
};

type ViewManagerUserBase = ViewUserBase | UserPersonalDto;

interface UseViewManagerProps {
  form?: ViewManagerFormBase;
  user?: ViewManagerUserBase;
  onViewConfigChange?: (viewConfig?: ViewColumn[]) => void;
  setSorting?: (sorting: any[]) => void;
  tableColumns?: any[];
  isRowsLoading?: boolean;
  setIsRowsLoading?: (loading: boolean) => void;
}

enum HebrewMessages {
  LoadViewsError = "נכשל בטעינת התצוגות",
  SaveViewSuccess = "תצוגה נשמרה",
  UpdateViewSuccess = "תצוגה עודכנה",
  SaveViewError = "נכשל בשמירת התצוגה",
  DuplicatePublicViewName = "קיימת כבר תצוגה ציבורית בשם הזה",
  DeleteViewSuccess = "התצוגה נמחקה",
  DeleteViewError = "נכשל במחיקת התצוגה",
}

const getViewUserDisplayName = (user?: ViewManagerUserBase) => {
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

const isResponsesViewNameNotUniqueError = (error: unknown): boolean => {
  const responseData = (error as any)?.response?.data;

  const serializedError =
    typeof responseData === "string" ? responseData : JSON.stringify(responseData ?? error ?? {});

  return (
    serializedError.includes("ResponsesViewNameNotUnique") ||
    serializedError.includes("RESPONSES_VIEW_NAME_NOT_UNIQUE") ||
    serializedError.includes("ResponsesViewNameNotUnique")
  );
};

const getViewConfigColumns = (view: ResponsesView): ViewColumn[] => {
  return (
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
    []
  );
};

export const useViewManager = ({
  form,
  user,
  onViewConfigChange,
  setSorting,
  tableColumns,
}: UseViewManagerProps) => {
  const formId = form ? String(form.id) : "";
  const [currentView, setCurrentView] = useState<ResponsesView>();
  const [currentViewConfig, setCurrentViewConfig] = useState<ViewColumn[]>();
  const [selectedViewId, setSelectedViewId] = useState<string>("");
  const previousFormId = useRef(formId);
  const hasAttemptedInitialLoad = useRef(false);
  const lastAppliedViewId = useRef<string | number | undefined>(undefined);

  const { data: formViews = [], error } = useGetResponsesViews(formId);

  const { mutateAsync: createView, isPending: isCreating } = useCreateResponsesView(formId);
  const { mutateAsync: updateView, isPending: isUpdating } = useUpdateResponsesView(formId);
  const { mutateAsync: deleteView } = useDeleteResponsesView(formId);

  const isSaving = isCreating || isUpdating;

  useEffect(() => {
    if (error) {
      console.error(error);
      showErrorNotification(HebrewMessages.LoadViewsError);
    }
  }, [error]);

  const normalizeViewForCurrentForm = useCallback(
    (view: ResponsesView): ResponsesView => ({
      ...view,
      formId: String((view as any).formId ?? (view as any).form_id ?? formId),
    }),
    [formId],
  );

  const availableViews = useMemo(() => {
    const userUpn = ((user as any)?.upn || (user as any)?.UPN || "").toLowerCase();

    return formViews.map(normalizeViewForCurrentForm).sort((a, b) => {
      if (a.isDefault && !b.isDefault) return -1;
      if (!a.isDefault && b.isDefault) return 1;

      if (a.isPublic && !b.isPublic) return -1;
      if (!a.isPublic && b.isPublic) return 1;

      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;

      if (dateA !== dateB) {
        return dateB - dateA;
      }

      return a.name.localeCompare(b.name);
    });
  }, [formViews, normalizeViewForCurrentForm, user]);

  useEffect(() => {
    onViewConfigChange?.(currentViewConfig);
  }, [currentViewConfig, onViewConfigChange]);

  useEffect(() => {
    if (previousFormId.current === formId) return;

    previousFormId.current = formId;
    hasAttemptedInitialLoad.current = false;
    lastAppliedViewId.current = undefined;
    setCurrentView(undefined);
    setCurrentViewConfig(undefined);
    setSelectedViewId("");
    setSorting?.([]);
  }, [formId, setSorting]);

  const handleSaveView = useCallback(
    async (view: ResponsesView) => {
      if (!form) return;

      try {
        const isPublic = view.isDefault ? true : view.isPublic;

        const payload: any = {
          ...view,
          isPublic,
          formId: String(form.id),
          createdBy: (user as any)?.upn || (user as any)?.UPN || "unknown",
          createdByName: getViewUserDisplayName(user),
        };

        let saved: ResponsesView;

        if (payload.id) {
          const patchPayload = { ...payload };

          delete patchPayload.id;
          delete patchPayload.createdAt;
          delete patchPayload.updatedAt;
          delete patchPayload.createdBy;
          delete patchPayload.formId;

          saved = await updateView({
            responsesViewId: payload.id,
            updates: patchPayload,
          });
        } else {
          saved = await createView(payload);
        }

        showSuccessNotification(
          payload.id ? HebrewMessages.UpdateViewSuccess : HebrewMessages.SaveViewSuccess,
        );

        const normalizedSaved = normalizeViewForCurrentForm(saved);

        setCurrentView(normalizedSaved);
        setSelectedViewId(normalizedSaved.id ? String(normalizedSaved.id) : "");
        setCurrentViewConfig(getViewConfigColumns(normalizedSaved));
      } catch (err) {
        console.error(err);

        showErrorNotification(
          isResponsesViewNameNotUniqueError(err)
            ? HebrewMessages.DuplicatePublicViewName
            : HebrewMessages.SaveViewError,
        );

        throw err;
      }
    },
    [form, user, createView, updateView, normalizeViewForCurrentForm],
  );

  const handleLoadView = useCallback(
    (view: ResponsesView) => {
      const normalizedView = normalizeViewForCurrentForm(view);

      setCurrentView(normalizedView);
      setCurrentViewConfig(getViewConfigColumns(normalizedView));
      setSelectedViewId(normalizedView.id ? String(normalizedView.id) : "");

      if (setSorting && tableColumns?.length) {
        applyViewSorting(setSorting, normalizedView, tableColumns);
      }
    },
    [normalizeViewForCurrentForm, setSorting, tableColumns],
  );

  useEffect(() => {
    if (hasAttemptedInitialLoad.current) return;

    if (availableViews.length > 0) {
      hasAttemptedInitialLoad.current = true;

      const defaultView = availableViews.find((view) => view.isDefault);

      if (defaultView) {
        handleLoadView(defaultView);
      }
    }
  }, [availableViews, handleLoadView]);

  useEffect(() => {
    if (!setSorting) return;

    if (currentView && tableColumns?.length) {
      if (currentView.id !== lastAppliedViewId.current) {
        applyViewSorting(setSorting, currentView, tableColumns);
        lastAppliedViewId.current = currentView.id;
      }
    } else {
      if (lastAppliedViewId.current !== undefined) {
        setSorting([]);
        lastAppliedViewId.current = undefined;
      }
    }
  }, [currentView, tableColumns, setSorting]);

  const handleViewDropdownChange = useCallback(
    (viewId: string) => {
      setSelectedViewId(viewId);

      if (!viewId) {
        setCurrentView(undefined);
        setCurrentViewConfig(undefined);
        setSorting?.([]);
        return;
      }

      const view = availableViews.find((availableView) =>
        availableView.id ? String(availableView.id) === viewId : false,
      );

      if (view) {
        handleLoadView(view);
      }
    },
    [availableViews, handleLoadView, setSorting],
  );

  const handleApplyView = useCallback(
    (view: ResponsesView) => {
      const normalizedView = normalizeViewForCurrentForm(view);

      setCurrentView(normalizedView);
      setCurrentViewConfig(getViewConfigColumns(normalizedView));

      if (setSorting && tableColumns?.length) {
        applyViewSorting(setSorting, normalizedView, tableColumns);
      }
    },
    [normalizeViewForCurrentForm, setSorting, tableColumns],
  );

  const handleDeleteView = useCallback(
    async (view: ResponsesView) => {
      if (!view.id || !form) return;

      try {
        await deleteView(view.id);

        if (currentView?.id === view.id) {
          setCurrentView(undefined);
          setCurrentViewConfig(undefined);
          setSelectedViewId("");
        }

        showSuccessNotification(HebrewMessages.DeleteViewSuccess);
      } catch (err) {
        console.error(err);
        showErrorNotification(HebrewMessages.DeleteViewError);
      }
    },
    [currentView, deleteView, form],
  );

  const defaultViewId = useMemo(() => {
    const defaultView = availableViews.find((view) => view.isDefault);

    return defaultView?.id ? String(defaultView.id) : "";
  }, [availableViews]);

  const scopedCurrentView = useMemo(() => {
    if (!currentView || String(currentView.formId) !== formId) {
      return undefined;
    }

    return currentView;
  }, [currentView, formId]);

  const scopedCurrentViewConfig = scopedCurrentView ? currentViewConfig : undefined;

  return {
    currentView: scopedCurrentView,
    savedViews: availableViews,
    currentViewConfig: scopedCurrentViewConfig,
    selectedViewId: scopedCurrentView ? selectedViewId : "",
    defaultViewId,
    isSaving,
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  };
};
