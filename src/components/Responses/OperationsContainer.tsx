import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
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
import ReactLoading from "react-loading";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

const OperationsContainer: React.FC<any> = ({
  permissionTypes,
  viewResponse,
  rowSelection,
  editResponse,
  deleteAllSelectedResponses,
  user,
  form,
  allResponsesCount,
  currentFilter,
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
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [showLoadingExcelBtn, setShowLoadingExcelBtn] = useState<boolean>(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [showSaveLoader, setShowSaveLoader] = useState<boolean>(false);

  // Use the view controls hook
  const { getViewDisplayName, isViewDefault } = useViewControls({
    allViews,
    selectedViewId,
    handleViewDropdownChange,
  });

  useEffect(() => {
    if (showLoadingExcelBtn) {
      exportExcelAndStopLoading();
    }
  }, [showLoadingExcelBtn]);

  const exportExcelAndStopLoading = async () => {
    await getResponsesAndExportToExcel(form);
    setShowLoadingExcelBtn(false);
  };

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
                  (!permissionTypes.includes(PERMISSION_TYPES.VIEW_RESPONSE) &&
                    !permissionTypes.includes(PERMISSION_TYPES.VIEW_YOUR_RESPONSES))
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
                  !permissionTypes.includes(PERMISSION_TYPES.EDIT_RESPONSE)
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
                  !permissionTypes.includes(PERMISSION_TYPES.DELETE_RESPONSE)
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
                  (isEditButtonDisabled ||
                    !permissionTypes.includes(PERMISSION_TYPES.EDIT_RESPONSE))
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
                {/* {allViews?.map((view) => (
                  <MenuItem key={view.id} value={view.id}>
                    <ViewMenuItem>
                      <span>{getViewDisplayName(view)}</span>
                      {isViewDefault(view) && <ViewDefaultBadge>ברירת מחדל</ViewDefaultBadge>}
                    </ViewMenuItem>
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

          <StyledAddButton
            color="secondary"
            variant="contained"
            title={isQuickEditMode ? "לא זמין במצב עריכה מהירה" : "הוסף תגובה חדשה לטופס זה"}
            onClick={() => navigate(`/response/create/${form.id}`)}
            startIcon={<Add />}
            disabled={
              isQuickEditMode ||
              !(form?.fields?.length > 0) ||
              !permissionTypes.includes(PERMISSION_TYPES.CREATE_RESPONSE)
            }>
            הוספת תגובה חדשה
          </StyledAddButton>

          {(user?.isSuperAdmin || permissionTypes.includes(PERMISSION_TYPES.EXPORT_FORM)) && (
            <Tooltip
              title={
                isQuickEditMode
                  ? "לא זמין במצב עריכה מהירה"
                  : allResponsesCount > 0
                  ? `ייצוא ${allResponsesCount} תגובות לאקסל`
                  : "אין תגובות לייצוא"
              }>
              {showLoadingExcelBtn ? (
                <LoadingBtnBox bgcolor={theme.palette.primary.main}>
                  <ReactLoading
                    type="spinningBubbles"
                    color={theme.palette.white}
                    width="25px"
                    height="25px"
                  />
                </LoadingBtnBox>
              ) : (
                <div>
                  <SmallRoundButton
                    backgroundcolor={theme.palette.success.main}
                    onClick={() => getResponsesAndExportToExcel(form)}
                    disabled={
                      isQuickEditMode || !(form?.fields?.length > 0) || allResponsesCount === 0
                    }
                    variant="contained">
                    <CustomIcon iconName="excel" forcePointer />
                  </SmallRoundButton>
                </div>
              )}
            </Tooltip>
          )}
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
