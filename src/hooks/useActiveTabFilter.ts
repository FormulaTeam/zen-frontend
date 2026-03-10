import { useCallback } from "react";
import { FormsTab } from "../utils/interfaces";
import { formsTabs } from "../utils/utils";
import { formsScopeOption, FormsScopeOption } from "../types/enums/filtersAndSorts.enum";

interface UseActiveTabFilterParams {
  isSuperAdmin: boolean;
  tabValue: FormsTab | null;
}

export function useActiveTabFilter({ isSuperAdmin, tabValue }: UseActiveTabFilterParams) {
  const getScope = useCallback((): FormsScopeOption => {
    if (isSuperAdmin && tabValue === formsTabs.allForms) {
      return formsScopeOption.AllForms;
    }
    if (tabValue === formsTabs.sharedWithUser) {
      return formsScopeOption.SharedWithMeForms;
    }
    return formsScopeOption.MyForms;
  }, [isSuperAdmin, tabValue]);

  return { getScope };
}
