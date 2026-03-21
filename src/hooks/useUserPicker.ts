import { useEffect, useState } from "react";

import type { FormDto } from "../types/shared";
import { useUpdateForm } from "../api";
import { getUsers } from "../api/usersApi";
import { User } from "../utils/interfaces";
import { showErrorNotification } from "../utils/utils";

type SharePickerUser = User & {
  role_id?: number;
  selected?: boolean;
};

type PublicRole = FormDto["publicRole"];

interface UseUserPickerProps {
  form: FormDto;
  closeSharePopupAndRefreshForm: (users: SharePickerUser[], updatedForm?: FormDto) => void;
}

export interface UserPickerReturnType {
  loading: boolean;
  shareWithOptionsUsers: SharePickerUser[];
  selectedShareWith: SharePickerUser[];
  formCreator: SharePickerUser | null;
  saveSharedWith: (updatedFormData?: Record<string, unknown>) => Promise<void>;
  removeUserFromShare: (user: SharePickerUser) => void;
  handleRoleChange: (_: any, newValue: any, user: SharePickerUser) => void;
  handleValueChange: (_: any, newValue: SharePickerUser) => void;
  handleInputChange: (_: any, value: string) => void;
  handleClose: () => void;
  saveFormPermissions: (isPublic: boolean, formPermission?: PublicRole) => Promise<void>;
  handleFormPermissionChange: (isPublic: boolean, permission?: PublicRole) => void;
}

const getCreatorFromForm = (form: FormDto): SharePickerUser | null => {
  if (!form.createdBy) return null;

  return {
    id: form.createdBy.upn,
    upn: form.createdBy.upn,
    displayName: form.createdBy.name,
    firstName: form.createdBy.name,
    selected: true,
  } as SharePickerUser;
};

export const useUserPicker = ({
  form,
  closeSharePopupAndRefreshForm,
}: UseUserPickerProps): UserPickerReturnType => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShareWith, setSelectedShareWith] = useState<SharePickerUser[]>([]);
  const [shareWithOptionsUsers, setSharedWithOptionsUsers] = useState<SharePickerUser[]>([]);
  const [formCreator, setFormCreator] = useState<SharePickerUser | null>(null);
  const [formPublicState, setFormPublicState] = useState<boolean>(!!form.publicRole);
  const [formPermissionState, setFormPermissionState] = useState<PublicRole | null>(
    form.publicRole ?? null,
  );

  const { mutateAsync: mutateUpdateFormAsync } = useUpdateForm();

  useEffect(() => {
    setFormPublicState(!!form.publicRole);
    setFormPermissionState(form.publicRole ?? null);
  }, [form.publicRole, form.id]);

  useEffect(() => {
    setFormCreator(getCreatorFromForm(form));
    setSelectedShareWith([]);
    setLoading(false);
  }, [form]);

  const getSelectedShareWithFormCreator = (
    users: SharePickerUser[],
    creator: SharePickerUser | null,
  ): SharePickerUser[] => {
    if (!creator) return users;

    const hasCreator = users.some((user) => user.upn === creator.upn || user.id === creator.id);

    if (hasCreator) return users;

    const creatorClone = { ...creator };
    delete creatorClone.displayName;

    return [...users, creatorClone];
  };

  const saveSharedWith = async (updatedFormData?: Record<string, unknown>) => {
    const users: SharePickerUser[] = [];
    let allPermissionsSelected = true;

    selectedShareWith.forEach((user) => {
      const normalizedUser = { ...user };

      if (normalizedUser.role_id === -1 || !normalizedUser.role_id) {
        allPermissionsSelected = false;
        normalizedUser.role_id = undefined;
      }

      normalizedUser.upn = normalizedUser.upn || normalizedUser.id?.toLowerCase();
      delete normalizedUser.displayName;
      users.push(normalizedUser);
    });

    if (users.length > 0 && !allPermissionsSelected) {
      showErrorNotification("לא ניתן לשתף משתמש בלי לבחור לו רמת הרשאות");

      return;
    }

    const usersWithCreator = getSelectedShareWithFormCreator(users, formCreator);

    try {
      setLoading(true);

      const finalFormData: Record<string, unknown> = {
        ...updatedFormData,
      };

      const updatedForm = await mutateUpdateFormAsync({
        id: form.id,
        formData: finalFormData,
      });

      if (updatedForm) {
        if ("publicRole" in updatedForm) setFormPublicState(!!updatedForm.publicRole);

        if ("publicRole" in updatedForm) setFormPermissionState(updatedForm.publicRole ?? null);
      }

      closeSharePopupAndRefreshForm(usersWithCreator, updatedForm ?? undefined);
    } catch (error) {
      console.error("שגיאה בעדכון הטופס:", error);
      showErrorNotification("עדכון הטופס נכשל");
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
      const userIndex = updatedUsers.findIndex((currentUser) => currentUser.id === user.id);

      if (userIndex !== -1 && newValue) updatedUsers[userIndex].role_id = newValue.role_id;

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

  const saveFormPermissions = async (isPublic: boolean, formPermission?: PublicRole) => {
    try {
      setLoading(true);

      const updatedFormData: Record<string, unknown> = {
        publicRole: isPublic ? formPermission : undefined,
      };

      const updatedForm = await mutateUpdateFormAsync({
        id: form.id,
        formData: updatedFormData,
      });

      if (updatedForm) {
        setFormPublicState(!!updatedForm.publicRole);
        setFormPermissionState(updatedForm.publicRole ?? null);
      }

      closeSharePopupAndRefreshForm([], updatedForm ?? undefined);
    } catch (error) {
      console.error("שגיאה בעדכון הרשאות הטופס:", error);
      showErrorNotification("עדכון הרשאות הטופס נכשל");
    } finally {
      setLoading(false);
    }
  };

  const handleFormPermissionChange = (isPublic: boolean, permission?: PublicRole) => {
    setFormPublicState(isPublic);
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
    saveFormPermissions,
    handleFormPermissionChange,
  };
};
