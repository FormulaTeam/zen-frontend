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
import { ReasonsContainer } from "./styled";
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
    hasPermission,
    togglePublicForm,
    handleLocalFormPermissionChange,
    handleSave,
  } = useFormPermissions({
    form,
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
    if (selectedShareWith.some((user) => !user.role_id || user.role_id === -1)) {
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
      mainButton={
        loading
          ? undefined
          : {
            text: "אישור",
            onClick: handleSave,
            disabled: isSaveDisabled,
            tooltip: isSaveDisabled ? disabledReason : undefined,
          }
      }
      cancelButton={!loading ? { text: "בטל פעולה", onClick: handleClose } : undefined}
    />
  );
};

export default UserPicker;
