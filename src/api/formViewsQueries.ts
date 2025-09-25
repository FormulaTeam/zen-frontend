import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TableView } from "../types/interfaces/tableViews.types";
import { queryKeys, invalidateRelatedQueries } from "./queryClient";
import * as formViewsApi from "./formViewsApi";

// Custom hooks for form views using React Query

/**
 * Hook to fetch form views for a specific form
 * @param formId - The ID of the form to get views for
 * @param options - Additional query options
 */
// export const useFormViews = (
//   formId: string,
//   options?: {
//     enabled?: boolean;
//     refetchOnWindowFocus?: boolean;
//     staleTime?: number;
//   },
// ) => {
//   return useQuery({
//     queryKey: queryKeys.formViews.list(formId),
//     queryFn: () => formViewsApi.getFormViewsForForm(formId),
//     enabled: !!formId && (options?.enabled ?? true),
//     refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
//     staleTime: options?.staleTime,
//   });
// };

/**
 * Hook to fetch the default view for a specific form
 * @param formId - The ID of the form to get the default view for
 * @param options - Additional query options
 */
export const useDefaultFormView = (
  formId: string,
  options?: {
    enabled?: boolean;
    refetchOnWindowFocus?: boolean;
    staleTime?: number;
  },
) => {
  return useQuery({
    queryKey: queryKeys.formViews.default(formId),
    queryFn: () => formViewsApi.getDefaultFormView(formId),
    enabled: !!formId && (options?.enabled ?? true),
    refetchOnWindowFocus: options?.refetchOnWindowFocus ?? false,
    staleTime: options?.staleTime,
  });
};

/**
 * Hook to create a new form view
 * @param options - Mutation options
 */
export const useCreateFormView = (options?: {
  onSuccess?: (data: TableView) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formView: Omit<TableView, "_id" | "id" | "createdAt" | "updatedAt">) =>
      formViewsApi.createFormView(formView),
    onSuccess: (newView) => {
      // Invalidate and refetch form views for the specific form
      queryClient.invalidateQueries({
        queryKey: queryKeys.formViews.list(newView.formId),
      });

      // If it's a default view, invalidate default view query
      if (newView.isDefault) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.formViews.default(newView.formId),
        });
      }

      // Call custom onSuccess if provided
      options?.onSuccess?.(newView);
    },
    onError: (error) => {
      console.error("Failed to create form view:", error);
      options?.onError?.(error);
    },
  });
};

/**
 * Hook to update an existing form view
 * @param options - Mutation options
 */
export const useUpdateFormView = (options?: {
  onSuccess?: (data: TableView) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      viewId,
      updates,
    }: {
      viewId: number;
      updates: Parameters<typeof formViewsApi.updateFormView>[1];
    }) => formViewsApi.updateFormView(viewId, updates),
    onSuccess: (updatedView, variables) => {
      // Update the cache with the new data optimistically
      queryClient.setQueryData(
        queryKeys.formViews.list(updatedView.formId),
        (oldData: TableView[] | undefined) =>
          oldData?.map((view) => (view.id === updatedView.id ? updatedView : view)) || [],
      );

      // If default status changed, invalidate default view query
      if ("isDefault" in variables.updates && variables.updates.isDefault) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.formViews.default(updatedView.formId),
        });
      }

      // Call related query invalidation helper
      invalidateRelatedQueries.onFormViewUpdate(updatedView.formId, updatedView.isDefault);

      // Call custom onSuccess if provided
      options?.onSuccess?.(updatedView);
    },
    onError: (error) => {
      console.error("Failed to update form view:", error);
      options?.onError?.(error);
    },
  });
};

/**
 * Hook to delete a form view
 * @param options - Mutation options
 */
export const useDeleteFormView = (options?: {
  onSuccess?: (viewId: number) => void;
  onError?: (error: any) => void;
}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (viewId: number) => formViewsApi.deleteFormView(viewId),
    onSuccess: (success, viewId) => {
      // Remove from all relevant queries since we don't have formId after deletion
      queryClient.invalidateQueries({
        queryKey: queryKeys.formViews.all,
      });

      // Call custom onSuccess if provided
      options?.onSuccess?.(viewId);
    },
    onError: (error) => {
      console.error("Failed to delete form view:", error);
      options?.onError?.(error);
    },
  });
};

/**
 * Hook to prefetch form views for a specific form
 * Useful for preloading data before navigation
 * @param formId - The ID of the form to prefetch views for
 */
// export const usePrefetchFormViews = () => {
//   const queryClient = useQueryClient();

//   return (formId: string) => {
//     queryClient.prefetchQuery({
//       queryKey: queryKeys.formViews.list(formId),
//       queryFn: () => formViewsApi.getFormViewsForForm(formId),
//       staleTime: 5 * 60 * 1000, // 5 minutes
//     });
//   };
// };

/**
 * Hook to get cached form view data without making a request
 * @param formId - The ID of the form
 */
export const useCachedFormViews = (formId: string) => {
  const queryClient = useQueryClient();

  return queryClient.getQueryData<TableView[]>(queryKeys.formViews.list(formId));
};

/**
 * Hook to manually invalidate form view queries
 * Useful for refreshing data after external changes
 */
export const useInvalidateFormViews = () => {
  const queryClient = useQueryClient();

  return {
    invalidateAll: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.formViews.all });
    },
    invalidateForForm: (formId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.formViews.list(formId) });
    },
    invalidateDefault: (formId: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.formViews.default(formId) });
    },
  };
};
