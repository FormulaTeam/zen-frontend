import apiClient from "../api/config";
import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";

interface UseDeleteOptions<TData = unknown, TResponse = unknown> {
  endpoint: string;
  mutationKey?: readonly unknown[];
  mutationOptions?: Omit<UseMutationOptions<TResponse, Error, TData, unknown>, "mutationFn">;
}

// Generic useDelete hook for DELETE requests
export function useDelete<TData = unknown, TResponse = unknown>({
  endpoint,
  mutationOptions,
  mutationKey = [endpoint, "delete"],
}: UseDeleteOptions<TData, TResponse>): UseMutationResult<TResponse, Error, TData, unknown> {
  return useMutation({
    mutationFn: async (data: TData) => {
      const response = await apiClient.delete<TResponse>(endpoint, { data });
      return response.data;
    },
    mutationKey,
    ...mutationOptions,
  });
}
