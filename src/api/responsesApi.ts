import { useMemo } from "react";
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
import { CreateResponseDto, ResponseDto, FormDto } from "../types/shared";
import { z } from "zod";
import { GetResponsesQuerySchema } from "formula-gear/dist/validators/responses/index";
import { SortDirection } from "formula-gear";

const stringifyQuery = (query: any): string => {
  if (query && typeof query === "object") return JSON.stringify(query);
  return query || "";
};

/**
 * Fetch all responses for a form with optional query parameters.
 *
 * @param formId - The ID of the form.
 * @param filter - Optional filter parameters for querying responses.
 * @returns A promise that resolves to an array of responses or a paginated response object.
 */
export const getResponses = async (formId: number, filter?: Filter): Promise<any> => {
  const params: any = {
    limit: filter?.pageSize ?? 25,
    search: stringifyQuery(filter?.query),
    sortBy: filter?.sortBy,
    sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
    before: filter?.before,
    after: filter?.after,
    sortBy: ""
  };
  try {
    const response = await apiClient.get(`/forms/${formId}/responses`, { params });
    return response?.data ?? [];
  } catch (error) {
    console.error("Failed to fetch responses:", error);
    throw error;
  }
};

/**
 * Fetch a specific response by ID.
 *
 * @param formId - The ID of the form.
 * @param responseId - The ID of the response.
 * @returns A promise that resolves to the response data.
 */
