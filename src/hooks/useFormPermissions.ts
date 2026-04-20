import { useState } from "react";

import type { UserRoleDto } from "../types/shared";
import { Role } from "formula-gear";

interface UseFormPermissionsParams {
  roles: UserRoleDto[];
  formPublicRole: Role | null;
  selectedShareWith: any[];
  saveSharedWith: () => Promise<void>;
  handleFormPermissionChange: (isPublic: boolean, permission?: Role) => void;
  handleClose: () => void;
}

export const useFormPermissions = ({
  roles,
  formPublicRole,
  selectedShareWith,
  saveSharedWith,
  handleFormPermissionChange,
  handleClose,
}: UseFormPermissionsParams) => {

  const [isPublic, setIsPublic] = useState<boolean>(!!formPublicRole);
  const [formPermission, setFormPermission] = useState<Role | null>(formPublicRole ?? null);


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
    togglePublicForm,
    handleLocalFormPermissionChange,
    handleSave,
  };
};
