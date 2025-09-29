import apiClient from "./config";
import { SuperAdmin, User } from "../utils/interfaces";
import { useUpdate } from "../utils/useUpdate";
import { useFetch } from "../utils/useFetch";
import { UseQueryResult } from "@tanstack/react-query";

/**
 * Fetch all forms with optional query parameters.
 *
 * @param filter - Optional filter parameters for querying forms.
 * @returns A promise that resolves to an array of forms.
 */
export const getUsers = async (filterName?: string): Promise<any[]> => {
  const trimmedName = filterName?.trim();
  if (!trimmedName) {
    return [];
  }

  const params = {
    name: trimmedName,
  };
  try {
    const response = await apiClient.get<User[]>("/users", { params });
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

export const getIsSuperAdmin = async (user: User | null) => {
  try {
    const response = await apiClient.post<boolean>("/users/is-super-admin", { user });
    return response.data || false;
  } catch (error) {
    console.error("Failed to fetch super admins:", error);
    throw error;
  }
};

// Yahels changes
export const useGetIsSuperAdmin = ({ user }: { user: User | null }): UseQueryResult<boolean> => {
  return useFetch<User | null, boolean>({
    endpoint: "/users/super-admin",
    params: user,
    queryKey: () => ["super-admin", user],
    queryOptions: { enabled: !!user },
  });
};
