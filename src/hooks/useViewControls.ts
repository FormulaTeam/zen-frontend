import { useState } from "react";
import { ResponsesView } from "../types/interfaces/tableViews.types";

interface UseViewControlsProps {
  allViews?: ResponsesView[];
  selectedViewId?: string | number;
  handleViewDropdownChange?: (event: any) => void;
}

interface UseViewControlsReturn {
  isSidePanelOpen: boolean;
  setIsSidePanelOpen: (open: boolean) => void;
  toggleSidePanel: () => void;
  getViewDisplayName: (view: ResponsesView) => string;
  isViewDefault: (view: ResponsesView) => boolean;
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

  const getViewDisplayName = (view: ResponsesView): string => {
    return view.name || "Unnamed View";
  };

  const isViewDefault = (view: ResponsesView): boolean => {
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
