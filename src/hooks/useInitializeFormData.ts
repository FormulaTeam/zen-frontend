import { useNavigate } from "react-router-dom";
import { Form, Role } from "../utils/interfaces";
import { PERMISSION_TYPES, getUserRole } from "../utils/utils";
import { prioritizePermissions } from "../utils/formFieldsResponses";
import { IPath } from "../types/enums/global.enums";
import { hasPermissionToSeeForm } from "../utils/forms";

export const useInitializeFormData = () => {
  const navigate = useNavigate();

  const initializeFormData = async (
    form: Form | null | undefined,
    roles: Role[],
    user: any,
    isSuperAdmin: boolean,
    setPermissionTypes: (types: number[]) => void,
    setCurrentFilter: (filter: any) => void,
    getResponsesForCurrentPage: (form: Form, permissionTypes: number[]) => void,
    setFirstRun: (val: boolean) => void,
    setLoading: (val: boolean) => void,
  ) => {
    if (!form) return;

    try {
      if (isSuperAdmin) {
        const permissions = getAllPermissions();
        setPermissionTypes(permissions);
        setCurrentFilter({ form_id: form.id });
        getResponsesForCurrentPage(form, permissions);
        setFirstRun(false);
        setLoading(false);
        return;
      }

      const permissions = getUserPermissions(form, roles, user, isSuperAdmin);

      if (!hasPermissionToSeeForm(permissions)) {
        navigate(IPath.ERROR, { replace: true });

        return;
      }

      setPermissionTypes(permissions);
      setCurrentFilter({ form_id: form.id });
      getResponsesForCurrentPage(form, permissions);
      setFirstRun(false);
      setLoading(false);
    } catch (error) {
      navigate(IPath.ERROR, { replace: true });
    }
  };

  return { initializeFormData };
};

// Helpers
const getAllPermissions = (): number[] => {
  return Object.values(PERMISSION_TYPES);
}

const getUserPermissions = (form: Form, roles: Role[], user: any, isSuperAdmin: boolean): number[] => {
  const userPermissions = extractUserPermissions(form, roles, user, isSuperAdmin);
  const publicPermissions = extractPublicFormPermissions(form, roles);
  return prioritizePermissions(userPermissions, publicPermissions);
}

const extractUserPermissions = (
  form: Form,
  roles: Role[],
  user: any,
  isSuperAdmin: boolean,
): number[] => {
  try {
    const fullAccessRoleId = findFullAccessRole(roles)?.role_id ?? null;
    const userRoleId = getUserRole(form.users, user, isSuperAdmin, fullAccessRoleId);
    const userRole = roles.find((r) => r.role_id === userRoleId);
    return userRole?.permission_types || [];
  } catch {
    return [];
  }
}

const extractPublicFormPermissions = (form: Form, roles: Role[]): number[] => {
  const roleId = form.formPermission?.role_id;

  if (!form.isPublic || !roleId) return [];

  const publicRole = roles.find((r) => r.role_id === roleId);
  return publicRole?.permission_types || [];
}

const findFullAccessRole = (roles: Role[]): Role | undefined => {
  const totalPermissionCount = Object.keys(PERMISSION_TYPES).length;

  return roles.find((role) => role.permission_types.length === totalPermissionCount);
}
