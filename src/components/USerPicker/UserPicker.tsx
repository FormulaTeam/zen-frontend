import React, { useEffect } from "react";
import { Divider } from "@mui/material";
import styled from "styled-components";

import type { FormDto } from "../../types/shared";
import { useAuth } from "../../contexts/AuthContext";
import { useFormPermissions } from "../../hooks/useFormPermissions";
import { useUserPicker } from "../../hooks/useUserPicker";
import BasePopup from "../BasePopup/BasePopup";
import PublicFormSection from "./PublicFormSection";
import UserPickerContent from "./UserPickerContent";
import "./UserPicker.scss";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface UserPickerProps {
  form: FormDto;
  closeSharePopupAndRefreshForm: (users: any[], updatedForm?: FormDto) => void;
}

const UserPicker = ({ form, closeSharePopupAndRefreshForm }: UserPickerProps) => {
  const { user, roles } = useAuth();

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
  } = useUserPicker({ form, closeSharePopupAndRefreshForm });

  const {
    isPublic,
    setIsPublic,
    formPermission,
    setFormPermission,
    hasPermission,
    togglePublicForm,
    handleLocalFormPermissionChange,
    handleSave,
  } = useFormPermissions({
    form,
    roles,
    selectedShareWith,
    saveSharedWith,
    handleFormPermissionChange,
    handleClose,
  });

  useEffect(() => {
    const newIsPublic = !!form.publicRole;
    setIsPublic(newIsPublic);

    const newFormPermission = form.publicRole || null;
    setFormPermission(newFormPermission);
  }, [form.publicRole, form.id, setFormPermission, setIsPublic]);

  return (
    <BasePopup
      open={true}
      onClose={() => closeSharePopupAndRefreshForm([], form)}
      title="ניהול הרשאות לטופס"
      content={
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

          <Divider />

          <PublicFormSection
            user={user}
            hasPermission={hasPermission}
            isPublic={isPublic}
            togglePublicForm={togglePublicForm}
            formPermission={formPermission}
            setFormPermission={setFormPermission}
            handleLocalFormPermissionChange={handleLocalFormPermissionChange}
          />
        </ContentWrapper>
      }
      mainButton={!loading ? { text: "אישור", onClick: handleSave } : undefined}
      cancelButton={!loading ? { text: "בטל פעולה", onClick: handleClose } : undefined}
    />
  );
};

export default UserPicker;
