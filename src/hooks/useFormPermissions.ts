import { useMemo, useState } from "react";

import type { FormDto } from "../types/shared";
import { useAuth } from "../contexts/AuthContext";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { Role, User } from "../utils/interfaces";
import { prioritizePermissions } from "../utils/formFieldsResponses";
import { PERMISSION_TYPES } from "../utils/utils";

type PublicRole = FormDto["publicRole"];

interface UseFormPermissionsParams {
  form: FormDto;
  roles: Role[];
  selectedShareWith: User[];
  saveSharedWith: (updatedFormData?: Record<string, unknown>) => Promise<void>;
  handleFormPermissionChange: (isPublic: boolean, permission?: PublicRole) => void;
  handleClose: () => void;
}

const getCatalogPermissionTypes = (
  roles: Role[],
  role: PublicRole | null | undefined,
): number[] => {
  const matchingRole = roles.find((roleItem) => roleItem.role_id === role);

  return matchingRole?.permission_types ?? [];
};

const getUserId = (user: User | null | undefined): number | undefined => {
  if (!user) return undefined;

  const directUserId = (user as User & { id?: unknown }).id;
  if (typeof directUserId === "number") return directUserId;

  const fallbackUserId = (user as User & { userId?: unknown }).userId;
  if (typeof fallbackUserId === "number") return fallbackUserId;

  return undefined;
};

export const useFormPermissions = ({
  form,
  roles,
  selectedShareWith,
  saveSharedWith,
  handleFormPermissionChange,
  handleClose,
}: UseFormPermissionsParams) => {
  const { user } = useAuth();
  const { isSuperAdmin } = useSuperAdmin();

  const [isPublic, setIsPublic] = useState<boolean>(!!form.publicRole);
  const [formPermission, setFormPermission] = useState<PublicRole | null>(form.publicRole ?? null);

  const currentUserId = getUserId(user);

  const userSpecificPermissions = useMemo(() => {
    if (typeof currentUserId !== "number") return [];

    return [];
  }, [currentUserId]);

  const publicFormPermissions = useMemo(
    () => (isPublic ? getCatalogPermissionTypes(roles, formPermission) : []),
    [formPermission, isPublic, roles],
  );

  const permissionTypes = useMemo(
    () => prioritizePermissions(userSpecificPermissions, publicFormPermissions),
    [publicFormPermissions, userSpecificPermissions],
  );

  const hasPermission = !!isSuperAdmin || permissionTypes.includes(PERMISSION_TYPES.EDIT_FORM);

  const togglePublicForm = () => {
    const nextIsPublic = !isPublic;

    setIsPublic(nextIsPublic);

    if (!nextIsPublic) {
      setFormPermission(null);
      handleFormPermissionChange(false, undefined);

      return;
    }

    handleFormPermissionChange(true, formPermission ?? undefined);
  };

  const handleLocalFormPermissionChange = (_: any, newValue: PublicRole) => {
    if (!newValue) return;

    setFormPermission(newValue);
    handleFormPermissionChange(isPublic, newValue);
  };

  const handleSave = async () => {
    const updatedFormData: Record<string, unknown> = {
      publicRole: isPublic ? (formPermission ?? undefined) : undefined,
    };

    const hasFormPermissionUpdates =
      form.publicRole !== (isPublic ? (formPermission ?? undefined) : undefined);

    const hasUserRoleAssignments = selectedShareWith.some(
      (selectedUser) => selectedUser.role_id && selectedUser.role_id !== -1,
    );

    try {
      if (hasUserRoleAssignments || hasFormPermissionUpdates) {
        await saveSharedWith(updatedFormData);

        return;
      }

      handleClose();
    } catch (error) {
      console.error("Error saving form:", error);
    }
  };

  return {
    isPublic,
    setIsPublic,
    setFormPermission,
    formPermission,
    permissionTypes,
    hasPermission,
    togglePublicForm,
    handleLocalFormPermissionChange,
    handleSave,
  };
};
