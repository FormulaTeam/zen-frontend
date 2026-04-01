import type { FormDto, UserRoleDto } from "../types/shared";
import { FieldTypeIds, Form, User } from "./interfaces";
import { getKeyByValue, PERMISSION_TYPES } from "./utils";

// Function to check the importance of a permission - higher priority permissions get higher scores
const getPermissionPriority = (permission: number): number => {
  const priorityMap: { [key: number]: number } = {
    [PERMISSION_TYPES.CREATE_FORM]: 100,
    [PERMISSION_TYPES.DELETE_FORM]: 100,
    [PERMISSION_TYPES.EDIT_FORM]: 100,
    [PERMISSION_TYPES.SHARE_FORM]: 100,
    [PERMISSION_TYPES.SYNC_FORM]: 100,
    [PERMISSION_TYPES.EXPORT_FORM]: 100,
    [PERMISSION_TYPES.CREATE_RESPONSE]: 80,
    [PERMISSION_TYPES.DELETE_RESPONSE]: 90,
    [PERMISSION_TYPES.EDIT_RESPONSE]: 70,
    [PERMISSION_TYPES.VIEW_RESPONSE]: 60,
    [PERMISSION_TYPES.VIEW_YOUR_RESPONSES]: 50,
  };

  return priorityMap[permission] || 0;
};

// Function to merge permissions with priority - higher priority permissions are preferred
export const prioritizePermissions = (
  userPermissions: number[],
  publicPermissions: number[],
): number[] => {
  const allPermissions = [...userPermissions, ...publicPermissions];
  const uniquePermissions = [...new Set(allPermissions)];

  uniquePermissions.sort(
    (firstPermission, secondPermission) =>
      getPermissionPriority(secondPermission) - getPermissionPriority(firstPermission),
  );

  return uniquePermissions;
};

export const normalizeFieldValue = (field: any, value: any): any => {
  let newValue = value;
  const key = getKeyByValue(FieldTypeIds, field.typeId);

  if (key) {
    if (!["date", "hour", "checkbox", "number"].includes(key) && newValue === undefined)
      newValue = "";
  }

  if (field.typeId === FieldTypeIds.options) {
    if (field.multiSelect && newValue && !Array.isArray(newValue)) newValue = [newValue];
    else if (!field.multiSelect && Array.isArray(newValue)) newValue = newValue[0];
  }

  return newValue;
};

const getRolePermissionTypes = (role: UserRoleDto["role"]): number[] => {
  if (role && typeof role === "object" && "permission_types" in role) {
    const permissionTypes = (role as { permission_types?: unknown }).permission_types;

    if (Array.isArray(permissionTypes))
      return permissionTypes.filter(
        (permissionType): permissionType is number => typeof permissionType === "number",
      );
  }

  return [];
};

const getUserId = (user: User): number | undefined => {
  const userId = (user as User & { id?: unknown; userId?: unknown }).id;
  if (typeof userId === "number") return userId;

  const fallbackUserId = (user as User & { id?: unknown; userId?: unknown }).userId;
  if (typeof fallbackUserId === "number") return fallbackUserId;

  return undefined;
};

export const resolveUserPermissions = (
  form: FormDto | null,
  user: User,
  roles: UserRoleDto[],
  viewMode: boolean,
  setPermissionTypes: (permissions: number[]) => void,
) => {
  if (!form || !viewMode) return;

  const currentUserId = getUserId(user);

  let userSpecificPermissions: number[] = [];
  let publicFormPermissions: number[] = [];

  if (typeof currentUserId === "number") {
    const specificRole = roles.find((userRole) => userRole.user.id === currentUserId);

    if (specificRole) userSpecificPermissions = getRolePermissionTypes(specificRole.role);
  }

  if (form.publicRole) publicFormPermissions = getRolePermissionTypes(form.publicRole);

  const finalPermissions = prioritizePermissions(userSpecificPermissions, publicFormPermissions);

  setPermissionTypes(finalPermissions);
};

export const getCreatorName = (form: any) => {
  const user = form?.users.find((formUser: any) => form.created_by === formUser.upn);

  return `${user?.firstName || ""} ${user?.lastName || ""}`;
};
