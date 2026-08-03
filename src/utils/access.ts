import { permission, Permission } from "formula-gear";
import { Form, FormUser, ResponseForm, Role, RoleId, User } from "./interfaces";

const RESPONSE_ACCESS_PERMISSIONS: Permission[] = [
  permission.ReadAnyResponse,
  permission.ReadForm,
  permission.DeleteForm,
  permission.UpdateForm,
  permission.ShareForm,
  permission.SyncForm,
  permission.ExportForm,
];

function getUserRole(
  formUsers: FormUser[] | undefined,
  currentUser: User,
  isSuperAdmin: boolean | null,
  fullAccessRoleId: RoleId | null,
) {
  if (isSuperAdmin && fullAccessRoleId) return fullAccessRoleId;

  const permittedUser = (formUsers || []).find(
    (u) => u.upn?.toLowerCase() === currentUser?.upn?.toLowerCase(),
  );

  if (permittedUser) {
    return permittedUser.role_id;
  }

  throw new Error("User has no role for the form");
}

export function checkUserAccessForResponse(
  roles: Role[],
  viewMode: boolean,
  response: ResponseForm | null,
  form: Form,
  user: User,
  isSuperAdmin: boolean | null = null,
) {
  try {
    const fullAccessRole = roles.find(
      (role) => role.permission_types.length === Object.keys(permission).length,
    );

    const userRole = getUserRole(form.users, user, !!isSuperAdmin, fullAccessRole?.role_id || null);

    const roleObj = roles.find((r) => r.role_id === userRole);
    const permissionTypes = roleObj?.permission_types || [];

    if (response?.id && !viewMode) {
      const hasPermissionForResponse = permissionTypes.some((type) =>
        RESPONSE_ACCESS_PERMISSIONS.includes(type as Permission),
      );
      if (!hasPermissionForResponse) {
        return false;
      }
    } else if (!response?.id && !viewMode) {
      const hasPermissionToCreateResponse = permissionTypes.some(
        (type) => permission.CreateResponse === type,
      );
      if (!hasPermissionToCreateResponse) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}
