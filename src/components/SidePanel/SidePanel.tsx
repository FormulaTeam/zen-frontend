import React, { useCallback } from "react";
import { IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import { SidePanelContainer, SidePanelHeader, SidePanelContent } from "./styled";
import { ViewManager } from "../Views/ViewManager/ViewManager";
import { ResponsesView } from "../../types/interfaces/tableViews.types";
import { ViewUserBase } from "../../types/interfaces/view.types";
import { FormFieldDto, UserPersonalDto } from "../../types/shared";

type SidePanelForm = {
  id: string | number;
  name: string;
  fields: FormFieldDto[];
};

type SidePanelUser = ViewUserBase | UserPersonalDto;

type SaveViewHandler = (view: ResponsesView) => void | Promise<void>;

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
  form?: SidePanelForm;
  user?: SidePanelUser;
  onSaveView?: SaveViewHandler;
  onLoadView?: (view: ResponsesView) => void;
  onDeleteView?: (view: ResponsesView) => void;
  onApplyView?: (view: ResponsesView) => void;
  currentView?: ResponsesView;
  savedViews?: ResponsesView[];
  permissionTypes?: number[];
  isSaving?: boolean;
}

const SidePanel: React.FC<SidePanelProps> = ({
  isOpen,
  onClose,
  title,
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
  const handleSaveView = useCallback(
    async (view: ResponsesView): Promise<void> => {
      await onSaveView?.(view);
    },
    [onSaveView],
  );

  const handleLoadView = useCallback(
    (view: ResponsesView): void => {
      onLoadView?.(view);
    },
    [onLoadView],
  );

  return (
    <SidePanelContainer $isOpen={isOpen}>
      <SidePanelHeader $isOpen={isOpen}>
        <Typography variant="h6" component="h2">
          {title}
        </Typography>

        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </SidePanelHeader>

      <SidePanelContent $isOpen={isOpen}>
        {children || (
          <ViewManager
            form={form}
            user={user}
            onSaveView={handleSaveView}
            onLoadView={handleLoadView}
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
