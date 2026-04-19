import { useMemo, useState } from "react";

import type { UserRoleDto } from "../types/shared";
import { useAuth } from "../contexts/AuthContext";
import { prioritizePermissions, getRolePermissionTypes } from "../utils/formFieldsResponses";
import { Role } from "formula-gear";

interface UseFormPermissionsParams {
  roles: UserRoleDto[];
  formPublicRole: Role | null;
  selectedShareWith: any[];
  saveSharedWith: () => Promise<void>;
  handleFormPermissionChange: (isPublic: boolean, permission?: Role) => void;
  handleClose: () => void;
}

const getUserId = (user: any | null | undefined): number | undefined => {
  if (!user) return undefined;

  const directUserId = user.id;
  if (typeof directUserId === "number") return directUserId;

  const fallbackUserId = user.userId;
  if (typeof fallbackUserId === "number") return fallbackUserId;

  return undefined;
};

export const useFormPermissions = ({
  roles,
  formPublicRole,
  selectedShareWith,
  saveSharedWith,
  handleFormPermissionChange,
  handleClose,
}: UseFormPermissionsParams) => {
  const { user } = useAuth();

  const [isPublic, setIsPublic] = useState<boolean>(!!formPublicRole);
  const [formPermission, setFormPermission] = useState<Role | null>(formPublicRole ?? null);

  const currentUserId = getUserId(user);

  const userSpecificPermissions = useMemo(() => {
    if (typeof currentUserId !== "number") return [];

    const specificRole = roles.find((userRole) => (userRole as Record<string, any>).user?.id === currentUserId);

    return specificRole ? getRolePermissionTypes(specificRole.role) : [];
  }, [currentUserId, roles]);

  const publicFormPermissions = useMemo(
    () => (isPublic && formPermission ? getRolePermissionTypes(formPermission) : []),
    [formPermission, isPublic],
  );

  const permissionTypes = useMemo(
    () => prioritizePermissions(userSpecificPermissions, publicFormPermissions),
    [publicFormPermissions, userSpecificPermissions],
  );

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

  const handleLocalFormPermissionChange = (_: any, newValue: any) => {
    if (!newValue) return;

    const newRoleId = typeof newValue === "object" ? newValue.role_id : newValue;

    setFormPermission(newRoleId);
    handleFormPermissionChange(isPublic, newRoleId);
  };

  const handleSave = async () => {
    const hasFormPermissionUpdates =
      formPublicRole !== formPermission;

    const hasUserRoleAssignments = selectedShareWith.length > 0 || roles.length > 0;

    try {
      if (hasUserRoleAssignments || hasFormPermissionUpdates) {
        await saveSharedWith();

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
    togglePublicForm,
    handleLocalFormPermissionChange,
    handleSave,
  };
};
