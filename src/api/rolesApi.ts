import { UseQueryOptions } from "@tanstack/react-query";
import { Role } from "../utils/interfaces";
import { useFetch } from "../utils/useFetch";
import apiClient from "./config";

/**
 * Fetch the roles available roles in the app.
 *
 * @returns A promise that resolves to the available roles in the app.
 */
export const getRoles = async (): Promise<any> => {
  try {
    const response = await apiClient.get<any[]>(`/roles/get-roles`);
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch roles:", error);
    throw error;
  }
};

// Yahel's changes - above is the original file - below are the changes
// ============================================================

export const useGetRoles = ({
  queryOptions,
}: {
  queryOptions?: Omit<
    UseQueryOptions<Role[], Error, Role[], readonly unknown[]>,
    "queryKey" | "queryFn"
  >;
}) => {
  return useFetch<undefined, Role[]>({
    endpoint: "/roles/get-roles",
    queryKey: () => ["roles"],
    queryOptions,
  });
};
