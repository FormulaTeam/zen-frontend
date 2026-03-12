import { useState } from "react";
import { useViewManager } from "../../../hooks/useViewManager";
import { useAuth } from "../../../contexts/AuthContext";
import { useFormStore } from "../stores/form.store";
import { ResponsesView, ViewColumn } from "../../../types/interfaces/tableViews.types";

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

export const useResponsesViews = (): UseResponsesViewsReturn => {
    const { form } = useFormStore();
    const { user } = useAuth();

    const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

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
        form: form
            ? {
                id: String(form.id),
                name: form.name ?? "",
                fields: (form.fields ?? []).map((f) => ({
                    uniqueId: String(f.uniqueId ?? f.name),
                    name: f.name ?? "",
                    displayName: f.displayName ?? f.name ?? "",
                    required: !!f.required,
                    index: f.index ?? 0,
                    fieldType: String(f.typeId ?? ""),
                })),
            }
            : undefined,
        user: user
            ? {
                upn: user.upn,
                firstName: user.firstName,
                lastName: user.lastName,
            }
            : undefined,
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
