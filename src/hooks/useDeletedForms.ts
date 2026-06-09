import { useCallback, useState } from "react";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import { User } from "../utils/interfaces";
import { restoreForm } from "../api";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { DELETED_TABS } from "../utils/recycleBin";
import { formsScopeOption } from "../types/enums/filtersAndSorts.enum";
import { useGetFormsData } from "./useGetFormsData";
import { useQueryClient } from "@tanstack/react-query";

export interface DeletedFormsFilters {
  deletedBy: string;
  createdBy: string;
  sortValue?: number;
}

export const useDeletedForms = (
  user: User,
  handleTabChange: (event: React.SyntheticEvent, newValue: number) => void,
  filters: DeletedFormsFilters,
) => {
  const { isSuperAdmin } = useSuperAdmin();
  const queryClient = useQueryClient();

  const searchQuery = filters.createdBy?.trim() || undefined;

  const {
    formsData: forms,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFormsData({
    scope: isSuperAdmin ? formsScopeOption.AllForms : formsScopeOption.AccessibleForms,
    softDeleted: true,
    searchQuery: searchQuery,
    enabled: !!user,
  });

  const handleRestoreForm = useCallback(
    async (formId: number) => {
      try {
        const response = await restoreForm(formId);
        if (response) {
          showSuccessNotification("שחזור הטופס בוצע בהצלחה");
          queryClient.invalidateQueries({ queryKey: ["forms"] });
          handleTabChange({} as React.SyntheticEvent, DELETED_TABS.FORMS);
        } else {
          showErrorNotification("שחזור הטופס נכשל");
        }
      } catch {
        showErrorNotification("שחזור הטופס נכשל");
      }
    },
    [handleTabChange, queryClient],
  );

  return {
    forms,
    loading,
    handleRestoreForm,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
};
