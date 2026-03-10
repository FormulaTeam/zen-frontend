import { useQuery } from "@tanstack/react-query";
import apiClient from "./config";
import { z } from "zod";
import { FormRolesSchema } from "formula-gear";

export type FormRoles = z.infer<typeof FormRolesSchema>;

export const getFormRoles = async (formId: number): Promise<FormRoles> => {
  const response = await apiClient.get<FormRoles>(`/forms/${formId}/roles`);
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
