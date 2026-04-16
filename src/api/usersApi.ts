import { UseQueryResult } from "@tanstack/react-query";
import { UserType, userType, UserWithoutUserTypeSchema } from "formula-gear";
import z from "zod";

import type { UserDto, UserPersonalDto } from "../types/shared";
import { useFetch } from "../utils/useFetch";
import apiClient from "./config";

type UserSearchResult = {
  id: number;
  displayName: string;
  upn: string;
};

export type UserTypeDto = {
  userType: (typeof userType)[keyof typeof userType];
};

type UserWithoutType = z.infer<typeof UserWithoutUserTypeSchema>

export const getUsers = async (filterName?: string): Promise<UserSearchResult[]> => {
  const trimmedName = filterName?.trim();

  if (!trimmedName) return [];

  try {
    const response = await apiClient.get<UserDto[]>("/users", {
      params: { searchQuery: trimmedName },
    });

    return (response.data ?? []).map((user: UserWithoutType) => ({
      id: user.id,
      displayName: user.name || "",
      upn: user.upn || "",
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);

    throw error;
  }
};

export const useGetIsSuperAdmin = (
  { enabled }: { enabled: boolean } = { enabled: true },
): UseQueryResult<UserType> => {
  return useFetch<undefined, UserType>({
    endpoint: "/users/me/type",
    queryKey: () => ["user-type"],
    queryOptions: {
      enabled,
    },
  });
};

export const useGetMyPersonal = (
  { enabled }: { enabled: boolean } = { enabled: true },
): UseQueryResult<UserPersonalDto> => {
  return useFetch<undefined, UserPersonalDto>({
    endpoint: "/users/me/personal",
    queryKey: () => ["user-personal"],
    queryOptions: {
      enabled,
    },
  });
};