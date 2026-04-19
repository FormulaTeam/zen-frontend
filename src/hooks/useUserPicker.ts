import { useEffect, useState } from "react";
import { Role, role } from "formula-gear";
import { useQueryClient } from "@tanstack/react-query";

import type { UserRoleDto } from "../types/shared";
import { useUpsertFormRoles } from "../api/rolesApi";
import { getUsers } from "../api/usersApi";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import { FormOverview } from "@src/utils/interfaces";

export type SharePickerUser = {
  id?: number | string;
  displayName: string;
  upn: string;
  role_id?: number;
  selected?: boolean;
};

interface UseUserPickerProps {
  form: FormOverview;
  closeSharePopupAndRefreshForm: (users: SharePickerUser[], updatedForm?: FormOverview) => void;
  roles?: UserRoleDto[];
  publicRole?: Role | null;
}

export interface UserPickerReturnType {
  loading: boolean;
  shareWithOptionsUsers: SharePickerUser[];
  selectedShareWith: SharePickerUser[];
  formCreator: SharePickerUser | null;
  saveSharedWith: () => Promise<void>;
  removeUserFromShare: (user: SharePickerUser) => void;
  handleRoleChange: (_: any, newValue: any, user: SharePickerUser) => void;
  handleValueChange: (_: any, newValue: SharePickerUser) => void;
  handleInputChange: (_: any, value: string) => void;
  handleClose: () => void;
  handleFormPermissionChange: (isPublic: boolean, permission?: Role) => void;
}

const getCreatorFromForm = (form: FormOverview): SharePickerUser | null => {
  if (!form.createdBy) return null;

  return {
    upn: form.createdBy.upn,
    displayName: form.createdBy.name,
    role_id: role.FormAdmin,
    selected: true,
  };
};

