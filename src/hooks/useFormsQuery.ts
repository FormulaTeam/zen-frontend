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

export function useGetFormsQuery({ enabled = true, ...params }: FormsQueryParams) {
  return useQuery<FormOverview[]>({
    queryKey: ["forms", params],
    queryFn: async () => {
      const response = await apiClient.get<FormOverview[]>("/forms", { params });
      return response.data;
    },
    enabled,
  });
}
