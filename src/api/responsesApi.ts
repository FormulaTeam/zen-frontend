import apiClient from "./config";
import {
  FieldTypeIds,
  FieldValue,
  Filter,
  FormField,
  LinkValue,
  LocationValue,
  NewResponse,
  ResponseFieldValue,
  ResponseForm,
  Row,
} from "../utils/interfaces";
import { ResponseCount } from "../types/interfaces/responses.types";
import { useDelete } from "../utils/useDelete";
import queryClient from "./queryClient";
import { useCreate } from "../utils/useCreate";
import { ExcelImportResult } from "../types/interfaces/forms.types";
import { useFetch } from "../utils/useFetch";
import { useMutation } from "@tanstack/react-query";
import { useUpdate } from "../utils/useUpdate";
import { CreateResponseDto, ResponseDto, UpdateResponseDto } from "../types/shared";

/**
 * Fetch all responses with optional query parameters.
 *
 * @param filter - Optional filter parameters for querying responses.
 * @returns A promise that resolves to an array of responses.
 */
export const getResponses = async (filter?: Filter): Promise<ResponseDto[]> => {
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
    const response = await apiClient.get<ResponseDto[]>(
      `/responses/get-responses?form_id=${filter?.form_id}`,
      { params },
    );
    return response?.data ?? [];
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
    const fieldMetaData = fieldsMetaData.find((metaData) => metaData.uniqueId === field.field_id);
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
            (deletedFile) => deletedFile.field_id === field.field_id,
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
export const deleteResponse = async (formId: number, id: string): Promise<ResponseDto> => {
  try {
    const response = await apiClient.delete<ResponseDto>(`/responses/delete/${formId}/${id}`);
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
export interface DeleteMultipleResponsesRequest {
  form_id: number;
  response_ids: string[];
}

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
    const body = {
      pageSize: filter?.pageSize,
      pageNumber: filter?.pageNumber,
      query: filter?.query || {},
      isDeletedForm: Boolean(filter?.query?.isDeletedForm || filter?.isDeletedForm),
    };

    const response = await apiClient.post<ResponseForm[]>("/responses/get-deleted-responses", body);

    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch deleted responses:", error);
    throw error;
  }
};

// Yahel's changes - above is the original file - below are the changes
// ============================================================

export const useGetResponses = ({ filter }: { filter?: Filter }) => {
  return useFetch<Filter, ResponseForm[]>({
    endpoint: `/responses/get-responses`,
    queryKey: () => ["responses", filter],
    params: filter,
    // queryOptions: { enabled: !!filter?.form_id },
  });
};

export const useGetResponsesRows = ({ filter }: { filter?: Filter }) => {
  return useFetch<Filter, Row[]>({
    endpoint: `/responses/get-rows`,
    queryKey: () => ["rows", filter],
    params: filter,
    queryOptions: { enabled: !!filter?.form_id },
  });
};

export const useDeleteAllFormsResponses = ({ formId }: { formId: string }) => {
  return useDelete<{ form_id: string }, void>({
    endpoint: `/responses/delete-all-form-responses`,
    mutationKey: ["delete-all-form-responses", formId],
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [formId] });
        queryClient.invalidateQueries({ queryKey: ["responses"] });
      },
    },
  });
};

export const useImportResponsesFromFile = ({ formId }: { formId: string }) => {
  return useCreate<FormData, ExcelImportResult>({
    endpoint: `/responses/create-from-file?form_id=${formId}`,
    mutationKey: ["import-responses-from-file", formId],
    axiosConfig: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [formId] });
        queryClient.invalidateQueries({ queryKey: ["responses"] });
      },
    },
  });
};

export const useBatchUpdateResponses = ({ formId }: { formId: number }) => {
  return useMutation({
    mutationFn: async (responses: Array<{ id: number; responseData: Partial<ResponseForm> }>) => {
      const responsesPromises = responses.map(({ id, responseData }) => {
        return apiClient.put<ResponseForm>(`/responses/edit/${formId}/${id}`, responseData);
      });
      const responsesResults = await Promise.all(responsesPromises);
      return responsesResults.map((response) => response.data);
    },
    mutationKey: ["batch-update-responses", formId],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses"] });
      queryClient.invalidateQueries({ queryKey: ["rows"] });
    },
  });
};

// Gali's changes
// ========================
export const useCreateResponsesFromFile = (formId: string) => {
  return useCreate<FormData, any>({
    endpoint: `/responses/create-from-file?form_id=${formId}`,
    mutationKey: ["create-responses-from-file", formId],
    axiosConfig: {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["responses"] });
      },
      onError: (error) => {
        console.error("Failed to create responses from file:", error);
      },
    },
  });
};

export const useCreateResponse = (formId: number) => {
  return useCreate<CreateResponseDto, ResponseDto>({
    endpoint: `/forms/${formId}/responses`,
    mutationKey: ["create-response", formId],
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["responses", formId] });
      },
      onError: (error) => {
        console.error("Failed to create response:", error);
      },
    },
  });
};

export const useUpdateResponse = (formId?: number, id?: string) => {
  return useUpdate<UpdateResponseDto, ResponseDto>({
    endpoint: `/forms/${formId}/responses/${id}`,
    mutationKey: ["update-response", formId, id],
    mutationOptions: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["responses", formId] });
      },
      onError: (error) => {
        console.error("Failed to update response:", error);
      },
    },
  });
};

/**
 * Fetch rows for a form with optional query parameters.
 *
 * @param filter - Optional filter parameters for querying rows.
 * @returns A promise that resolves to an array of rows.
 */
export const getResponsesRows = async ({ filter }: { filter?: Filter }): Promise<Row[]> => {
  try {
    if (!filter?.form_id) {
      console.error("Form ID is required to fetch rows.");
      return [];
    }
    const params = {
      query: filter?.query ? JSON.stringify(filter.query) : undefined,
      sortBy: filter?.sortBy,
      orderBy: filter?.orderBy,
      pageSize: filter?.pageSize,
      pageNumber: filter?.pageNumber,
    };
    const response = await apiClient.get<Row[]>(`/responses/get-rows?form_id=${filter.form_id}`, {
      params,
    });
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch rows:", error);
    throw error;
  }
};
