import React, { useEffect } from "react";
import {
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Tooltip,
  Typography,
  Box,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import styled from "styled-components";

import { useGetFormRoles } from "../../api/rolesApi";
import { useFormPermissions } from "../../hooks/useFormPermissions";
import { useUserPicker } from "../../hooks/useUserPicker";
import PublicFormSection from "./PublicFormSection";
import UserPickerContent from "./UserPickerContent";
import { ReasonsContainer } from "./styled";
import { FormOverview } from "@src/utils/interfaces";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 8px;
`;

const StyledDialogTitle = styled(DialogTitle)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
`;

const TitleText = styled(Typography)`
  font-weight: 600 !important;
  font-size: 1.25rem !important;
  color: #1e293b;
`;

interface UserPickerProps {
  form: FormOverview | any;
  closeSharePopupAndRefreshForm: (users: any[], updatedForm?: FormOverview | any) => void;
}

const UserPicker = ({ form, closeSharePopupAndRefreshForm }: UserPickerProps) => {
  const theme = useTheme();
  const { data: formRoles } = useGetFormRoles(form.id);
  const roles = React.useMemo(() => formRoles?.userRoles ?? [], [formRoles?.userRoles]);
  const publicRole = formRoles?.publicRole ?? null;

  const {
    loading,
    shareWithOptionsUsers,
    selectedShareWith,
    formCreator,
    saveSharedWith,
    removeUserFromShare,
    handleRoleChange,
    handleValueChange,
    handleInputChange,
    handleClose,
    handleFormPermissionChange,
  } = useUserPicker({ form, closeSharePopupAndRefreshForm, roles, publicRole });

  const {
    isPublic,
    setIsPublic,
    formPermission,
    setFormPermission,
    togglePublicForm,
    handleLocalFormPermissionChange,
    handleSave,
  } = useFormPermissions({
    roles,
    formPublicRole: publicRole,
    selectedShareWith,
    saveSharedWith,
    handleFormPermissionChange,
    handleClose,
  });

  useEffect(() => {
    const newIsPublic = !!formRoles?.publicRole;
    setIsPublic(newIsPublic);

    const newFormPermission = formRoles?.publicRole || null;
    setFormPermission(newFormPermission);
  }, [formRoles, setFormPermission, setIsPublic]);

  const getDisabledReason = (): JSX.Element | undefined => {
    const reasons: string[] = [];
    if (selectedShareWith.some((user) => !user.role_id)) {
      reasons.push("יש לבחור הרשאה למשתמשים שנוספו");
    }
    if (isPublic && !formPermission) {
      reasons.push("יש לבחור הרשאה שתוגדר לכלל המשתמשים לטופס");
    }

    if (reasons.length === 0) return undefined;

    return (
      <ReasonsContainer>
        {reasons.map((reason, index) => (
          <div key={index}>• {reason}</div>
        ))}
      </ReasonsContainer>
    );
  };

  const disabledReason = getDisabledReason();
  const isSaveDisabled = !!disabledReason;

  const handleCloseDialog = () => {
    closeSharePopupAndRefreshForm([], form);
  };

  return (
    <Dialog
      open={true}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: "12px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        },
      }}>
      <StyledDialogTitle>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 40,
            height: 40,
            borderRadius: "10px",
            backgroundColor: theme.palette.primary.main + "14", // 8% opacity
            color: theme.palette.primary.main,
          }}>
          <GroupAddIcon />
        </Box>
        <TitleText>ניהול הרשאות לטופס</TitleText>
        <IconButton
          aria-label="close"
          onClick={handleCloseDialog}
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            color: (theme) => theme.palette.grey[500],
          }}>
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>

      <DialogContent dividers sx={{ borderBottom: "none", py: 2 }}>
        <ContentWrapper>
          <UserPickerContent
            loading={loading}
            shareWithOptionsUsers={shareWithOptionsUsers}
            formCreator={formCreator}
            selectedShareWith={selectedShareWith}
            handleValueChange={handleValueChange}
            handleInputChange={handleInputChange}
            handleRoleChange={handleRoleChange}
            removeUserFromShare={removeUserFromShare}
          />

          <Divider sx={{ my: 1 }} />

          <PublicFormSection
            isPublic={isPublic}
            togglePublicForm={togglePublicForm}
            formPermission={formPermission}
            setFormPermission={setFormPermission}
            handleLocalFormPermissionChange={handleLocalFormPermissionChange}
            form={form}
          />
        </ContentWrapper>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, gap: 1.5 }}>
        {!loading && (
          <>
            <Button
              onClick={handleClose}
              variant="outlined"
              sx={{
                borderRadius: "8px",
                px: 3,
                py: 1,
                color: "#64748b",
                borderColor: "#e2e8f0",
                textTransform: "none",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "#f8fafc",
                  borderColor: "#cbd5e0",
                },
              }}>
              ביטול
            </Button>
            <Tooltip title={isSaveDisabled ? disabledReason : ""} placement="top">
              <span>
                <Button
                  onClick={handleSave}
                  disabled={isSaveDisabled}
                  variant="contained"
                  disableElevation
                  sx={{
                    borderRadius: "8px",
                    px: 4,
                    py: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    backgroundColor: theme.palette.primary.main,
                    "&:hover": {
                      backgroundColor: theme.palette.primary.dark,
                    },
                  }}>
                  אישור
                </Button>
              </span>
            </Tooltip>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserPicker;
