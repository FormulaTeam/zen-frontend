import { useInfiniteQuery } from "@tanstack/react-query";
import apiClient from "../api/config";
import {
  FormsScopeOption,
  FormsSortOption,
  SortDirection,
} from "../types/enums/filtersAndSorts.enum";
import { FormOverviewDto } from "@src/types/shared";

export interface FormsQueryParams {
  scope: FormsScopeOption;
  searchQuery?: string;
  sortBy?: FormsSortOption;
  sortDirection?: SortDirection;
  enabled?: boolean;
  includePermissions?: boolean;
  softDeleted?: boolean;
}

export const FORMS_PAGINATION_LIMIT = 25;

export function useGetFormsQuery({ enabled = true, searchQuery, ...rest }: FormsQueryParams) {
  const queryParams = {
    ...rest,
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  return useInfiniteQuery({
    queryKey: ["forms", queryParams],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await apiClient.get<FormOverviewDto[]>("/forms", {
        params: { ...queryParams, limit: FORMS_PAGINATION_LIMIT, offset: pageParam },
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