export const getResponseById = async (formId: number, responseId: string): Promise<ResponseDto> => {
  try {
    const response = await apiClient.get<ResponseDto>(`/forms/${formId}/responses/${responseId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch response:", error);
    throw error;
  }
};

/**
 * Create a new response for a form.
 *
 * @param formId - The ID of the form.
 * @param responseData - The data for the new response.
 * @returns A promise that resolves to the created response.
 */
export const createResponse = async (
  formId: number,
  responseData: CreateResponseDto,
): Promise<ResponseDto> => {
  try {
    const response = await apiClient.post<ResponseDto>(`/forms/${formId}/responses`, responseData);
    return response.data;
  } catch (error) {
    console.error("Failed to create response:", error);
    throw error;
  }
};

/**
 * Soft delete multiple responses.
 *
 * @param formId - The ID of the form.
 * @param responseIds - The IDs of the responses to delete.
 * @returns A promise that resolves to the result of the deletion.
 */
export const softDeleteResponses = async (formId: number, responseIds: string[]): Promise<void> => {
  try {
    await apiClient.post(`/forms/${formId}/responses/soft-delete`, { responseIds });
  } catch (error) {
    console.error("Failed to soft-delete responses:", error);
    throw error;
  }
};

/**
 * Restore multiple soft-deleted responses.
 *
 * @param formId - The ID of the form.
 * @param responseIds - The IDs of the responses to restore.
 * @returns A promise that resolves to the result of the restoration.
 */
export const restoreResponses = async (formId: number, responseIds: string[]): Promise<void> => {
  try {
    await apiClient.post(`/forms/${formId}/responses/restore`, { responseIds });
  } catch (error) {
    console.error("Failed to restore responses:", error);
    throw error;
  }
};

/**
 * Fetch responses that have the search text in their data.
 */
export const searchResponses = async (filter: Filter): Promise<any> => {
  try {
    const formId = filter?.form_id;
    if (!formId) throw new Error("form_id is required for searchResponses");

    const params: any = {
      limit: filter?.pageSize ?? 25,
      search: stringifyQuery(filter?.query),
      sortBy: filter?.sortBy,
      sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
      sortBy: ""
    };

    const response = await apiClient.get(`/forms/${formId}/responses`, { params });
    return response?.data || [];
  } catch (error) {
    console.error("Failed to search responses:", error);
    throw error;
  }
};

/**
 * Delete a single response.
 */
export const deleteResponse = async (formId: number, responseId: string): Promise<void> => {
  return softDeleteResponses(formId, [responseId]);
};

/**
 * Fetch all deleted responses based on the provided filter.
 */
export const getAllDeletedResponses = async (filter: Filter): Promise<any> => {
  try {
    const formId = filter?.form_id;
    if (!formId) throw new Error("form_id is required for getAllDeletedResponses");

    const params: any = {
      limit: filter?.pageSize ?? 25,
      search: stringifyQuery(filter?.query),
      sortBy: filter?.sortBy,
      sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
      deleted: true,
    };

    const response = await apiClient.get(`/forms/${formId}/responses`, { params });
    return response?.data || [];
  } catch (error) {
    console.error("Failed to fetch deleted responses:", error);
    throw error;
  }
};

/**
 * Restore a single soft-deleted response.
 */
export const restoreResponse = async (formId: number, responseId: string): Promise<void> => {
  return restoreResponses(formId, [responseId]);
};

// Legacy/Utility methods
// ============================================================

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
            acc[fieldName] = Array.isArray(field.value) ? field.value.join(",") : field.value;
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

// Hooks
// ============================================================

export const useGetResponsesRows = (
  formId: string,
  params: any,
) => {
  const safeParams = useMemo(() => ({
    ...params,
    search: stringifyQuery(params.search),
  }), [params]);

  return useFetch<typeof safeParams, any>({
    endpoint: `/forms/${formId}/responses`,
    queryKey: () => ["responses", formId, safeParams],
    params: safeParams,
    queryOptions: {
      enabled: !!formId,
    },
  });
};

export const useGetResponses = ({ filter }: { filter?: Filter }) => {
  const formId = filter?.form_id;
  const params: any = useMemo(
    () => ({
      limit: filter?.pageSize ?? 25,
      search: stringifyQuery(filter?.query),
      sortBy: filter?.sortBy,
      sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
      before: filter?.before,
      after: filter?.after,
      sortBy: ""
    }),
    [filter],
  );

  return useFetch<typeof params | undefined, any>({
    endpoint: `/forms/${formId}/responses`,
    queryKey: () => ["responses", filter],
    params: params,
    queryOptions: { enabled: !!formId },
  });
};

export const useCreateResponse = (formId?: number) => {
  return useMutation({
    mutationFn: (responseData: CreateResponseDto) => {
      const targetFormId = formId || (responseData as any).form_id;
      if (!targetFormId) throw new Error("formId is required for createResponse");
      return createResponse(targetFormId, responseData);
    },
    onSuccess: (_, variables) => {
      const targetFormId = formId || (variables as any).form_id;
      queryClient.invalidateQueries({ queryKey: ["responses", String(targetFormId)] });
    },
  });
};

export const useUpdateResponse = (formId?: number, responseId?: string) => {
  return useMutation({
    mutationFn: (responseData: Partial<ResponseDto>) => {
      if (!formId || !responseId) throw new Error("formId and responseId are required");
      return apiClient.patch<ResponseDto>(`/forms/${formId}/responses/${responseId}`, responseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", String(formId)] });
    },
  });
};

export const useBatchUpdateResponses = ({ formId }: { formId: number }) => {
  return useMutation({
    mutationFn: async (
      responses: Array<{ id: string | number; responseData: Partial<ResponseDto> }>,
    ) => {
      const promises = responses.map(({ id, responseData }) =>
        apiClient.patch<ResponseDto>(`/forms/${formId}/responses/${id}`, responseData),
      );
      const results = await Promise.all(promises);
      return results.map((r) => r.data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", String(formId)] });
    },
  });
};

export const useSoftDeleteResponses = (formId: number) => {
  return useMutation({
    mutationFn: (responseIds: string[]) => softDeleteResponses(formId, responseIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", String(formId)] });
    },
  });
};

export const useRestoreResponses = (formId: number) => {
  return useMutation({
    mutationFn: (responseIds: string[]) => restoreResponses(formId, responseIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", String(formId)] });
    },
  });
};

export const useDeleteAllFormsResponses = ({ formId }: { formId: string }) => {
  return useMutation({
    mutationFn: async () => {
      // If there's no explicit "delete all" endpoint, we might need to fetch all and delete,
      // but let's assume Engine might add it or we use a filter.
      // For now, let's keep the hook signature but it might need implementation.
      console.warn("useDeleteAllFormsResponses not fully implemented in Engine yet");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", formId] });
    },
  });
};

export const useImportResponsesFromFile = ({ formId }: { formId: string }) => {
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await apiClient.post(`/forms/${formId}/responses/import`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses", formId] });
    },
  });
};

/**
 * Fetch rows for a form with optional query parameters.
 *
 * @param params - Filter and optional form for mapping.
 * @returns A promise that resolves to an array of rows.
 */
export const getResponsesRows = async ({
  filter,
  form,
}: {
  filter?: Filter;
  form?: FormDto;
}): Promise<Row[]> => {
  try {
    const formId = filter?.form_id || form?.id;
    if (!formId) {
      console.error("Form ID is required to fetch rows.");
      return [];
    }
    const params: any = {
      limit: filter?.pageSize ?? 25,
      search: stringifyQuery(filter?.query),
      sortBy: filter?.sortBy,
      sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
      before: filter?.before,
      after: filter?.after,
      sortBy: ""
    };
    const response = await apiClient.get(`/forms/${formId}/responses`, {
      params,
    });

    const rawData = response?.data;
    const responses: any[] = Array.isArray(rawData)
      ? rawData
      : (rawData as any)?.edges?.map((e: any) => e.node) || (rawData as any)?.responses || [];

    const fieldIdToDisplayName = new Map<string, string>();
    if (form) {
      (form.sections ?? []).forEach((section) => {
        (section.fields ?? []).forEach((field) => {
          fieldIdToDisplayName.set(field.id, field.displayName);
        });
      });
    }

    const rows: Row[] = responses.map((node: any) => {
      const row: Row = {
        id: node.id,
        edited: node.updated_at || node.updatedAt,
        editedByName: node.updated_by?.name || node.updatedBy?.name,
        created: node.created_at || node.createdAt,
        createdByName: node.created_by?.name || node.createdBy?.name,
        index: node.index,
        form_id: node.form_id || node.formId,
      };

      const fieldValues = node.fieldValues || node.field_values || node.data || [];
      fieldValues.forEach((fv: any) => {
        const fieldId = fv.field_id || fv.fieldId;
        const displayName = fieldIdToDisplayName.get(fieldId);
        if (displayName) {
          row[displayName] = fv.value;
        } else {
          row[fieldId] = fv.value;
        }
      });

      return row;
    });

    return rows;
  } catch (error) {
    console.error("Failed to fetch rows:", error);
    throw error;
  }
};
