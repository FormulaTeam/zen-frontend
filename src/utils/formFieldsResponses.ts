import { FieldTypeIds, Form, Role, User } from "./interfaces";
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
export const prioritizePermissions = (userPermissions: number[], publicPermissions: number[]): number[] => {
  const allPermissions = [...userPermissions, ...publicPermissions];
  const uniquePermissions = [...new Set(allPermissions)];
  
  // Sort by priority (highest to lowest)
  uniquePermissions.sort((a, b) => getPermissionPriority(b) - getPermissionPriority(a));
  
  return uniquePermissions;
};


export const normalizeFieldValue = (field: any, value: any): any => {
  let newValue = value;
  let key = getKeyByValue(FieldTypeIds, field.typeId);
  if (key) {
    if (!["date", "hour", "checkbox", "number"].includes(key) && newValue === undefined) {
      newValue = "";
    }
  }

  if (field.typeId === FieldTypeIds.options) {
    if (field.multiSelect && newValue && !Array.isArray(newValue)) {
      newValue = [newValue];
    } else if (!field.multiSelect && Array.isArray(newValue)) {
      newValue = newValue[0];
    }
  }

  return newValue;
};

export const resolveUserPermissions = (
  form: Form | null,
  user: User,
  roles: Role[],
  viewMode: boolean,
  setPermissionTypes: (permissions: number[]) => void,
) => {
  if (!form || !viewMode) return;

  // finding the role of the current user
  const userRole = form?.users?.find(
    (u) => u.upn?.toLowerCase() === user.upn?.toLowerCase(),
  )?.role_id;

  let userSpecificPermissions: number[] = [];
  let publicFormPermissions: number[] = [];

  // finding specific user permissions
  const specificRole = roles.find((r) => r.role_id === userRole);
  if (specificRole) {
    userSpecificPermissions = [...specificRole.permission_types];
  }

  // finding public form permissions
  if (form.isPublic && form.formPermission?.role_id) {
    const publicRole = roles.find((r) => r.role_id === form.formPermission?.role_id);
    if (publicRole) {
      publicFormPermissions = [...publicRole.permission_types];
    }
  }

  const finalPermissions = prioritizePermissions(userSpecificPermissions, publicFormPermissions);
  setPermissionTypes(finalPermissions);
};

export const getCreatorName = (form: any) => {
  const user = form?.users.find((u) => form.created_by === u.upn);
  return `${user?.firstName || ""} ${user?.lastName || ""}`;
};
