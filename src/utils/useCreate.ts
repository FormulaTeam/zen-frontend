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
}

// Generic useCreate hook for POST requests
export function useCreate<TData = unknown, TResponse = unknown>({
  endpoint,
  headers,
  mutationOptions,
  mutationKey = [endpoint, "create"],
}: UseCreateOptions<TData, TResponse>): UseMutationResult<TResponse, Error, TData, unknown> {
  return useMutation({
    mutationFn: async (data: TData) => {
      // Check if data is FormData
      const isFormData = data instanceof FormData;

      // For FormData, don't set Content-Type header (let browser set it with boundary)
      const requestHeaders = isFormData
        ? { ...headers }
        : { "Content-Type": "application/json", ...headers };

      const response = await apiClient.post<TResponse>(endpoint, data, {
        headers: requestHeaders,
      });
      return response.data;
    },
    mutationKey,
    ...mutationOptions,
  });
}
