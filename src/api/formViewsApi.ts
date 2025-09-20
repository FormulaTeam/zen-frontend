import apiClient from "./config";
import { TableView, FormViewFilter } from "../types/interfaces/tableViews.types";

const viewsBaseUrl = "/form-views";

/**
 * Fetch form views with optional query parameters.
 *
 * @param filter - Optional filter parameters for querying form views.
 * @returns A promise that resolves to an array of form views.
 */
export const getFormViews = async (filter?: FormViewFilter): Promise<TableView[]> => {
  try {
    const response = await apiClient.post<TableView[]>(`${viewsBaseUrl}/get-views`, filter || {});
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch form views:", error);
    throw error;
  }
};

/**
 * Fetch form views for a specific form.
 *
 * @param formId - The ID of the form to get views for.
 * @returns A promise that resolves to an array of form views for the form.
 */
export const getFormViewsForForm = async (formId: string): Promise<TableView[]> => {
  try {
    const response = await apiClient.get<TableView[]>(`${viewsBaseUrl}/form/${formId}`);
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch form views for form:", error);
    throw error;
  }
};

/**
 * Fetch the default view for a specific form.
 *
 * @param formId - The ID of the form to get the default view for.
 * @returns A promise that resolves to the default form view or null if not found.
 */
export const getDefaultFormView = async (formId: string): Promise<TableView | null> => {
  try {
    const response = await apiClient.get<TableView>(`${viewsBaseUrl}/form/${formId}/default`);
    return response?.data || null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null; // No default view found
    }
    console.error("Failed to fetch default form view:", error);
    throw error;
  }
};

/**
 * Fetch a specific form view by ID.
 *
 * @param viewId - The numeric ID of the form view to retrieve.
 * @returns A promise that resolves to the form view or null if not found.
 */
export const getFormViewById = async (viewId: number): Promise<TableView | null> => {
  try {
    const response = await apiClient.get<TableView>(`${viewsBaseUrl}/${viewId}`);
    return response?.data || null;
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return null; // View not found
    }
    console.error("Failed to fetch form view by ID:", error);
    throw error;
  }
};

/**
 * Create a new form view.
 *
 * @param formView - The form view data to create.
 * @returns A promise that resolves to the created form view.
 */
export const createFormView = async (
  formView: Omit<TableView, "_id" | "id" | "createdAt" | "updatedAt">,
): Promise<TableView> => {
  try {
    const response = await apiClient.post<TableView>(`${viewsBaseUrl}/create`, formView);
    return response?.data;
  } catch (error) {
    console.error("Failed to create form view:", error);
    throw error;
  }
};

/**
 * Update an existing form view.
 *
 * @param viewId - The numeric ID of the form view to update.
 * @param updates - The updates to apply to the form view.
 * @returns A promise that resolves to the updated form view.
 */
export const updateFormView = async (
  viewId: number,
  updates: Partial<Pick<TableView, "name" | "isPublic" | "isDefault" | "config">>,
): Promise<TableView> => {
  try {
    const response = await apiClient.put<TableView>(`${viewsBaseUrl}/${viewId}`, updates);
    return response?.data;
  } catch (error) {
    console.error("Failed to update form view:", error);
    throw error;
  }
};

/**
 * Delete a form view.
 *
 * @param viewId - The numeric ID of the form view to delete.
 * @returns A promise that resolves to true if deletion was successful.
 */
export const deleteFormView = async (viewId: number): Promise<boolean> => {
  try {
    await apiClient.delete(`/form-views/${viewId}`);
    return true;
  } catch (error) {
    console.error("Failed to delete form view:", error);
    throw error;
  }
};

/**
 * Get the count of form views matching the filter.
 *
 * @param filter - Optional filter criteria for counting form views.
 * @returns A promise that resolves to the count of matching form views.
 */
export const getFormViewsCount = async (filter?: FormViewFilter): Promise<number> => {
  try {
    const response = await apiClient.post<{ count: number }>(`${viewsBaseUrl}/count`, filter || {});
    return response?.data?.count || 0;
  } catch (error) {
    console.error("Failed to get form views count:", error);
    throw error;
  }
};
