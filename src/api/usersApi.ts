import apiClient from "./config";
import { User } from "../utils/interfaces";
import { useFetch } from "../utils/useFetch";
import { UseQueryResult } from "@tanstack/react-query";
import { z } from "zod";
import { UserSchema, userType } from "formula-gear";

export type UserDto = z.infer<typeof UserSchema>;
export type UserTypeDto = { userType: (typeof userType)[keyof typeof userType] };

export const getUsers = async (filterName?: string): Promise<User[]> => {
  const trimmedName = filterName?.trim();
  if (!trimmedName) {
    return [];
  }

  try {
    const response = await apiClient.get<UserDto[]>("/users", {
      params: { searchQuery: trimmedName },
    });
    return (response?.data ?? []).map((userDto) => ({
      id: String(userDto.id),
      displayName: userDto.name,
      upn: userDto.upn,
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw error;
  }
};

export const useGetIsSuperAdmin = ({ enabled }: { enabled: boolean } = { enabled: true }): UseQueryResult<boolean> => {
  return useFetch<undefined, boolean>({
    endpoint: "/users/me/type",
    queryKey: () => ["user-type"],
    queryOptions: {
      enabled,
      select: (data: any) => data?.userType === 1,
    },
  });
};

export const getMyProfile = async (): Promise<UserTypeDto> => {
  const response = await apiClient.get<UserTypeDto>("/users/me/type");
  return response.data;
};
