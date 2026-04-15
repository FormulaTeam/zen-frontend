import apiClient from "./config";
import { z } from "zod";
import { CreateFormSchema } from "formula-gear";
import { Filter, Form, MetroReturnedData, NewForm, UpdateFormPayload, User } from "../utils/interfaces";
import { UserData } from "../types/interfaces/forms.types";
import { useFetch } from "../utils/useFetch";
import { UseQueryOptions, UseQueryResult, useMutation } from "@tanstack/react-query";
import { useDelete } from "../utils/useDelete";
import { useCreate } from "../utils/useCreate";
import queryClient from "./queryClient";
import { FormDto } from "../types/shared";

/**
 * Fetch all forms with optional query parameters.
 *
 * @param filter - Optional filter parameters for querying forms.
 * @returns A promise that resolves to an array of forms.
 */
export const getForms = async (filter?: Filter): Promise<FormDto[]> => {
  const params = {
    query:
      filter?.query && typeof filter.query !== "string"
        ? JSON.stringify(filter.query)
        : filter?.query,
    sortBy: filter?.sortBy,
    orderBy: filter?.orderBy,
    pageSize: filter?.pageSize,
    pageNumber: filter?.pageNumber,
  };

  try {
    const response = await apiClient.get<FormDto[]>("/forms", { params, signal: filter?.signal });
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch forms:", error);
    throw error;
  }
};

/**
 * Fetch a specific form by ID.
 *
 * @param formId - The ID of the form.
 * @returns A promise that resolves to the form data.
 */
export const getFormById = async (formId?: number): Promise<FormDto | null> => {
  if (!formId) {
    return null;
  }
  try {
    const response = await apiClient.get<FormDto>(`/forms/${formId}`);
    return response?.data ?? null;
  } catch (error) {
    console.error("getFormById error:", error);
    return null;
  }
};

/**
 * Fetch linkable forms for a given form ID.
 *
 * @param formId - The ID of the form.
 * @returns A promise that resolves to an array of linkable forms.
 */
export const getLinkableForms = async (formId: number): Promise<FormDto[]> => {
  try {
    const response = await apiClient.get<FormDto[]>(`/forms/${formId}/linkable`);
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch linkable forms:", error);
    throw error;
  }
};

/**
 * Restores a soft-deleted form.
 *
 * @param id - The ID of the form to restore.
 * @returns A promise that resolves to the restored form.
 */
export const restoreForm = async (id: number): Promise<FormDto> => {
  try {
    const response = await apiClient.post<FormDto>(`/forms/${id}/restore`);
    return response?.data;
  } catch (error) {
    console.error("Failed to restore form:", error);
    throw error;
  }
};

/**
 * Soft deletes a form.
 *
 * @param id - The ID of the form to delete.
 * @returns A promise that resolves to the deleted form.
 */
export const deleteForm = async (id: number): Promise<FormDto> => {
  try {
    const response = await apiClient.post<FormDto>(`/forms/${id}/soft-delete`);
    return response?.data;
  } catch (error) {
    console.error("Failed to delete form:", error);
    throw error;
  }
};

/**
 * Update an existing form with given users.
 *
 * @param id - The ID of the form to update.
 * @param usersForShare - The users to share the form with.
 * @returns A promise that resolves to the updated form.
 */
export const shareForm = async (id: number, usersForShare: User[]): Promise<FormDto> => {
  try {
    const response = await apiClient.patch<FormDto>(`/forms/${id}`, { users: usersForShare });
    return response?.data;
  } catch (error) {
    console.error("Failed to share form:", error);
    throw error;
  }
};

/**
 * Update an existing form with metro data.
 *
 * @param id - The ID of the form to update.
 * @param metroObj - The metroObj to update form with.
 * @returns A promise that resolves to the updated form.
 */
export const updateMetroLbsInForm = async (id: number, metroObj: any): Promise<FormDto> => {
  try {
    const response = await apiClient.patch<FormDto>(`/forms/${id}`, metroObj);
    return response?.data;
  } catch (error) {
    console.error("Failed to update metro labels in form:", error);
    throw error;
  }
};

/**
 * Push the responses of a specific form to Metro.
 */
export const sendToMetroFormResponses = async (id: number): Promise<MetroReturnedData> => {
  try {
    const response = await apiClient.put<MetroReturnedData>(`/sync/send-responses/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to send form and its responses to Metro:", error);
    throw error;
  }
};

/**
 * Upsert source to Metro.
 */
export const upsertSourceToMetro = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.post<any>(`/sync/upsert-source/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to upsert source to Metro:", error);
    throw error;
  }
};

/**
 * Edit source in Metro.
 */
export const editSourceToMetro = async (id: number): Promise<any> => {
  try {
    const response = await apiClient.post<any>(`/sync/edit-source/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to edit source to Metro:", error);
    throw error;
  }
};

// Gali's edits
// ============================================================

export type CreateFormDto = z.infer<typeof CreateFormSchema>;

export const useCreateForm = () => {
  return useCreate<CreateFormDto, FormDto>({
    endpoint: "/forms",
    mutationKey: ["create-form"],
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["forms"] });
      },
      onError: (error) => {
        console.error("Failed to create form:", error);
      },
    },
  });
};

export const useUpdateForm = () => {
  return useMutation({
    mutationFn: async ({ id, formData, payload, isUpdateMetro }: { id: number; formData?: Record<string, unknown>; payload?: Partial<CreateFormDto>; isUpdateMetro?: boolean }) => {
      const body = { ...(payload || formData), isUpdateMetro };
      const response = await apiClient.patch<FormDto>(`/forms/${id}`, body);
      return response.data;
    },
    mutationKey: ["update-form"],
    onSuccess: (data: FormDto) => {
      queryClient.invalidateQueries({ queryKey: [data.id.toString()] });
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
    onError: (error) => {
      console.error("Failed to update form:", error);
    },
  });
};

// Yahel's edits
// ============================================================

export const useGetForm = ({
  formId,
  config,
}: {
  formId?: string;
  config?: Omit<
    UseQueryOptions<FormDto | null, Error, FormDto | null, readonly unknown[]>,
    "queryKey" | "queryFn"
  >;
}): UseQueryResult<FormDto | null> => {
  return useFetch<undefined, FormDto | null>({
    endpoint: `/forms/${formId}`,
    queryKey: () => [formId],
    queryOptions: {
      enabled: !!formId,
      ...config,
    },
  });
};

export const useDeleteForm = ({ id }: { id: string }) => {
  return useMutation({
    mutationFn: () => deleteForm(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
};

export const useRestoreForm = ({ id }: { id: string }) => {
  return useMutation({
    mutationFn: () => restoreForm(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forms"] });
    },
  });
};

