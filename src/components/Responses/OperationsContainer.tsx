import React, { useState } from "react";
import AlertMsg from "../AlertMsg/AlertMsg";
import { IconButton, Tooltip, useTheme, Select, MenuItem, InputLabel } from "@mui/material";
import {
  Delete,
  Edit,
  Add,
  Visibility,
  CalendarViewWeek,
  EditNote,
  CheckOutlined,
  Close,
} from "@mui/icons-material";
import { PERMISSION_TYPES, getResponsesAndExportToExcel } from "../../utils/utils";
import { CustomIcon } from "../../theme/icons";
import { useViewControls } from "../../hooks/useViewControls";
import {
  ActionGroup,
  Container,
  LoadingBtnBox,
  RightActions,
  SmallRoundButton,
  StyledAddButton,
  ViewControlsContainer,
  StyledViewFormControl,
  ViewDefaultBadge,
  ViewMenuItem,
  ViewManageButton,
} from "./styled";
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
