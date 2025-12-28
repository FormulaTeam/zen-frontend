import { useState, useRef, useEffect, useCallback } from "react";
import { Form, Filter } from "../utils/interfaces";
import { useGetFormsQuery } from "./useFormsQuery";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { showErrorNotification } from "../utils/utils";
import { sortForms } from "./helpers/sortForms";
import { filterForms } from "./helpers/filterFroms";
import { paginateForms } from "./helpers/paginateForms";

export type IGetFormsData = (
  nextPage: number,
  currentFilter: Filter,
  additionalFilter?: Filter,
  deleted?: boolean,
) => Form[] | undefined;

export function useGetFormsData(initialForms: Form[] = [], maxInPage = 24) {
  const [formsData, setFormsData] = useState<Form[]>(initialForms);
  const [loadingBottom, setLoadingBottom] = useState(false);

  const { data: cachedForms, isLoading } = useGetFormsQuery();
  const isFetching = useRef(false);
  const pendingFilter = useRef<Filter | null>(null);
  const hasInitialized = useRef(false);
  const lastAppliedFilter = useRef<Filter | null>(null);

  useEffect(() => {
    if (!cachedForms || !lastAppliedFilter.current) return;
    const filter = lastAppliedFilter.current;
    const filtered = filterForms(cachedForms, filter.query);
    const sorted = sortForms(filtered, filter.sortBy, filter.orderBy);
    const processed = paginateForms(sorted, filter.pageNumber, filter.pageSize);
    setFormsData(processed);
  }, [cachedForms]);

  const getData: IGetFormsData = useCallback(
    (nextPage, currentFilter = {}, additionalFilter = {}, deleted = false) => {
      if (isFetching.current) return;
      isFetching.current = true;
      hasInitialized.current = true;

      const isFirstPage = nextPage === 1;
      if (!isFirstPage) setLoadingBottom(true);

      const filter: Filter = {
        query: { ...currentFilter.query, ...additionalFilter.query },
        pageSize: maxInPage,
        pageNumber: nextPage,
        sortBy: additionalFilter.sortBy ?? currentFilter.sortBy ?? "name",
        orderBy: (additionalFilter.orderBy ?? currentFilter.orderBy ?? "ASC") as
          | IOrderBy.ASC
          | IOrderBy.DESC,
        signal: additionalFilter.signal,
        deleted,
      };

      pendingFilter.current = filter;
      lastAppliedFilter.current = filter;

      try {
        const baseForms = cachedForms ?? [];
        if (!baseForms.length) return [];

        const filtered = filterForms(baseForms, filter.query);
        const sorted = sortForms(filtered, filter.sortBy, filter.orderBy);
        const processed = paginateForms(sorted, filter.pageNumber, filter.pageSize);

        setFormsData((prev) => (isFirstPage ? processed : [...prev, ...processed]));
        return processed;
      } catch (err: any) {
        if (err?.message !== "canceled") {
          console.error("useGetFormsData error:", err);
          showErrorNotification("שליפת הטפסים נכשלה");
        }
        return [];
      } finally {
        isFetching.current = false;
        if (!isFirstPage) setLoadingBottom(false);
      }
    },
    [cachedForms, maxInPage],
  );

  return {
    formsData,
    setFormsData,
    loadingBottom,
    getData,
    isLoading,
  };
}
