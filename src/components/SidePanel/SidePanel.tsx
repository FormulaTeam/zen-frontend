import React from "react";
import { IconButton, Typography, Box } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { SidePanelContainer, SidePanelHeader, SidePanelContent } from "./styled";
import ViewManager from "../ViewManager/ViewManager";
import { TableView, ViewColumn } from "../../types/interfaces/tableViews.types";

interface Form {
  id: string;
  fields: any[];
  [key: string]: any;
}

interface User {
  upn?: string;
  email?: string;
  isSuperAdmin?: boolean;
  [key: string]: any;
}

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  form?: Form;
  user?: User;
  onSaveView?: (view: TableView) => void;
  onLoadView?: (view: TableView) => void;
  onDeleteView?: (view: TableView) => void;
  onApplyView?: (viewConfig: ViewColumn[]) => void;
  currentView?: TableView;
  savedViews?: TableView[];
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
