import { useMemo, useState } from "react";

import type { FormDto, UserRoleDto } from "../types/shared";
import { useAuth } from "../contexts/AuthContext";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { prioritizePermissions, getRolePermissionTypes } from "../utils/formFieldsResponses";
import { PERMISSION_TYPES } from "../utils/utils";
import { Role } from "formula-gear";

type PublicRole = FormDto["publicRole"];

interface UseFormPermissionsParams {
  form: FormDto;
  roles: UserRoleDto[];
  formPublicRole: Role | null;
  selectedShareWith: any[];
  saveSharedWith: () => Promise<void>;
  handleFormPermissionChange: (isPublic: boolean, permission?: PublicRole) => void;
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
  form,
  roles,
  formPublicRole,
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
    hasPermission,
    togglePublicForm,
    handleLocalFormPermissionChange,
    handleSave,
  };
};
