import apiClient from "./config";
import {
  ResponseForm,
  NewResponse,
  Filter,
  DeleteMultipleResponsesRequest,
  FieldTypeIds,
  ResponseFieldValue,
  FormField,
  FieldValue,
  LinkValue,
  LocationValue,
} from "../utils/interfaces";
import { ResponseCount } from "../types/interfaces/responses.types";
import { useCreate } from "../utils/useCreate";
import queryClient from "./queryClient";
import { useUpdate } from "../utils/useUpdate";
import { useFetch } from "../utils/useFetch";

/**
 * Fetch all responses with optional query parameters.
 *
 * @param filter - Optional filter parameters for querying responses.
 * @returns A promise that resolves to an array of responses.
 */
export const getResponses = async (filter?: Filter): Promise<ResponseForm[]> => {
  const params = {
    query: filter?.query ? JSON.stringify(filter.query) : undefined,
    sortBy: filter?.sortBy,
    orderBy: filter?.orderBy,
    pageSize: filter?.pageSize,
    pageNumber: filter?.pageNumber,
  };

  try {
    if (!filter?.form_id) {
      console.error("Form ID is required to fetch responses.");
      return [];
    }

    const response = await apiClient.get<ResponseForm[]>(
      `/responses/get-responses?form_id=${filter.form_id}`,
      { params },
    );

    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch responses:", error);
    throw error;
  }
};

/**
 * Fetch responses that have the search text in their data.
 *
 * @param filter - The filter options including form ID, search filters, pagination, and sorting.
 * @returns A promise that resolves to an array of responses.
 */
export const searchResponses = async (filter: Filter): Promise<ResponseForm[]> => {
  try {
    // Prepare the request body as expected by the updated API
    const requestBody = {
      form_id: filter.form_id,
      searchFilters: filter.searchFilters,
      sortBy: filter?.sortBy,
      orderBy: filter?.orderBy,
      pageSize: filter?.pageSize,
      pageNumber: filter?.pageNumber,
    };

    const response = await apiClient.post<ResponseForm[]>(`/responses/search`, requestBody, {
      signal: filter?.signal,
    });
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch responses:", error);
    throw error;
  }
};

/**
 * Get the number of responses for a given form ID, excluding those marked as deleted.
 *
 * @param form_id - The form id to get the number of responses for.
 * @returns A promise that resolves to the number of responses for the given form id.
 */
