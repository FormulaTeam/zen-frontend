import { useCallback } from "react";
import { Filter, FormsTab } from "../utils/interfaces";
import { formsTabs } from "../utils/utils";

interface UseActiveTabFilterParams {
  isSuperAdmin: boolean;
  tabValue: FormsTab | null;
  user: { upn?: string };
}

/**
 * Custom hook to get the filter based on the active tab and user role.
 * @param {boolean} isSuperAdmin - Indicates if the user is a super admin.
 * @param {FormsTab | null} tabValue - The current active tab value.
 * @param {{ upn?: string }} user - The user object containing user information.
 * @returns {{ getFilter: (inputFilter: Filter) => Filter }} - Function to get the filter based on the active tab and user role.
 */
export function useActiveTabFilter({ isSuperAdmin, tabValue, user }: UseActiveTabFilterParams) {
  const getFilter = useCallback(
    (inputFilter: Filter): Filter => {
      const filter = { ...inputFilter };
      const userUpn = user.upn?.toLowerCase();

      // If super admin and selected "All Forms" tab, return all forms without filtering
      if (isSuperAdmin && tabValue === formsTabs.allForms) {
        return filter;
      }

      // "Forms shared with me" tab
      if (tabValue === formsTabs.sharedWithUser) {
        filter.query = {
          ...filter.query,
          users: { $elemMatch: { upn: userUpn } },
          created_by: { $ne: userUpn },
        };
        return filter;
      }

      // "Forms I created" tab
      if (tabValue === formsTabs.currentUserCreated) {
        filter.query = {
          ...filter.query,
          created_by: userUpn,
        };

        // Clean up unused users filter
        if (filter.query.users) {
          delete filter.query.users;
        }

        return filter;
      }

      // Fallback - return original filter if no valid tab is selected
      return filter;
    },
    [isSuperAdmin, tabValue, user.upn],
  );

  return { getFilter };
}
