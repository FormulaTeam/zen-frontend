import { UseQueryResult } from "@tanstack/react-query";
import { userType } from "formula-gear";

import type { UserDto, UserPersonalDto } from "../types/shared";
import { useFetch } from "../utils/useFetch";
import apiClient from "./config";

type UserSearchResult = {
  id: string;
  displayName: string;
  upn: string;
};

export type UserTypeDto = {
  userType: (typeof userType)[keyof typeof userType];
};

export const getUsers = async (filterName?: string): Promise<UserSearchResult[]> => {
  const trimmedName = filterName?.trim();

  if (!trimmedName) return [];

  try {
    const response = await apiClient.get<UserDto[]>("/users", {
      params: { searchQuery: trimmedName },
    });

    return (response.data ?? []).map((userDto) => ({
      id: String(userDto.id),
      displayName: userDto.name,
      upn: userDto.upn,
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);

    throw error;
  }
};

export const useGetIsSuperAdmin = (): UseQueryResult<UserTypeDto> => {
  return useFetch<undefined, UserTypeDto>({
    endpoint: "/users/me/type",
    queryKey: () => ["user-type"],
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

export const useGetMyProfile = (
  { enabled }: { enabled: boolean } = { enabled: true },
): UseQueryResult<UserDto> => {
  return useFetch<undefined, UserDto>({
    endpoint: "/users/me",
    queryKey: () => ["user-profile"],
    queryOptions: {
      enabled,
    },
  });
};

export const getMyProfile = async (): Promise<UserDto> => {
  const response = await apiClient.get<UserDto>("/users/me");

  return response.data;
};

export const getMyPersonal = async (): Promise<UserPersonalDto> => {
  const response = await apiClient.get<UserPersonalDto>("/users/me/personal");

  return response.data;
};
