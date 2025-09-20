import { PERMISSION_TYPES } from "./utils";

export const hasPermissionToSeeForm = (permissionTypes: number[]) =>
  permissionTypes.some((type) =>
    [
      PERMISSION_TYPES.VIEW_RESPONSE,
      PERMISSION_TYPES.VIEW_YOUR_RESPONSES,
      PERMISSION_TYPES.CREATE_FORM,
      PERMISSION_TYPES.DELETE_FORM,
      PERMISSION_TYPES.EDIT_FORM,
      PERMISSION_TYPES.SHARE_FORM,
      PERMISSION_TYPES.SYNC_FORM,
      PERMISSION_TYPES.EXPORT_FORM,
    ].includes(type),
  );
