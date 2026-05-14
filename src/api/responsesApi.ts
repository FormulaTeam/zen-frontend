import { keepPreviousData, useMutation, useInfiniteQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { responsesScopeOption, SortDirection } from "formula-gear";

import apiClient from "./config";
import queryClient from "./queryClient";
import { useFetch } from "../utils/useFetch";
import {
  FieldTypeIds,
  FieldValue,
  Filter,
  FormField,
  LinkValue,
  LocationValue,
  ResponseFieldValue,
  Row,
} from "../utils/interfaces";
import { BulkUpdateResponsesDto, CreateResponseDto, FormDto, ResponseDto } from "../types/shared";

const FIELD_COLUMN_PREFIX = "field:";

export const getFieldColumnKey = (fieldId: string): string => `${FIELD_COLUMN_PREFIX}${fieldId}`;

const stringifyQuery = (query: any): string => {
  if (query && typeof query === "object") return JSON.stringify(query);

  return query || "";
};

type SoftDeleteResponsesDto = {
  scope?: (typeof responsesScopeOption)[keyof typeof responsesScopeOption];
  responsesIds?: string[];
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
    sortBy: filter?.sortBy ?? "meta:index",
    sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
    before: filter?.before,
    after: filter?.after,
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
 * Create responses for a form.
 *
 * @param formId - The ID of the form.
 * @param responseData - An array of data for the new responses.
 * @returns A promise that resolves to an array of created responses.
 */
export const createResponse = async (
  formId: number,
  responseData: CreateResponseDto[],
  hiddenFieldIds?: string[],
): Promise<ResponseDto[]> => {
  try {
    const params = hiddenFieldIds?.length ? { hiddenFieldIds: hiddenFieldIds.join(',') } : undefined;
    const response = await apiClient.post<ResponseDto[]>(
      `/forms/${formId}/responses`,
      responseData,
      { params },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to create responses:", error);
    throw error;
  }
};

/**
 * Update responses.
 *
 * Always uses the bulk update endpoint, even for a single response.
 */
export const updateResponses = async (
  formId: number,
  dto: BulkUpdateResponsesDto,
  hiddenFieldIds?: string[],
): Promise<ResponseDto[]> => {
  try {
    const params = hiddenFieldIds?.length ? { hiddenFieldIds: hiddenFieldIds.join(',') } : undefined;
    const response = await apiClient.put<ResponseDto[]>(
      `/forms/${formId}/responses`,
      dto,
      { params },
    );
    return response.data;
  } catch (error) {
    console.error("Failed to update responses:", error);
    throw error;
  }
};

/**
 * Soft delete responses by IDs or by scope.
 */
export const softDeleteResponses = async (
  formId: number,
  dto: SoftDeleteResponsesDto,
): Promise<void> => {
  try {
    await apiClient.post(`/forms/${formId}/responses/soft-delete`, dto);
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
      sortBy: filter?.sortBy ?? "meta:index",
      sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
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
  return softDeleteResponses(formId, { responsesIds: [responseId] });
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

        case FieldTypeIds.link: {
          const linkValue = field.value as LinkValue | null;
          if (linkValue && linkValue.linkTxt) {
            acc[fieldName] = linkValue.linkTxt;
          }
          break;
        }

        case FieldTypeIds.location: {
          const locationValue = field.value as LocationValue | null;
          if (locationValue && locationValue.x && locationValue.y) {
            acc[fieldName] = `${locationValue.x},${locationValue.y}`;
          }
          break;
        }

        case FieldTypeIds.file: {
          const deletedFilesForField = deletedFiles?.filter(
            (deletedFile) => deletedFile.field_id === field.field_id,
          );

          if (deletedFilesForField && deletedFilesForField.length > 0) {
            acc[fieldName] = { ...field.value, deletedFiles: deletedFilesForField[0].value };
          } else {
            acc[fieldName] = field.value;
          }

          break;
        }

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

export const useGetResponsesRows = (formId: string, params: any) => {
  const safeParams = useMemo(
    () => ({
      ...params,
      search: stringifyQuery(params.search),
    }),
    [params],
  );

  return useFetch<typeof safeParams, any>({
    endpoint: `/forms/${formId}/responses`,
    queryKey: () => ["responses", formId, safeParams],
    params: safeParams,
    queryOptions: {
      enabled: !!formId,
      placeholderData: keepPreviousData,
    },
  });
};

export const useGetResponses = ({ filter }: { filter?: Filter }) => {
  const formId = filter?.form_id;
  const params: any = useMemo(
    () => ({
      limit: filter?.pageSize ?? 25,
      search: stringifyQuery(filter?.query),
      sortBy: filter?.sortBy ?? "meta:index",
      sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
      before: filter?.before,
      after: filter?.after,
    }),
    [filter],
  );

  return useFetch<typeof params | undefined, any>({
    endpoint: `/forms/${formId}/responses`,
    queryKey: () => ["responses", filter],
    params,
    queryOptions: { enabled: !!formId },
  });
};

export const useCreateResponse = (formId?: number, hiddenFieldIds?: string[]) => {
  return useMutation({
    mutationFn: (responseData: CreateResponseDto | CreateResponseDto[]) => {
      const dataArray = Array.isArray(responseData) ? responseData : [responseData];
      const targetFormId = formId || (dataArray[0] as any).form_id;
      if (!targetFormId) throw new Error("formId is required for createResponse");

      return createResponse(targetFormId, dataArray, hiddenFieldIds);
    },
    onSuccess: (_, variables) => {
      const dataArray = Array.isArray(variables) ? variables : [variables];
      const targetFormId = formId || (dataArray[0] as any).form_id;
      const targetFormIdStr = String(targetFormId);

      queryClient.invalidateQueries({ queryKey: ["responses", targetFormIdStr] });
      queryClient.invalidateQueries({ queryKey: [targetFormIdStr] });
    },
  });
};

/**
 * Update one or more responses.
 *
 * For a single response, call:
 * mutate({
 *   responses: [{ responseId, fieldValues }]
 * })
 *
 * For multiple responses, pass multiple items in the responses array.
 */
export const useUpdateResponses = (formId?: number, hiddenFieldIds?: string[]) => {
  return useMutation({
    mutationFn: (dto: BulkUpdateResponsesDto) => {
      if (!formId) throw new Error("formId is required for updateResponses");

      return updateResponses(formId, dto, hiddenFieldIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["responses"] });

      if (formId) {
        queryClient.invalidateQueries({ queryKey: ["responses", String(formId)] });
        queryClient.invalidateQueries({ queryKey: [String(formId)] });
      }
    },
    onError: (error) => {
      console.error("Failed to update responses:", error);
    },
  });
};

export const useSoftDeleteResponses = (formId: number | string) => {
  return useMutation({
    mutationFn: (dto: SoftDeleteResponsesDto) => softDeleteResponses(Number(formId), dto),
    onSuccess: () => {
      const targetFormIdStr = String(formId);

      queryClient.invalidateQueries({ queryKey: ["responses", targetFormIdStr] });
      queryClient.invalidateQueries({ queryKey: [targetFormIdStr] });
    },
  });
};

export const useRestoreResponses = (formId: number) => {
  return useMutation({
    mutationFn: (responseIds: string[]) => restoreResponses(formId, responseIds),
    onSuccess: () => {
      const targetFormIdStr = String(formId);

      queryClient.invalidateQueries({ queryKey: ["responses", targetFormIdStr] });
      queryClient.invalidateQueries({ queryKey: [targetFormIdStr] });
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
      const targetFormIdStr = String(formId);

      queryClient.invalidateQueries({ queryKey: ["responses", targetFormIdStr] });
      queryClient.invalidateQueries({ queryKey: [targetFormIdStr] });
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
      sortBy: filter?.sortBy ?? "meta:index",
      sortDirection: (filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc") as SortDirection,
      before: filter?.before,
      after: filter?.after,
    };

    const response = await apiClient.get(`/forms/${formId}/responses`, {
      params,
    });

    const rawData = response?.data;
    const responses: any[] = Array.isArray(rawData)
      ? rawData
      : (rawData as any)?.edges?.map((edge: any) => edge.node) || (rawData as any)?.responses || [];

    const rows: Row[] = responses.map((node: any) => {
      const row: Row = {
        id: node.id,
        edited: node.updated_at || node.updatedAt,
        editedByName: node.updated_by?.name || node.updatedBy?.name,
        created: node.created_at || node.createdAt,
        createdByName: node.created_by?.name || node.createdBy?.name,
        createdByUpn: node.created_by?.upn || node.createdBy?.upn,
        index: node.index,
        form_id: node.form_id || node.formId,
      };

      const fieldValues = node.fieldValues || node.field_values || node.data || [];

      fieldValues.forEach((fieldValue: any) => {
        const fieldId = fieldValue.field_id || fieldValue.fieldId;

        if (!fieldId) return;

        row[getFieldColumnKey(String(fieldId))] = fieldValue.value;
      });

      return row;
    });

    return rows;
  } catch (error) {
    console.error("Failed to fetch rows:", error);
    throw error;
  }
};

export const OPTIONS_PAGINATION_LIMIT = 10;

export const getFieldValues = async (
  formId: number,
  fieldId: string,
  params?: { limit?: number; offset?: number; search?: string },
): Promise<{ total: number; limit: number; offset: number; data: { responseId: string; value: unknown }[] }> => {
  try {
    const response = await apiClient.get(`/forms/${formId}/responses/fields/${fieldId}`, {
      params: {
        limit: params?.limit ?? 50,
        offset: params?.offset ?? 0,
        search: params?.search ?? "",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch field values:", error);
    throw error;
  }
};

export const useGetInfiniteFieldValues = (
  formId?: number,
  fieldId?: string,
  search: string = ""
) => {
  return useInfiniteQuery({
    queryKey: ["fieldValues", formId, fieldId, search],
    queryFn: async ({ pageParam = 0 }) => {
      if (!formId || !fieldId) {
        throw new Error("Missing formId or fieldId");
      }
      return getFieldValues(formId, fieldId, {
        limit: OPTIONS_PAGINATION_LIMIT,
        offset: pageParam,
        search,
      });
    },
    enabled: !!formId && !!fieldId,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.data.length < lastPage.limit) {
        return undefined;
      }
      return lastPage.offset + lastPage.limit;
    },
  });
};