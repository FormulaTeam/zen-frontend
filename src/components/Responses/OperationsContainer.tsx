import React, { useState } from "react";
import { Tooltip, Select, MenuItem, InputLabel } from "@mui/material";
import TableViewIcon from "@mui/icons-material/TableView";
import { useViewControls } from "../../hooks/useViewControls";
import { ViewControlsContainer, StyledViewFormControl, ViewManageButton } from "./styled";
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

enum HebrewTitles {
  TABLE_VIEW = "תצוגת טבלה",
  MANAGE_VIEWS = "ניהול תצוגות",
  ALL_FIELDS = "כל השדות",
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
          <InputLabel id="view-select-label">{HebrewTitles.TABLE_VIEW}</InputLabel>

          <Select
            labelId="view-select-label"
            value={selectedViewId ?? ""}
            onChange={handleViewDropdownChange}
            size="small"
            sx={{ minWidth: 200 }}>
            <MenuItem value="">
              <em>{HebrewTitles.ALL_FIELDS}</em>
            </MenuItem>

            {allViews?.map((view) => (
              <MenuItem key={view.id} value={view.id}>
                {getViewDisplayName(view)}
              </MenuItem>
            ))}
          </Select>
        </StyledViewFormControl>

        <Tooltip title={HebrewTitles.MANAGE_VIEWS}>
          <ViewManageButton
            variant="contained"
            onClick={() => setIsSidePanelOpen?.(true)}
            disabled={isSidePanelOpen}>
            <TableViewIcon />
          </ViewManageButton>
        </Tooltip>
      </ViewControlsContainer>
    </>
  );
};

export default OperationsContainer;
