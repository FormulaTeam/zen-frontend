import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "./config";
import { FormRoleDto } from "../types/shared";

interface UpsertFormRolesDto {
  userRoles: { userId: number; role: number }[];
  publicRole?: number | null;
}

const getFormRoles = async (formId: number): Promise<FormRoleDto> => {
  const response = await apiClient.get<FormRoleDto>(`/forms/${formId}/roles`);
  return response.data;
};

export const useGetFormRoles = (formId: number | string | undefined, enabled = true) => {
  const numericFormId = Number(formId);
  return useQuery<FormRoleDto>({
    queryKey: ["form-roles", numericFormId],
    queryFn: () => getFormRoles(numericFormId),
    enabled: enabled && !!formId && !isNaN(numericFormId),
  });
};

export const useUpsertFormRoles = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ formId, data }: { formId: number; data: UpsertFormRolesDto }) => {
      const response = await apiClient.post<FormRoleDto>(`/forms/${formId}/roles`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["form-roles", variables.formId] });
    },
  });
};
