import React, { useState } from "react";
import { IconButton, Tooltip, Select, MenuItem, InputLabel } from "@mui/material";
import { CalendarViewWeek } from "@mui/icons-material";

import { useViewControls } from "../../hooks/useViewControls";
import {
  Container,
  RightActions,
  ViewControlsContainer,
  StyledViewFormControl,
  ViewManageButton,
} from "./styled";

import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

interface OperationsContainerProps {
  user: any;
  form: any;
  allResponsesCount: number;

  currentFilter: any;
  rowSelection: Record<string, boolean>;
  permissionTypes: number[];

  viewResponse: () => void;
  editResponse: () => void;
  deleteAllSelectedResponses: () => void;
  deleteAllResponsesConfirmation?: () => void;

  // View management
  allViews: any[];
  selectedViewId?: string | number;
  handleViewDropdownChange: (e: any) => void;
  setIsSidePanelOpen?: (open: boolean) => void;
  isSidePanelOpen: boolean;

  // Quick edit
  isQuickEditMode: boolean;
  onToggleQuickEdit: () => void;
  onSaveChanges: () => Promise<void>;
  onCancelChanges: () => void;
  onAddNewResponse: () => void;
  hasUnsavedChanges: boolean;

  // Edit button state
  isEditButtonDisabled: boolean;
  editButtonDisabledReason?: string;
}

const OperationsContainer: React.FC<OperationsContainerProps> = ({
  user,
  form,
  allResponsesCount,
  currentFilter,
  rowSelection,
  permissionTypes,

  viewResponse,
  editResponse,
  deleteAllSelectedResponses,
  deleteAllResponsesConfirmation,

  allViews,
  selectedViewId,
  handleViewDropdownChange,
  setIsSidePanelOpen,
  isSidePanelOpen,

  isQuickEditMode,
  onToggleQuickEdit,
  onSaveChanges,
  onCancelChanges,
  onAddNewResponse,
  hasUnsavedChanges,

  isEditButtonDisabled,
  editButtonDisabledReason,
}) => {
  const [isSaving, setIsSaving] = useState(false);

  const { getViewDisplayName, isViewDefault } = useViewControls({
    allViews,
    selectedViewId,
    handleViewDropdownChange,
  });

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    try {
      await onSaveChanges();
      onToggleQuickEdit();
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAndExit = () => {
    onCancelChanges();
    onToggleQuickEdit();
  };

  return (
    <>
      {isSaving && <LoadingOverlay />}

      <ViewControlsContainer>
        <StyledViewFormControl variant="standard">
          <InputLabel id="view-select-label">תצוגת טבלה</InputLabel>

          <Select
            labelId="view-select-label"
            value={selectedViewId ?? ""}
            onChange={handleViewDropdownChange}
            size="small"
            sx={{ minWidth: 200 }}>
            <MenuItem value="">
              <em>כל השדות</em>
            </MenuItem>

            {/* {allViews?.map((view) => (
                  <MenuItem key={view.id} value={view.id}>
                    {getViewDisplayName(view)}
                  </MenuItem>
                ))} */}
          </Select>
        </StyledViewFormControl>

        <Tooltip title="ניהול תצוגות">
          <div>
            <ViewManageButton
              variant="contained"
              onClick={() => setIsSidePanelOpen?.(true)}
              disabled={isSidePanelOpen}>
              <CalendarViewWeek />
            </ViewManageButton>
          </div>
        </Tooltip>
      </ViewControlsContainer>
    </>
  );
};

export default OperationsContainer;
