import { permission } from "formula-gear";
import { useCallback } from "react";
import { ResponsesView } from "../types/interfaces/tableViews.types";

interface UseViewPermissionsProps {
  user?: {
    upn?: string;
    email?: string;
    isSuperAdmin?: boolean;
    UPN?: string;
    mail?: string;
    displayName?: string;
    name?: string;
  };
  permissionTypes?: number[];
}

interface UseViewPermissionsReturn {
  canManagePublicViews: boolean;
  canEditOrDeleteView: (view?: ResponsesView) => boolean;
}

export const useViewPermissions = ({
  user,
  permissionTypes = [],
}: UseViewPermissionsProps): UseViewPermissionsReturn => {
  // Determine if user can manage public/default views (superadmin or has form update permissions)
  const canManagePublicViews = Boolean(user?.isSuperAdmin || permissionTypes?.includes(permission.UpdateForm));

  // Helper function to check if user can edit/delete a specific view
  const canEditOrDeleteView = useCallback((view?: ResponsesView): boolean => {
    // If no view, it's a "create" scenario which is always allowed
    if (!view || !view.id) {
      return true;
    }

    // Super admin can edit/delete any view for maintenance
    if (user?.isSuperAdmin) {
      return true;
    }

    // Get all possible identifiers for the current user
    const userIdentifiers = new Set<string>();
    if (user?.upn) userIdentifiers.add(user.upn.toLowerCase());
    if (user?.email) userIdentifiers.add(user.email.toLowerCase());
    if (user?.UPN) userIdentifiers.add(user.UPN.toLowerCase());
    if (user?.mail) userIdentifiers.add(user.mail.toLowerCase());

    if (userIdentifiers.size === 0) return false;

    // Get all possible identifiers for the view creator
    const creatorIdentifiers = new Set<string>();
    if (typeof view.createdBy === "string") {
      creatorIdentifiers.add(view.createdBy.toLowerCase());
    } else if (view.createdBy && typeof view.createdBy === "object") {
      const c = view.createdBy as any;
      if (c.upn) creatorIdentifiers.add(c.upn.toLowerCase());
      if (c.UPN) creatorIdentifiers.add(c.UPN.toLowerCase());
      if (c.email) creatorIdentifiers.add(c.email.toLowerCase());
      if (c.mail) creatorIdentifiers.add(c.mail.toLowerCase());
    }

    // Check if there's any overlap between user identifiers and creator identifiers
    for (const id of userIdentifiers) {
      if (creatorIdentifiers.has(id)) {
        return true;
      }
    }

    return false;
  }, [user]);

  return {
    canManagePublicViews,
    canEditOrDeleteView,
  };
};
