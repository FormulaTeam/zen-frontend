import { useState } from "react";
import { TableView } from "../types/interfaces/tableViews.types";

export type ViewDisplayMode = "list" | "create" | "edit";

interface UseViewModeReturn {
  mode: ViewDisplayMode;
  editingView: TableView | null;
  setMode: (mode: ViewDisplayMode) => void;
  setEditingView: (view: TableView | null) => void;
  switchToList: () => void;
  switchToCreate: () => void;
  switchToEdit: (view: TableView) => void;
  isListMode: boolean;
  isCreateMode: boolean;
  isEditMode: boolean;
}

export const useViewMode = (): UseViewModeReturn => {
  const [mode, setMode] = useState<ViewDisplayMode>("list");
  const [editingView, setEditingView] = useState<TableView | null>(null);

  const switchToList = () => {
    setMode("list");
    setEditingView(null);
  };

  const switchToCreate = () => {
    setMode("create");
    setEditingView(null);
  };

  const switchToEdit = (view: TableView) => {
    setMode("edit");
    setEditingView(view);
  };

  return {
    mode,
    editingView,
    setMode,
    setEditingView,
    switchToList,
    switchToCreate,
    switchToEdit,
    isListMode: mode === "list",
    isCreateMode: mode === "create",
    isEditMode: mode === "edit",
  };
};
