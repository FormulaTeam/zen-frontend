import { useEffect, useState } from "react";
import { Form, User } from "../utils/interfaces";
import { showErrorNotification } from "../utils/utils";
import { useUpdateForm } from "../api";
import { getUsers } from "../api/usersApi";

interface UseUserPickerProps {
  form: Form;
  closeSharePopupAndRefreshForm: (users: User[], updatedForm?: Form) => void;
}

export interface UserPickerReturnType {
  loading: boolean;
  shareWithOptionsUsers: User[];
  selectedShareWith: User[];
  formCreator: User | null;
  saveSharedWith: (updatedFormData?: Partial<Form>) => Promise<void>;
  removeUserFromShare: (user: User) => void;
  handleRoleChange: (event: any, newValue: any, user: User) => void;
  handleValueChange: (event: any, newValue: User) => void;
  handleInputChange: (event: any, value: string) => void;
  handleClose: () => void;
  saveFormPermissions: (
    isPublic: boolean,
    formPermission?: { role_id: number; roleName: string },
  ) => Promise<void>;
  handleFormPermissionChange: (
    isPublic: boolean,
    permission?: { role_id: number; roleName: string },
  ) => void;
}

export const useUserPicker = ({
  form,
  closeSharePopupAndRefreshForm,
}: UseUserPickerProps): UserPickerReturnType => {
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedShareWith, setSelectedShareWith] = useState<User[]>([]);
  const [shareWithOptionsUsers, setSharedWithOptionsUsers] = useState<User[]>([]);
  const [formCreator, setFormCreator] = useState<User | null>(null);

  // Local state for form permissions
  const [formPublicState, setFormPublicState] = useState<boolean>(!!form.isPublic);
  const [formPermissionState, setFormPermissionState] = useState<any>(form.formPermission || null);

  const { mutateAsync: mutateUpdateFormAsync } = useUpdateForm(form.id);

  // update local state when form changes
  useEffect(() => {
    setFormPublicState(!!form.isPublic);
    setFormPermissionState(form.formPermission || null);
  }, [form.isPublic, form.formPermission, form.id]);

  useEffect(() => {
    const selected: User[] = [];
    let creator: User | undefined;

    if (Array.isArray(form?.users)) {
      form.users.forEach((user) => {
        const isCreator = user?.id === form.created_by || user?.upn === form.created_by;
        const userInForm = form.users?.find(
          (u: any) =>
            u.upn?.toLowerCase() === user.upn?.toLowerCase() ||
            u.id?.toLowerCase() === user.id?.toLowerCase(),
        );
        const canAdd =
          (user?.id && user.id !== form.created_by) ||
          (user?.upn && user.upn !== form.created_by) ||
          userInForm;
        if (canAdd && !isCreator) {
          selected.push({ ...user });
        } else if (isCreator) {
          creator = user;
        }
      });
    }

    setFormCreator(creator || null);
    setSelectedShareWith(selected);
    setLoading(false);
  }, [form]);

  const getSelectedShareWithFormCreator = (users: User[], creator: User | null): User[] => {
    const hasCreator = users.some((user) => user.upn === form.created_by);
    if (!hasCreator && creator) {
      const creatorClone = { ...creator };
      delete creatorClone.displayName;
      return [...users, creatorClone];
    }
    return users;
  };

  const saveSharedWith = async (updatedFormData?: Partial<Form>) => {
    const users: User[] = [];
    let allPermissionsSelected = true;

    // Process selected users
    selectedShareWith.forEach((user: any) => {
      if (user.role_id === -1 || !user.role_id) {
        allPermissionsSelected = false;
        user.role_id = undefined;
      }
      user.upn = user.id?.toLowerCase();
      delete user.displayName;
      users.push({ ...user });
    });

    // check if there are users without a selected role
    if (users.length > 0 && !allPermissionsSelected) {
      showErrorNotification("לא ניתן לשתף משתמש בלי לבחור לו רמת הרשאות");
      return;
    }

    const withCreator = getSelectedShareWithFormCreator(users, formCreator);

    try {
      setLoading(true);

      // added formPublicState and formPermissionState to the final data being sent
      const finalFormData: Partial<Form> = {
        users: withCreator,
        ...updatedFormData, // if there are any other updates to the form, include them
      };

      const updatedForm = await mutateUpdateFormAsync({
        id: form.id,
        formData: finalFormData,
      });

      // update local state if form permissions were changed
      if (updatedForm) {
        if (updatedForm.isPublic !== undefined) {
          setFormPublicState(!!updatedForm.isPublic);
        }
        if (updatedForm.formPermission !== undefined) {
          setFormPermissionState(updatedForm.formPermission);
        }
      }

      closeSharePopupAndRefreshForm(withCreator, updatedForm);
    } catch (err) {
      console.error("שגיאה בעדכון הטופס:", err);
      showErrorNotification("עדכון הטופס נכשל");
    } finally {
      setLoading(false);
    }
  };

  const removeUserFromShare = (user: User) => {
    setSelectedShareWith((prev) => prev.filter((u) => u.id !== user.id));
  };

  const handleRoleChange = (_: any, newValue: any, user: User) => {
    setSelectedShareWith((prev) => {
      const updated: User[] = [...prev];
      const idx = updated.findIndex((u) => u.id === user.id);
      if (idx !== -1 && newValue) {
        updated[idx].role_id = newValue.role_id;
      }
      return updated;
    });
  };

  const handleValueChange = (_: any, newValue: User) => {
    if (!newValue) return;

    setSelectedShareWith((prev) => {
      const exists = prev.some((user) => {
        console.log(user.id, newValue.id);

        return user.id === newValue.id;
      });
      if (exists) return prev;
      return [...prev, { ...newValue, role_id: -1, selected: true }];
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
      setSharedWithOptionsUsers(users);
      console.log("Fetched users:", users);
    } catch (err) {
      showErrorNotification("הייתה שגיאה בשליפת המשתמשים");
      setSharedWithOptionsUsers([]);
    }
  };

  const handleClose = () => {
    setSelectedShareWith([]);
    setSharedWithOptionsUsers([]);
    setFormCreator(null);
    closeSharePopupAndRefreshForm(form?.users || []);
  };
  // save form permissions (isPublic and formPermission) only
  const saveFormPermissions = async (
    isPublic: boolean,
    formPermission?: { role_id: number; roleName: string },
  ) => {
    try {
      setLoading(true);

      const updatedFormData: Partial<Form> = {
        isPublic,
        formPermission: isPublic ? formPermission || undefined : undefined,
      };

      console.log("שמירת הרשאות טופס:", updatedFormData);

      const updatedForm = await mutateUpdateFormAsync({
        id: form.id,
        formData: updatedFormData,
      });
      console.log("הרשאות טופס עודכנו בהצלחה, התוצאה:", updatedForm);

      // update local state if form permissions were changed
      if (updatedForm) {
        console.log("מעדכן מצב מקומי של hook בפונקציית הרשאות:", {
          isPublic: updatedForm.isPublic,
          formPermission: updatedForm.formPermission,
        });
        setFormPublicState(!!updatedForm.isPublic);
        setFormPermissionState(updatedForm.formPermission || null);
      }

      closeSharePopupAndRefreshForm(form?.users || [], updatedForm);
    } catch (err) {
      console.error("שגיאה בעדכון הרשאות הטופס:", err);
      showErrorNotification("עדכון הרשאות הטופס נכשל");
    } finally {
      setLoading(false);
    }
  };

  // handle form permission changes
  const handleFormPermissionChange = (
    isPublic: boolean,
    permission?: { role_id: number; roleName: string },
  ) => {
    setFormPublicState(isPublic);
    setFormPermissionState(isPublic ? permission : null);
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
