import {
  Add,
  CalendarViewWeek,
  CheckOutlined,
  Close,
  Delete,
  Edit,
  EditNote,
  Visibility,
} from "@mui/icons-material";
import {
  Container,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Tooltip,
  useTheme,
} from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useViewControls } from "../../../hooks/useViewControls";
import { CustomIcon } from "../../../theme/icons";
import { PERMISSION_TYPES, getResponsesAndExportToExcel } from "../../../utils/utils";

import AlertMsg from "../../../components/AlertMsg/AlertMsg";
import LoadingOverlay from "../../../components/LoadingOverlay/LoadingOverlay";
import {
  ActionGroup,
  RightActions,
  SmallRoundButton,
  StyledAddButton,
  StyledViewFormControl,
  ViewControlsContainer,
  ViewDefaultBadge,
  ViewManageButton,
  ViewMenuItem,
} from "../../../components/Responses/styled";
import { useFormStore } from "../stores/form.store";
import { PermissionGate } from "../PermissionGate";
import { Filter } from "../../../utils/interfaces";
import { useResponsesList } from "../../../hooks/useResponsesList";
import { ResponsesView } from "../../../types/interfaces/tableViews.types";

const OperationsContainer = ({
  rowSelection,
  allResponsesCount,
  isQuickEditMode = false,
  onToggleQuickEdit,
  onSaveChanges,
  onCancelChanges,
  onAddNewResponse,
  hasUnsavedChanges = false,
  isEditButtonDisabled = false,
  editButtonDisabledReason = "",
  // View management props
  allViews,
  selectedViewId,
  handleViewDropdownChange,
  setIsSidePanelOpen,
  isSidePanelOpen,
}: {
  viewResponse: () => void;
  rowSelection: any;
  editResponse: () => void;
  deleteAllSelectedResponses: () => void;
  allResponsesCount: number;
  currentFilter: Filter;
  isQuickEditMode?: boolean;
  onToggleQuickEdit: () => void;
  onSaveChanges: () => Promise<void>;
  onCancelChanges: () => void;
  onAddNewResponse: () => void;
  hasUnsavedChanges?: boolean;
  isEditButtonDisabled?: boolean;
  editButtonDisabledReason?: string;
  // View management props
  allViews: ResponsesView[];
  selectedViewId: string | number;
  handleViewDropdownChange: (event: any) => void;
  setIsSidePanelOpen?: (isOpen: boolean) => void;
  isSidePanelOpen?: boolean;
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showSaveLoader, setShowSaveLoader] = useState<boolean>(false);
  const { form, permissions } = useFormStore();

  const { currentFilter, deleteAllSelectedResponses, editResponse, viewResponse } =
    useResponsesList({
      setShouldRefreshPage: () => {},
      user: null,
    }); // to avoid errors

  // Use the view controls hook
  const { getViewDisplayName, isViewDefault } = useViewControls({
    allViews,
    selectedViewId,
    handleViewDropdownChange,
  });

  const handleFinishEditing = () => {
    if (hasUnsavedChanges) {
      setShowConfirmDialog(true);
    } else {
      // No changes, just exit edit mode
      onToggleQuickEdit();
    }
  };

  const handleSaveAndExit = async () => {
    setShowConfirmDialog(false);
    setShowSaveLoader(true);
    try {
      await onSaveChanges();
    } finally {
      setShowSaveLoader(false);
    }
  };

  const handleCancelAndExit = () => {
    setShowConfirmDialog(false);
    onCancelChanges();
    // Exit quick edit mode after canceling
    onToggleQuickEdit();
  };

  return (
    <>
      {showSaveLoader && <LoadingOverlay />}

      <Container>
        <ActionGroup>
          <Tooltip
            title={
              isQuickEditMode
                ? "לא זמין במצב עריכה מהירה"
                : "צפייה בתגובה - בחר תגובה אחת כדי לצפות בה"
            }>
            <div>
              <IconButton
                onClick={viewResponse}
                disabled={
                  isQuickEditMode ||
                  Object.entries(rowSelection)?.length !== 1 ||
                  (!permissions.includes(PERMISSION_TYPES.VIEW_RESPONSE) &&
                    !permissions.includes(PERMISSION_TYPES.VIEW_YOUR_RESPONSES))
                }>
                <Visibility />
              </IconButton>
            </div>
          </Tooltip>

          {/* Edit response */}
          <Tooltip
            title={isQuickEditMode ? "לא זמין במצב עריכה מהירה" : "עריכה מלאה - פתח טופס עריכה"}>
            <div>
              <IconButton
                onClick={editResponse}
                disabled={
                  isQuickEditMode ||
                  Object.entries(rowSelection)?.length !== 1 ||
                  !permissions.includes(PERMISSION_TYPES.EDIT_RESPONSE)
                }>
                <Edit />
              </IconButton>
            </div>
          </Tooltip>

          <Tooltip title={isQuickEditMode ? "לא זמין במצב עריכה מהירה" : "מחיקת תגובות נבחרות"}>
            <div>
              <IconButton
                disabled={
                  isQuickEditMode ||
                  Object.entries(rowSelection)?.length === 0 ||
                  !permissions.includes(PERMISSION_TYPES.DELETE_RESPONSE)
                }
                onClick={deleteAllSelectedResponses}>
                <Delete />
              </IconButton>
            </div>
          </Tooltip>

          <Tooltip
            title={
              isQuickEditMode
                ? "שמירה ויציאה מעריכה מהירה"
                : isEditButtonDisabled
                ? editButtonDisabledReason
                : "עריכה מהירה"
            }>
            <div>
              <IconButton
                onClick={isQuickEditMode ? handleSaveAndExit : onToggleQuickEdit}
                disabled={
                  !isQuickEditMode &&
                  (isEditButtonDisabled || !permissions.includes(PERMISSION_TYPES.EDIT_RESPONSE))
                }
                color={isQuickEditMode ? "secondary" : "default"}>
                {isQuickEditMode ? <CheckOutlined /> : <EditNote />}
              </IconButton>
            </div>
          </Tooltip>

          {/* X button to exit tabular edit mode without saving */}
          {isQuickEditMode && (
            <Tooltip title="יציאה מעריכה מהירה בלי שמירה - כל השינויים יאבדו">
              <div>
                <IconButton onClick={handleFinishEditing} color="error">
                  <Close />
                </IconButton>
              </div>
            </Tooltip>
          )}

          {/* Add new response button (only in tabular edit mode) */}
          {isQuickEditMode && (
            <Tooltip title="הוספת שורה חדשה">
              <div>
                <IconButton onClick={onAddNewResponse} color="primary">
                  <Add />
                </IconButton>
              </div>
            </Tooltip>
          )}
        </ActionGroup>

        <RightActions>
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
                {allViews?.map((view) => (
                  <MenuItem key={view.id} value={view.id}>
                    <ViewMenuItem>
                      <span>{getViewDisplayName(view)}</span>
                      {isViewDefault(view) && <ViewDefaultBadge>ברירת מחדל</ViewDefaultBadge>}
                    </ViewMenuItem>
                  </MenuItem>
                ))}
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

          <StyledAddButton
            color="secondary"
            variant="contained"
            title={isQuickEditMode ? "לא זמין במצב עריכה מהירה" : "הוסף תגובה חדשה לטופס זה"}
            onClick={() => navigate(`/response/create/${form.id}`)}
            startIcon={<Add />}
            disabled={
              isQuickEditMode ||
              !(form?.fields?.length > 0) ||
              !permissions.includes(PERMISSION_TYPES.CREATE_RESPONSE)
            }>
            הוספת תגובה חדשה
          </StyledAddButton>

          <PermissionGate
            permissions={[PERMISSION_TYPES.EXPORT_FORM]}
            userPermissions={permissions}>
            <Tooltip
              title={
                isQuickEditMode
                  ? "לא זמין במצב עריכה מהירה"
                  : `ייצוא ${allResponsesCount} תגובות לאקסל`
              }>
              <SmallRoundButton
                backgroundcolor={theme.palette.success.main}
                onClick={() => getResponsesAndExportToExcel(form)}
                disabled={isQuickEditMode || !(form?.fields?.length > 0) || allResponsesCount === 0}
                variant="contained">
                <CustomIcon iconName="excel" forcePointer />
              </SmallRoundButton>
            </Tooltip>
          </PermissionGate>
        </RightActions>

        {/* Confirm unsaved changes */}
        {showConfirmDialog && (
          <AlertMsg
            msg={["יש לך שינויים שלא נשמרו בעריכה המהירה.", "האם ברצונך לשמור לפני היציאה?"]}
            closePopup={() => setShowConfirmDialog(false)}
            onOk={handleSaveAndExit}
            onClose={handleCancelAndExit}
            isTabularEdit={true}
          />
        )}
      </Container>
    </>
  );
};

export default OperationsContainer;