export const getResponsesCount = async (form_id: number): Promise<ResponseCount> => {
  try {
    const response = await apiClient.get<ResponseCount>(`/responses/count?form_id=${form_id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to create response:", error);
    throw error;
  }
};

export const getResponseWithFlatFields = (
  responseData: ResponseFieldValue[],
  fieldsMetaData: FormField[],
  deletedFiles?: ResponseFieldValue[],
): Record<string, FieldValue> => {
  const fieldsNameValueObj = responseData.reduce((acc, field) => {
    const fieldMetaData = fieldsMetaData.find((metaData) => metaData.uniqueId === field.uniqueId);
    if (fieldMetaData && fieldMetaData.name) {
      const fieldName = fieldMetaData.name;

      switch (fieldMetaData.typeId) {
        case FieldTypeIds.options:
          if (field.value) {
            acc[fieldName] = field.value.join(",");
          } else {
            acc[fieldName] = null;
          }
          break;
        case FieldTypeIds.link:
          const linkValue = field.value as LinkValue | null;
          if (linkValue && linkValue.linkTxt) {
            acc[fieldName] = linkValue.linkTxt;
          }
          break;
        case FieldTypeIds.location:
          const locationValue = field.value as LocationValue | null;
          if (locationValue && locationValue.x && locationValue.y) {
            acc[fieldName] = `${locationValue.x},${locationValue.y}`;
          }
          break;
        case FieldTypeIds.file:
          const deletedFilesForField = deletedFiles?.filter(
            (deletedFile) => deletedFile.uniqueId === field.uniqueId,
          );
          if (deletedFilesForField && deletedFilesForField.length > 0) {
            acc[fieldName] = { ...field.value, deletedFiles: deletedFilesForField[0].value };
          } else {
            acc[fieldName] = field.value;
          }
          break;
        default:
          acc[fieldName] = field.value;
      }
    }
    return acc;
  }, {});
  return fieldsNameValueObj;
};

/**
 * Delete a response.
 *
 * @param id - The ID of the response to delete.
 * @returns A promise that resolves to the deleted response.
 */
export const deleteResponse = async (formId: number, id: number): Promise<ResponseForm> => {
  try {
    const response = await apiClient.delete<ResponseForm>(`/responses/delete/${formId}/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to delete response:", error);
    throw error;
  }
};

/**
 * Delete multiple responses.
 *
 * @param deleteData - Data for the responses to delete.
 * @returns A promise that resolves to the number of deleted responses.
 */
export const deleteMultipleResponses = async (
  deleteData: DeleteMultipleResponsesRequest,
): Promise<number> => {
  try {
    const response = await apiClient.delete<number>("/responses/delete-multiple", {
      data: deleteData,
    });
    return response?.data;
  } catch (error) {
    console.error("Failed to delete multiple responses:", error);
    throw error;
  }
};

/**
 * Delete all responses of form.
 *
 * @param formId - formId of the form.
 * @returns A promise that resolves to the number of deleted responses.
 */
export const deleteAllResponses = async (formId: number): Promise<number> => {
  try {
    const response = await apiClient.delete<number>("/responses/delete-all-form-responses", {
      data: { form_id: formId },
    });
    return response?.data;
  } catch (error) {
    console.error("Failed to delete all responses of form: ", formId, error);
    throw error;
  }
};

export const createResponsesFromFile = async (formId: number, file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<any>(
      `/responses/create-from-file?form_id=${formId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response?.data;
  } catch (error) {
    console.error("Failed to create responses from file:", error);
    throw error;
  }
};

/**
 * Restore a deleted response.
 *
 * @param formId - The ID of the form.
 * @param id - The ID of the response to restore.
 * @returns A promise that resolves to the restored response.
 */
export const restoreResponse = async (formId: number, id: number): Promise<ResponseForm> => {
  try {
    const response = await apiClient.put<ResponseForm>(`/responses/restore/${formId}/${id}`);
    return response?.data;
  } catch (error) {
    console.error("Failed to restore response:", error);
    throw error;
  }
};

/**
 * Fetch all deleted responses based on the provided filter.
 *
 * @param filter - The filter options including pagination and query parameters.
 * @returns A promise that resolves to an array of deleted responses.
 */
export const getAllDeletedResponses = async (filter: Filter): Promise<ResponseForm[]> => {
  try {
    const response = await apiClient.post<ResponseForm[]>("/responses/get-deleted-responses", {
      pageSize: filter?.pageSize,
      pageNumber: filter?.pageNumber,
      query: filter?.query || {},
      isDeletedForm: filter?.query?.isDeletedForm || false,
    });

    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch deleted responses:", error);
    throw error;
  }
};

// Gali's changes
// ========================

export const useGetResponseById = (formId?: number, responseId?: number) => {
  return useFetch<{ form_id: number; id: number }, ResponseForm>({
    queryKey: (p) => ["response", p?.form_id, p?.id] as const,
    endpoint: "/responses/get-by-id",
    params: formId && responseId ? { form_id: formId, id: responseId } : undefined,
    queryOptions: {
      enabled: Boolean(formId) && Boolean(responseId),
    },
  });
};

export const useCreateResponse = () => {
  return useCreate<NewResponse | NewResponse[], ResponseForm | ResponseForm[]>({
    endpoint: "/responses/create",
    mutationKey: ["create-response"],
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["responses"] });
      },
      onError: (error) => {
        console.error("Failed to create response:", error);
      },
    },
  });
};

export const useUpdateResponse = (formId: number, id: number) => {
  return useUpdate<Partial<ResponseForm>, ResponseForm>({
    endpoint: `/responses/edit/${formId}/${id}`,
    mutationKey: ["update-response", formId, id],
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["responses"] });
      },
      onError: (error) => {
        console.error("Failed to update response:", error);
      },
    },
  });
};
