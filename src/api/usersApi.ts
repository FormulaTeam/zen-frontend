import { useInfiniteQuery, UseQueryResult } from "@tanstack/react-query";
import { UserType, userType, UserWithoutUserTypeSchema } from "formula-gear";
import z from "zod";

import type { UserDto, UserPersonalDto } from "../types/shared";
import { useFetch } from "../utils/useFetch";
import apiClient from "./config";

export type UserSearchResult = {
  id: number;
  displayName: string;
  upn: string;
};

export type UserTypeDto = {
  userType: (typeof userType)[keyof typeof userType];
};

type UserWithoutType = z.infer<typeof UserWithoutUserTypeSchema>

export const USERS_PAGINATION_LIMIT = 10;

export const useSearchUsersQuery = (searchQuery: string) => {
  return useInfiniteQuery({
    queryKey: ["users", "search", searchQuery],
    queryFn: async ({ pageParam = 0 }) => {
      if (!searchQuery?.trim()) return [];

      const response = await apiClient.get<UserDto[]>("/users", {
        params: { search: searchQuery.trim(), limit: USERS_PAGINATION_LIMIT, offset: pageParam },
      });

      return (response.data ?? []).map((user: UserWithoutType) => ({
        id: user.id,
        displayName: user.name || "",
        upn: user.upn || "",
      }));
    },
    enabled: !!searchQuery?.trim() && searchQuery.trim().length >= 2,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.length < USERS_PAGINATION_LIMIT) {
        return undefined;
      }
      return allPages.length * USERS_PAGINATION_LIMIT;
    },
  });
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