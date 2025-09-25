import apiClient from "../api/config";
import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";

interface UseFetchOptions<TParams = undefined, TResponse = unknown> {
  queryKey: (params?: TParams) => readonly unknown[];
  endpoint: string;
  params?: TParams;
  queryOptions?: Omit<
    UseQueryOptions<TResponse, Error, TResponse, readonly unknown[]>,
    "queryKey" | "queryFn"
  >;
}

// Generic useFetch hook
export function useFetch<TParams = undefined, TResponse = unknown>({
  queryKey,
  endpoint,
  params,
  queryOptions,
}: UseFetchOptions<TParams, TResponse>): UseQueryResult<TResponse, Error> {
  return useQuery({
    queryKey: queryKey(params),
    queryFn: async () => {
      const response = await apiClient.get<TResponse>(endpoint, {
        params: params as Record<string, any>,
      });
      return response.data;
    },
    ...queryOptions,
  });
}
