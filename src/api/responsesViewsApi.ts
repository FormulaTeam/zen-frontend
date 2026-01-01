import apiClient from "./config";
import { ResponsesView } from "../types/interfaces/tableViews.types";
import { useFetch } from "../utils/useFetch";
import { UseQueryResult } from "@tanstack/react-query";
import { StatusCodes } from "http-status-codes";

const responsesViewsBaseUrl = "/responses-views";

/**
 * Fetch responses views for a specific form.
 *
 * @param formId - The ID of the form to get views for.
 * @returns A promise that resolves to an array of responses views for the form.
 */
export const useGetResponsesViews = (formId: string): UseQueryResult<ResponsesView[], Error> => {
  return useFetch<{}, ResponsesView[]>({
    endpoint: `${responsesViewsBaseUrl}/${formId}`,
    queryKey: () => [responsesViewsBaseUrl, formId],
  });
};

/**
 * Fetch the default view for a specific form.
 *
 * @param formId - The ID of the form to get the default view for.
 * @returns A promise that resolves to the default responses view or null if not found.
 */
export const getDefaultResponsesView = async (formId: string): Promise<ResponsesView | null> => {
  try {
    const { data } = await apiClient.get<ResponsesView>(
      `${responsesViewsBaseUrl}/${formId}/default`,
    );

    return data ?? null;
  } catch (error: any) {
    if (error?.response?.status === StatusCodes.NOT_FOUND) {
      return null;
    }

    console.error("Failed to fetch default responses view:", error);
    throw error;
  }
};

/**
 * Create a new responses view.
 *
 * @param responsesView - The responses view data to create.
 * @returns A promise that resolves to the created responses view.
 */
export const createResponsesView = async (
  responsesView: Omit<ResponsesView, "_id" | "id" | "createdAt" | "updatedAt">,
): Promise<ResponsesView> => {
  const { data } = await apiClient.post<ResponsesView>(responsesViewsBaseUrl, responsesView);

  return data;
};

/**
 * Update an existing responses view.
 *
 * @param responsesViewId - The numeric ID of the responses view to update.
 * @param updates - The updates to apply to the responses view.
 * @returns A promise that resolves to the updated responses view.
 */
export const updateResponsesView = async (
  responsesViewId: number,
  updates: Partial<Pick<ResponsesView, "name" | "isPublic" | "isDefault" | "config">>,
): Promise<ResponsesView> => {
  const { data } = await apiClient.put<ResponsesView>(
    `${responsesViewsBaseUrl}/${responsesViewId}`,
    updates,
  );

  return data;
};

/**
 * Delete a responses view.
 *
 * @param responsesViewId - The numeric ID of the responses view to delete.
 * @returns A promise that resolves to true if deletion was successful.
 */
export const deleteResponsesView = async (responsesViewId: number): Promise<ResponsesView> => {
  const { data } = await apiClient.delete<ResponsesView>(
    `${responsesViewsBaseUrl}/${responsesViewId}`,
  );

  return data;
};
