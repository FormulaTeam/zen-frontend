import { useQuery, useMutation } from "@tanstack/react-query";
import apiClient from "./config";
import { z } from "zod";
import { FormRolesSchema, FormRolesQuerySchema } from "formula-gear";
import queryClient from "./queryClient";

export type FormRoles = z.infer<typeof FormRolesSchema>;
export type FormRolesQuery = z.infer<typeof FormRolesQuerySchema>;

/**
 * Fetch the roles for a specific form.
 *
 * @param formId - The ID of the form.
 * @returns A promise that resolves to the form roles.
 */
export const getFormRoles = async (formId: number): Promise<FormRoles> => {
  const response = await apiClient.get<FormRoles>(`/forms/${formId}/roles`);
  return response.data;
};

/**
 * Upsert roles for a specific form.
 *
 * @param formId - The ID of the form.
 * @param roles - The roles data to upsert.
 * @returns A promise that resolves to the updated form roles.
 */
export const upsertFormRoles = async (formId: number, roles: FormRolesQuery): Promise<FormRoles> => {
  const response = await apiClient.post<FormRoles>(`/forms/${formId}/roles`, roles);
  return response.data;
};

export const useGetFormRoles = (formId: number | string | undefined, enabled = true) => {
  const numericFormId = Number(formId);
  return useQuery<FormRoles>({
    queryKey: ["form-roles", numericFormId],
    queryFn: () => getFormRoles(numericFormId),
    enabled: enabled && !!formId && !isNaN(numericFormId),
  });
};

export const useUpsertFormRoles = (formId: number) => {
  return useMutation({
    mutationFn: (roles: FormRolesQuery) => upsertFormRoles(formId, roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["form-roles", formId] });
    },
  });
};