export const useUserPicker = ({
  form,
  roles = [],
  publicRole = null,
  closeSharePopupAndRefreshForm,
}: UseUserPickerProps): UserPickerReturnType => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShareWith, setSelectedShareWith] = useState<SharePickerUser[]>([]);
  const [shareWithOptionsUsers, setSharedWithOptionsUsers] = useState<SharePickerUser[]>([]);
  const [formCreator, setFormCreator] = useState<SharePickerUser | null>(null);
  const [formPermissionState, setFormPermissionState] = useState<Role | null>(
    null,
  );

  const { mutateAsync: upsertFormRolesAsync } = useUpsertFormRoles();
  const queryClient = useQueryClient();

  useEffect(() => {
    const creator = getCreatorFromForm(form);
    setFormCreator(creator);

    const initialSelectedUsers = roles
      .map((userRole: UserRoleDto) => {
        const user = userRole.user;

        return {
          id: user?.id,
          upn: user?.upn,
          displayName: user?.name,
          role_id: userRole.role,
          selected: true,
        } as SharePickerUser;
      });

    setSelectedShareWith(initialSelectedUsers);
    setFormPermissionState(publicRole);
    setLoading(false);
  }, [form, roles, publicRole]);

  const saveSharedWith = async () => {
    const userRoles: { userId: number; role: number }[] = [];
    let allPermissionsSelected = true;

    selectedShareWith.forEach((user) => {
      if (user.role_id === -1 || !user.role_id) {
        allPermissionsSelected = false;
      } else {
        userRoles.push({
          userId: Number(user.id),
          role: user.role_id,
        });
      }
    });


    if (selectedShareWith.length > 0 && !allPermissionsSelected) {
      showErrorNotification("לא ניתן לשתף משתמש בלי לבחור לו רמת הרשאות");
      return;
    }

    const originalUserRoles = roles.map(roleData => ({ userId: Number(roleData.user?.id), role: roleData.role }));

    const hasUserRolesChanged: boolean =
      userRoles.length !== originalUserRoles.length ||
      userRoles.some(
        userRole => !originalUserRoles.some(originalUserRoles => originalUserRoles.userId === userRole.userId && originalUserRoles.role === userRole.role)
      ) ||
      originalUserRoles.some(
        originalUserRoles => !userRoles.some(userRole => userRole.userId === originalUserRoles.userId && userRole.role === originalUserRoles.role)
      );

    const hasPublicRoleChanged: boolean = formPermissionState !== publicRole;

    if (!hasUserRolesChanged && !hasPublicRoleChanged) {
      closeSharePopupAndRefreshForm(selectedShareWith, form ?? undefined);
      return;
    }


    let previousForms: [any, any][] | null = null;

    const myPersonal = queryClient.getQueryData<any>(["user-personal"]);
    const currentUserUpn: string | undefined = myPersonal?.upn;

    if (currentUserUpn) {
      const isPublicForm: boolean = formPermissionState !== null;

      if (!isPublicForm) {
        const originalMyRole: UserRoleDto | undefined = roles.find((userRole: UserRoleDto) => userRole.user?.upn?.toLowerCase() === currentUserUpn.toLowerCase());
        const hadAdminRole: boolean = !!originalMyRole && originalMyRole.role === role.FormAdmin;

        const myCurrentRole: SharePickerUser | undefined = selectedShareWith.find((selectedUser: SharePickerUser) => selectedUser.upn?.toLowerCase() === currentUserUpn.toLowerCase());
        const hasAdminRole: boolean = !!myCurrentRole && myCurrentRole.role_id === role.FormAdmin;

        if (hadAdminRole && !hasAdminRole) {
          previousForms = queryClient.getQueriesData({ queryKey: ["forms"] });

          queryClient.setQueriesData({ queryKey: ["forms"] }, (oldData: any) => {
            if (!Array.isArray(oldData)) return oldData;
            return oldData.filter((formItem: any) => formItem.id !== form.id);
          });
        }
      }
    }

    try {
      setLoading(true);
      const response = await upsertFormRolesAsync({
        formId: form.id,
        data: {
          userRoles,
          publicRole: formPermissionState ?? null,
        }
      });

      if (response && response.publicRole) {
        setFormPermissionState(response.publicRole ?? null);
      }

      closeSharePopupAndRefreshForm(selectedShareWith, form ?? undefined);
      showSuccessNotification("ההרשאות לטופס עודכנו בהצלחה!")
    } catch (error) {
      console.error("שגיאה בעדכון הטופס:", error);
      showErrorNotification("עדכון הטופס נכשל");
      if (previousForms) {
        previousForms.forEach(([queryKey, oldData]: [any, any]) => {
          queryClient.setQueryData(queryKey, oldData);
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const removeUserFromShare = (user: SharePickerUser) => {
    setSelectedShareWith((previousUsers) =>
      previousUsers.filter((currentUser) => currentUser.id !== user.id),
    );
  };

  const handleRoleChange = (_: any, newValue: any, user: SharePickerUser) => {
    setSelectedShareWith((previousUsers) => {
      const updatedUsers = [...previousUsers];
      const userIndex = updatedUsers.findIndex((currentUser) => String(currentUser.id || "") === String(user.id || ""));

      if (userIndex !== -1 && newValue) {
        updatedUsers[userIndex].role_id = newValue.role_id;
      }

      return updatedUsers;
    });
  };

  const handleValueChange = (_: any, newValue: SharePickerUser) => {
    if (!newValue) return;

    setSelectedShareWith((previousUsers) => {
      const alreadyExists = previousUsers.some((user) => user.id === newValue.id);

      if (alreadyExists) return previousUsers;

      return [...previousUsers, { ...newValue, role_id: -1, selected: true }];
    });

    handleInputChange(null, "");
  };

  const handleInputChange = async (_: any, value: string) => {
    const minLength = 2;

    if (!value || value.length < minLength) {
      setSharedWithOptionsUsers([]);

      return;
    }

    try {
      const users = await getUsers(value);
      setSharedWithOptionsUsers(users as SharePickerUser[]);
    } catch {
      showErrorNotification("הייתה שגיאה בשליפת המשתמשים");
      setSharedWithOptionsUsers([]);
    }
  };

  const handleClose = () => {
    setSelectedShareWith([]);
    setSharedWithOptionsUsers([]);
    setFormCreator(null);
    closeSharePopupAndRefreshForm([], form);
  };

  const handleFormPermissionChange = (isPublic: boolean, permission?: Role) => {
    setFormPermissionState(isPublic ? (permission ?? null) : null);
  };

  return {
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
  };
};
