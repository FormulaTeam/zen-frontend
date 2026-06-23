import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "../api/config";
import {
  FormsScopeOption,
  FormsSortOption,
  SortDirection,
} from "../types/enums/filtersAndSorts.enum";
import { FormOverviewDto } from "@src/types/shared";

export const FORMS_PAGINATION_LIMIT = 20;

export interface FormsQueryParams {
  scope: FormsScopeOption;
  searchQuery?: string;
  sortBy?: FormsSortOption;
  sortDirection?: SortDirection;
  enabled?: boolean;
  includePermissions?: boolean;
  softDeleted?: boolean;
}

export function useGetFormsQuery({ enabled = true, searchQuery, softDeleted, ...rest }: FormsQueryParams) {
  const queryParams = {
    ...rest,
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  return useInfiniteQuery({
    queryKey: softDeleted ? ["forms", "deleted", queryParams] : ["forms", queryParams],
    queryFn: async ({ pageParam = 0, signal }) => {
      const endpoint = softDeleted ? "/forms/soft-deleted" : "/forms";
      const response = await apiClient.get<FormOverviewDto[]>(endpoint, {
        params: { ...queryParams, limit: FORMS_PAGINATION_LIMIT, offset: pageParam },
        signal,
      });
      return response.data;
    },
    enabled,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < FORMS_PAGINATION_LIMIT) {
        return undefined;
      }
      return allPages.length * FORMS_PAGINATION_LIMIT;
    },
  });
}
