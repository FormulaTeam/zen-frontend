import { useQuery } from "@tanstack/react-query";
import apiClient from "../api/config";
import { FormOverview } from "../utils/interfaces";
import { FormsScopeOption, FormsSortOption, SortDirection } from "../types/enums/filtersAndSorts.enum";

export interface FormsQueryParams {
  scope: FormsScopeOption;
  searchQuery?: string;
  sortBy?: FormsSortOption;
  sortDirection?: SortDirection;
  enabled?: boolean;
}

export function useGetFormsQuery({ enabled = true, searchQuery, ...rest }: FormsQueryParams) {
  const queryParams = {
    ...rest,
    ...(searchQuery ? { search: searchQuery } : {}),
  };

  return useQuery<FormOverview[]>({
    queryKey: ["forms", queryParams],
    queryFn: async () => {
      const response = await apiClient.get<FormOverview[]>("/forms", { params: queryParams });
      return response.data;
    },
    enabled,
  });
}
