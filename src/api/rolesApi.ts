import { useQuery } from "@tanstack/react-query";
import apiClient from "./config";
import { FormRoleDto } from "../types/shared";

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
