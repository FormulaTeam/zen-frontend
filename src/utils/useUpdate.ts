import apiClient from "../api/config";
import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";

interface UseUpdateOptions<TData = unknown, TResponse = unknown> {
  endpoint: string;
  mutationKey?: readonly unknown[];
  mutationOptions?: Omit<UseMutationOptions<TResponse, Error, TData, unknown>, "mutationFn">;
}

// Generic useUpdate hook for PATCH requests
export function useUpdate<TData = unknown, TResponse = unknown>({
  endpoint,
  mutationOptions,
  mutationKey = [endpoint, "update"],
}: UseUpdateOptions<TData, TResponse>): UseMutationResult<TResponse, Error, TData, unknown> {
  return useMutation({
    mutationFn: async (data: TData) => {
      const response = await apiClient.patch<TResponse>(endpoint, data);
      return response.data;
    },
    mutationKey,
    ...mutationOptions,
  });
}
