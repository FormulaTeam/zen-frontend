import apiClient from "../api/config";
import { useMutation, UseMutationOptions, UseMutationResult } from "@tanstack/react-query";

interface UseDeleteOptions<TData = unknown, TResponse = unknown> {
  endpoint: string;
  mutationKey?: readonly unknown[];
  mutationOptions?: Omit<
    UseMutationOptions<TResponse, Error, DeleteParams<TData>, unknown>,
    "mutationFn"
  >;
}

interface DeleteParams<TData = unknown> {
  data?: TData;
  params?: Record<string, any>;
}

// Generic useDelete hook for DELETE requests
export function useDelete<TData = unknown, TResponse = unknown>({
  endpoint,
  mutationOptions,
  mutationKey = [endpoint, "delete"],
}: UseDeleteOptions<TData, TResponse>): UseMutationResult<
  TResponse,
  Error,
  DeleteParams<TData>,
  unknown
> {
  return useMutation({
    mutationFn: async ({ data, params }: DeleteParams<TData>) => {
      const response = await apiClient.delete<TResponse>(endpoint, {
        data,
        params,
      });
      return response.data;
    },
    mutationKey,
    ...mutationOptions,
  });
}
