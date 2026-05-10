import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/config";
import { FormsScopeOption, FormsSortOption, SortDirection } from "../types/enums/filtersAndSorts.enum";
import { FormOverviewDto } from "@src/types/shared";

export interface FormsQueryParams {
  scope: FormsScopeOption;
  searchQuery?: string;
  sortBy?: FormsSortOption;
  sortDirection?: SortDirection;
  enabled?: boolean;
  includePermissions?: boolean;
}

export function useGetFormsQuery({ enabled = true, searchQuery, ...rest }: FormsQueryParams) {
  const queryParams = {
    ...rest,
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  return useQuery<FormOverviewDto[]>({
    queryKey: ["forms", queryParams],
    queryFn: async () => {
      const response = await apiClient.get<FormOverviewDto[]>("/forms", { params: queryParams });
      return response.data;
    },
    enabled,
  });
}
