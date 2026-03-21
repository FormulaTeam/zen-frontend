import { useMemo, useState } from "react";
import { useViewManager } from "../../../hooks/useViewManager";
import { useAuth } from "../../../contexts/AuthContext";
import { useFormStore } from "../stores/form.store";
import { ResponsesView, ViewColumn } from "../../../types/interfaces/tableViews.types";
import { FormDto, FormFieldDto, UserPersonalDto } from "../../../types/shared";

export interface UseResponsesViewsReturn {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  currentViewConfig: ViewColumn[] | undefined;
  currentView: ResponsesView | undefined;
  savedViews: ResponsesView[];
  selectedViewId: string;
  isSaving: boolean;
  handleSaveView: (view: ResponsesView) => Promise<void>;
  handleLoadView: (view: ResponsesView) => void;
  handleViewDropdownChange: (viewId: string) => void;
  handleApplyView: (config: ViewColumn[]) => void;
  handleDeleteView: (view: ResponsesView) => Promise<void>;
}

type ViewManagerForm = Pick<FormDto, "id" | "name"> & {
  fields: FormFieldDto[];
};

export const useResponsesViews = (): UseResponsesViewsReturn => {
  const { form } = useFormStore();
  const { user } = useAuth();

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const viewManagerForm = useMemo<ViewManagerForm | undefined>(() => {
    if (!form) {
      return undefined;
    }

    const flattenedFields = (form.sections ?? [])
      .flatMap((section) => section.fields ?? [])
      .sort((a, b) => a.index - b.index);

    return {
      id: form.id,
      name: form.name ?? "",
      fields: flattenedFields,
    };
  }, [form]);

  const viewManagerUser = useMemo<UserPersonalDto | undefined>(() => {
    if (!user) {
      return undefined;
    }

    const safeUpn = "upn" in user && typeof user.upn === "string" ? user.upn : "";

    if ("name" in user && typeof user.name === "string") {
      return {
        name: user.name || safeUpn,
        upn: safeUpn,
      };
    }

    const firstName =
      "firstName" in user && typeof user.firstName === "string" ? user.firstName : "";
    const lastName = "lastName" in user && typeof user.lastName === "string" ? user.lastName : "";
    const fullName = `${firstName} ${lastName}`.trim();

    return {
      name: fullName || safeUpn,
      upn: safeUpn,
    };
  }, [user]);

  const {
    currentView,
    savedViews,
    currentViewConfig,
    selectedViewId,
    isSaving,
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  } = useViewManager({
    form: viewManagerForm,
    user: viewManagerUser,
  });

  return {
    isSidePanelOpen,
    setIsSidePanelOpen,
    currentViewConfig,
    currentView,
    savedViews,
    selectedViewId,
    isSaving,
    handleSaveView,
    handleLoadView,
    handleViewDropdownChange,
    handleApplyView,
    handleDeleteView,
  };
};
