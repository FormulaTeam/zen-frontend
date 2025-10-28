import React, { useEffect } from "react";
import "./UserPicker.scss";
import BasePopup from "../BasePopup/BasePopup";
import UserPickerContent from "./UserPickerContent";
import { useUserPicker } from "../../hooks/useUserPicker";
import { Form, Role, User } from "../../utils/interfaces";
import { Divider } from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import PublicFormSection from "./PublicFormSection";
import { useFormPermissions } from "../../hooks/useFormPermissions";
import styled from "styled-components";

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

interface UserPickerProps {
  form: Form;
  closeSharePopupAndRefreshForm: (users: any[], updatedForm?: Form) => void;
  roles: Role[];
  currentUser: User;
}

const UserPicker = ({
  form,
  closeSharePopupAndRefreshForm,
  roles,
  currentUser,
}: UserPickerProps) => {
  const { user } = useAuth();
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

  // update local state when form changes
  useEffect(() => {
    // update checkbox state
    const newIsPublic = !!form.isPublic;
    setIsPublic(newIsPublic);

    // update form permission state
    const newFormPermission = form.formPermission || null;
    setFormPermission(newFormPermission);
  }, [form.isPublic, form.formPermission, form.id]); // also listen to form.id to reset when switching forms

  return (
    <BasePopup
      open={true}
      onClose={() => closeSharePopupAndRefreshForm(form?.users || [])}
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
            roles={roles}
            currentUser={currentUser}
          />

          <Divider />

          <PublicFormSection
            form={form}
            roles={roles}
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
