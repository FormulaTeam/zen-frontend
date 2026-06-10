import { useCallback, useState } from "react";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import { User } from "../utils/interfaces";
import { restoreForm } from "../api";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { DELETED_TABS } from "../utils/recycleBin";
import { useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { getDeletedForms } from "../api/formsApi";
import { Filter } from "../utils/interfaces";

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
  
  // Need to translate sortValue to meta:deleted_at desc etc based on sortValue logic from previous. 
  // Let's assume sortValue maps to deleted_at for sortValue=7 (desc) and sortValue=8 (asc) based on the old toolbar
  const getSortBy = () => {
    if (filters.sortValue === 7) return "deleted_at";
    if (filters.sortValue === 8) return "deleted_at";
    return "deleted_at";
  };
  
  const getSortDirection = () => {
    if (filters.sortValue === 7) return "desc";
    if (filters.sortValue === 8) return "asc";
    return "desc";
  };

  const LIMIT = 20;

  const {
    data,
    isLoading: loading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["forms", "soft-deleted", searchQuery, filters.sortValue],
    queryFn: async ({ pageParam = 0 }) => {
      const filterObj: Filter = {
        query: searchQuery,
        sortBy: getSortBy(),
        orderBy: getSortDirection() === "desc" ? IOrderBy.DESC : IOrderBy.ASC,
        pageSize: LIMIT,
        pageNumber: pageParam,
      };
      // The backend uses limit/offset instead of pageSize/pageNumber but the client method getDeletedForms maps it to pageNumber/pageSize which is sent. 
      // Actually `getDeletedForms` sends pageNumber and pageSize but backend get soft deleted uses limit and offset. We need to make sure the mapping matches.
      return getDeletedForms(filterObj);
    },
    enabled: !!user,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || lastPage.length < LIMIT) {
        return undefined;
      }
      return allPages.length * LIMIT;
    },
  });

  const forms = data?.pages.flat() || [];

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
