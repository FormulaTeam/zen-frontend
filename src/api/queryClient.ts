import { QueryClient } from "@tanstack/react-query";
import { logoutAction } from "../utils/auth";

// Create a query client with custom configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // How long to consider data fresh (5 minutes)
      staleTime: 5 * 60 * 1000,
      // How long to keep data in cache (10 minutes)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests up to 3 times
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (except 401 which is handled by axios interceptor)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      // Exponential backoff for retries
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Don't refetch on window focus by default (can be overridden per query)
      refetchOnWindowFocus: false,
      // Refetch on network reconnect
      refetchOnReconnect: true,
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error: any) => {
        // Don't retry client errors (4xx)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      // Global error handler for mutations
      onError: (error: any) => {
        console.error("Mutation error:", error);

        // Handle authentication errors
        if (error?.response?.status === 401) {
          logoutAction();
        }
      },
    },
  },
});

// Query key factory for consistent key generation
export const queryKeys = {
  // Auth related
  auth: {
    all: ["auth"] as const,
    user: () => [...queryKeys.auth.all, "user"] as const,
    permissions: () => [...queryKeys.auth.all, "permissions"] as const,
  },

  // Forms related
  forms: {
    all: ["forms"] as const,
    lists: () => [...queryKeys.forms.all, "list"] as const,
    list: (filters?: any) => [...queryKeys.forms.lists(), { filters }] as const,
    details: () => [...queryKeys.forms.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.forms.details(), id] as const,
  },

  // Form views related
  formViews: {
    all: ["formViews"] as const,
    lists: () => [...queryKeys.formViews.all, "list"] as const,
    list: (formId: string) => [...queryKeys.formViews.lists(), formId] as const,
    details: () => [...queryKeys.formViews.all, "detail"] as const,
    detail: (id: number) => [...queryKeys.formViews.details(), id] as const,
    default: (formId: string) => [...queryKeys.formViews.all, "default", formId] as const,
  },

  // Responses related
  responses: {
    all: ["responses"] as const,
    lists: () => [...queryKeys.responses.all, "list"] as const,
    list: (formId: string, filters?: any) =>
      [...queryKeys.responses.lists(), formId, { filters }] as const,
    details: () => [...queryKeys.responses.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.responses.details(), id] as const,
  },

  // Users related
  users: {
    all: ["users"] as const,
    lists: () => [...queryKeys.users.all, "list"] as const,
    list: (filters?: any) => [...queryKeys.users.lists(), { filters }] as const,
    details: () => [...queryKeys.users.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },

  // Roles related
  roles: {
    all: ["roles"] as const,
    lists: () => [...queryKeys.roles.all, "list"] as const,
    list: (filters?: any) => [...queryKeys.roles.lists(), { filters }] as const,
    details: () => [...queryKeys.roles.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.roles.details(), id] as const,
  },
} as const;

// Utility function to invalidate related queries
export const invalidateRelatedQueries = {
  // When a form is updated, invalidate form views and responses
  onFormUpdate: (formId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.forms.detail(formId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.formViews.list(formId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.responses.list(formId) });
  },

  // When a form view is updated, invalidate related form data
  onFormViewUpdate: (formId: string, isDefault?: boolean) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.formViews.list(formId) });
    if (isDefault) {
      queryClient.invalidateQueries({ queryKey: queryKeys.formViews.default(formId) });
    }
  },

  // When user permissions change, invalidate auth-related queries
  onAuthUpdate: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
  },
};

export default queryClient;
