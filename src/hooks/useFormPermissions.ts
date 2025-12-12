import { useState, useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { Role, RoleId, Form, User } from "../utils/interfaces";
import { PERMISSION_TYPES } from "../utils/utils";
import { prioritizePermissions } from "../utils/formFieldsResponses";

interface UseFormPermissionsParams {
  form: Form;
  roles: Role[];
  selectedShareWith: User[];
  saveSharedWith: (updatedFormData?: Partial<Form>) => Promise<void>;
  handleFormPermissionChange: (
    isPublic: boolean,
    permission?: { role_id: number; roleName: string },
  ) => void;
  handleClose: () => void;
}

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

  // local state for public form and its permissions
  const [isPublic, setIsPublic] = useState<boolean>(!!form.isPublic);
  const [formPermission, setFormPermission] = useState<any>(form.formPermission || null);

  // compute user-specific role
  const userRole: RoleId | undefined = form?.users?.find(
    (u) => u.upn?.toLowerCase() === user?.upn?.toLowerCase(),
  )?.role_id;

  // calculate user-specific permissions
  const userSpecificPermissions = roles.find((r) => r.role_id === userRole)?.permission_types || [];

  // calculate public form permissions
  const publicFormPermissions = useMemo(() => {
    if (form.isPublic && form.formPermission?.role_id) {
      // TODO: change to use role constants and type in formPermission so we don't have to search roles array
      const publicRole = roles.find((r) => r.role_id === form.formPermission?.role_id);

      return publicRole ? publicRole.permission_types || [] : [];
    }
    return [];
  }, [form.isPublic, form.formPermission, roles]);

  // merge permissions intelligently
  const permissionTypes = useMemo(
    () => prioritizePermissions(userSpecificPermissions, publicFormPermissions),
    [userSpecificPermissions, publicFormPermissions],
  );

  const hasPermission = isSuperAdmin || permissionTypes?.includes(PERMISSION_TYPES.EDIT_FORM);

  // toggle public/private state
  const togglePublicForm = () => {
    const newIsPublic = !isPublic;
    setIsPublic(newIsPublic);
    if (!newIsPublic) {
      setFormPermission(null);
      handleFormPermissionChange(newIsPublic, undefined);
    } else {
      handleFormPermissionChange(newIsPublic, formPermission);
    }
  };

  // handle dropdown/local form permission change
  const handleLocalFormPermissionChange = (_: any, newValue: any) => {
    if (newValue) {
      const newPermission = {
        role_id: newValue.role_id,
        roleName: newValue.roleName,
      };
      setFormPermission(newPermission);
      handleFormPermissionChange(isPublic, newPermission);
    }
  };

  // save logic including form permissions and users
  const handleSave = async () => {
    const updatedFormData = {
      isPublic,
      formPermission,
    };

    const hasFormPermissionUpdates =
      form.isPublic !== isPublic ||
      form.formPermission?.role_id !== formPermission?.role_id ||
      (!form.formPermission && formPermission) ||
      (form.formPermission && !formPermission);

    const hasUserRoleAssignments = selectedShareWith.some(
      (user) => user.role_id && user.role_id !== -1,
    );

    try {
      if (hasUserRoleAssignments || hasFormPermissionUpdates) {
        await saveSharedWith(updatedFormData);
      } else {
        handleClose();
      }
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
