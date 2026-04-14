import React, { useEffect } from "react";
import { Divider } from "@mui/material";
import styled from "styled-components";

import type { FormDto } from "../../types/shared";
import { useGetFormRoles } from "../../api/rolesApi";
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
  const { data: formRoles } = useGetFormRoles(form.id);
  const roles = formRoles?.userRoles ?? [];

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
  } = useUserPicker({ form, closeSharePopupAndRefreshForm, roles });

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
    const newIsPublic = !!formRoles?.publicRole;
    setIsPublic(newIsPublic);

    const newFormPermission = formRoles?.publicRole || null;
    setFormPermission(newFormPermission);
  }, [formRoles, setFormPermission, setIsPublic]);

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
