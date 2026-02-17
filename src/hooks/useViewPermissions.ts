import { ResponsesView } from "../types/interfaces/tableViews.types";
import { PERMISSION_TYPES } from "../utils/utils";

interface UseViewPermissionsProps {
  user?: {
    upn?: string;
    email?: string;
    isSuperAdmin?: boolean;
  };
  permissionTypes?: number[];
}

interface UseViewPermissionsReturn {
  hasFullAccess: boolean;
  canEditOrDeleteView: (view: ResponsesView) => boolean;
}

export const useViewPermissions = ({
  user,
  permissionTypes = [],
}: UseViewPermissionsProps): UseViewPermissionsReturn => {
  // Determine if user has full access (superadmin or has all permissions)
  const hasFullAccess = user?.isSuperAdmin || permissionTypes?.includes(PERMISSION_TYPES.EDIT_FORM);

  // Helper function to check if user can edit/delete a specific view
  const canEditOrDeleteView = (view: ResponsesView): boolean => {
    // Super admin or full access can edit/delete any view
    if (hasFullAccess) {
      return true;
    }

    // Otherwise, user can only edit/delete views they created
    const userUpn = user?.upn;
    return view.createdBy.toLowerCase() === userUpn?.toLowerCase();
  };

  return {
    hasFullAccess,
    canEditOrDeleteView,
  };
};
