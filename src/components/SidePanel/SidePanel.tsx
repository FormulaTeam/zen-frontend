import React from "react";
import { IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SidePanelContainer, SidePanelHeader, SidePanelContent } from "./styled";
import ViewManager from "../Views/ViewManager/ViewManager";
import { ResponsesView, ViewColumn } from "../../types/interfaces/tableViews.types";
import { ViewFormBase, ViewUserBase } from "../../types/interfaces/view.types";

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  form?: ViewFormBase;
  user?: ViewUserBase;
  onSaveView?: (view: ResponsesView) => void;
  onLoadView?: (view: ResponsesView) => void;
  onDeleteView?: (view: ResponsesView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  currentView?: ResponsesView;
  savedViews?: ResponsesView[];
  permissionTypes?: number[];
  isSaving?: boolean;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title = "תצוגת טבלה",
  children,
  form,
  user,
  onSaveView,
  onLoadView,
  onDeleteView,
  onApplyView,
  currentView,
  savedViews,
  permissionTypes,
  isSaving = false,
}) => {
  if (!isOpen) return <></>;

  return (
    <SidePanelContainer>
      <SidePanelHeader>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </SidePanelHeader>
      <SidePanelContent>
        {children || (
          <ViewManager
            form={form}
            user={user}
            onSaveView={onSaveView || (() => {})}
            onLoadView={onLoadView || (() => {})}
            onDeleteView={onDeleteView}
            onApplyView={onApplyView}
            currentView={currentView}
            savedViews={savedViews}
            permissionTypes={permissionTypes}
            isSaving={isSaving}
          />
        )}
      </SidePanelContent>
    </SidePanelContainer>
  );
};

export default SidePanel;
