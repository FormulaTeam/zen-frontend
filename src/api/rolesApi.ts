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
