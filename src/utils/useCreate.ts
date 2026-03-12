import { UseMutationOptions, UseMutationResult, useMutation } from "@tanstack/react-query";
import apiClient from "../api/config";

interface UseCreateOptions<TData = unknown, TResponse = unknown> {
  endpoint: string;
  headers?: Record<string, string>;
  mutationOptions?: Omit<
    UseMutationOptions<TResponse, Error, TData, unknown>,
    "mutationFn" | "mutationKey"
  >;
  mutationKey: readonly unknown[];
  
  axiosConfig?: Record<string, any>;
}

// Generic useCreate hook for POST requests
export function useCreate<TData = unknown, TResponse = unknown>({
  endpoint,
  headers,
  mutationOptions,
  mutationKey = [endpoint, "create"],
  axiosConfig,
}: UseCreateOptions<TData, TResponse>): UseMutationResult<TResponse, Error, TData, unknown> {
  return useMutation({
    mutationFn: async (data: TData) => {
      const response = await apiClient.post<TResponse>(endpoint, data, axiosConfig);
      return response.data;
    },
    mutationKey,
    ...mutationOptions,
  });
}
