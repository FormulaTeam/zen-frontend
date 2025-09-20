import { useState } from "react";
import { TableView } from "../types/interfaces/tableViews.types";

interface UseViewControlsProps {
  allViews?: TableView[];
  selectedViewId?: string | number;
  handleViewDropdownChange?: (event: any) => void;
}

interface UseViewControlsReturn {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  toggleSidePanel: () => void;
  getViewDisplayName: (view: TableView) => string;
  isViewDefault: (view: TableView) => boolean;
  hasViews: boolean;
}

export const useViewControls = ({
  allViews = [],
  selectedViewId,
  handleViewDropdownChange,
}: UseViewControlsProps): UseViewControlsReturn => {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const toggleSidePanel = () => {
    setIsSidePanelOpen(!isSidePanelOpen);
  };

  const getViewDisplayName = (view: TableView): string => {
    return view.name || "Unnamed View";
  };

  const isViewDefault = (view: TableView): boolean => {
    return view.isDefault || false;
  };

  const hasViews = allViews.length > 0;

  return {
    isSidePanelOpen,
    setIsSidePanelOpen,
    toggleSidePanel,
    getViewDisplayName,
    isViewDefault,
    hasViews,
  };
};
