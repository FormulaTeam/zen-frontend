import { useGetFormsQuery, FormsQueryParams } from "./useFormsQuery";
import { Filter } from "../utils/interfaces";
import type { FormDto } from "../types/shared";
import { getForms } from "../api/formsApi";
import { useState, useCallback } from "react";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";

/**
 * Legacy type for components that still use the old filter-based getData API
 * (e.g. DeletedResponsesTabContent, useDeletedResponses).
 */
export type IGetFormsData = (
  nextPage: number,
  currentFilter: Filter,
  additionalFilter?: Filter,
  deleted?: boolean,
  softDeleted?: boolean,
) => Promise<FormDto[] | undefined>;

/**
 * Hook for the main forms list page.
 * Uses the new GET /forms endpoint with server-side filtering and sorting.
 */
export function useGetFormsData(params: FormsQueryParams) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useGetFormsQuery(params);

  const formsData = data?.pages.flat() ?? [];

  return {
    formsData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  };
}
/**
 * Hook for legacy components that still need the old filter-based forms API
 * (e.g. DeletedResponsesTabContent, useDeletedResponses).
 */
export function useLegacyFormsData(maxInPage = 1000) {
  const [formsData, setFormsData] = useState<FormDto[]>([]);

  const getData: IGetFormsData = useCallback(
    async (
      nextPage,
      currentFilter = {},
      additionalFilter = {},
      deleted = false,
      softDeleted = false,
    ) => {
      const mergedQuery =
        currentFilter.query &&
        typeof currentFilter.query === "object" &&
        additionalFilter.query &&
        typeof additionalFilter.query === "object"
          ? { ...currentFilter.query, ...additionalFilter.query }
          : additionalFilter.query || currentFilter.query;

      const filter: Filter = {
        query: mergedQuery,
        pageSize: maxInPage,
        pageNumber: nextPage,
        sortBy: additionalFilter.sortBy ?? currentFilter.sortBy ?? "name",
        orderBy: (additionalFilter.orderBy ?? currentFilter.orderBy ?? IOrderBy.ASC) as IOrderBy,
        signal: additionalFilter.signal,
        deleted,
        softDeleted,
      };

      try {
        const result = await getForms(filter);
        const forms = result ?? [];
        setFormsData(forms);
        return forms;
      } catch (err: any) {
        if (err?.message !== "canceled") {
          console.error("useLegacyFormsData error:", err);
        }
        return [];
      }
    },
    [maxInPage],
  );

  return {
    formsData,
    setFormsData,
    getData,
  };
}
