import { permission } from "formula-gear";
import { ResponsesView } from "../types/interfaces/tableViews.types";

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
  const hasFullAccess = user?.isSuperAdmin || permissionTypes?.includes(permission.UpdateForm);

  // Helper function to check if user can edit/delete a specific view
  const canEditOrDeleteView = (view: ResponsesView): boolean => {
    // Super admin or full access can edit/delete any view
    if (hasFullAccess) {
      return true;
    }

    // Otherwise, user can only edit/delete views they created
    const userUpn = user?.upn;
    const creatorUpn =
      typeof view.createdBy === "string"
        ? view.createdBy
        : (view.createdBy as any)?.upn || (view.createdBy as any)?.UPN;

    return creatorUpn?.toLowerCase() === userUpn?.toLowerCase();
  };

  return {
    hasFullAccess,
    canEditOrDeleteView,
  };
};
