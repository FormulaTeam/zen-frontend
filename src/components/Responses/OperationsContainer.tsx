import { useState } from "react";
import { Tooltip, Select, MenuItem, InputLabel } from "@mui/material";
import { useViewControls } from "../../hooks/useViewControls";
import { ViewControlsContainer, StyledViewFormControl, ViewManageButton } from "./styled";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";
import { BackupTable } from "@mui/icons-material";

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

export function OperationsContainer({
  allViews,
  selectedViewId,
  handleViewDropdownChange,
  setIsSidePanelOpen,
  isSidePanelOpen,
}: OperationsContainerProps) {
  const { getViewDisplayName } = useViewControls({
    allViews,
    selectedViewId,
    handleViewDropdownChange,
  });

  const hasViews: boolean = allViews && allViews.length > 0;

  return (
    <ViewControlsContainer>
      {hasViews && (
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
      )}

      <Tooltip title={HebrewTitles.MANAGE_VIEWS} disableHoverListener={!hasViews}>
        <span>
          <ViewManageButton
            variant="contained"
            onClick={() => setIsSidePanelOpen?.(true)}
            disabled={isSidePanelOpen}>
            <BackupTable />
            {!hasViews && <span>{HebrewTitles.MANAGE_VIEWS}</span>}
          </ViewManageButton>
        </span>
      </Tooltip>
    </ViewControlsContainer>
  );
}
