import { useState, useEffect, useRef } from "react";
import { Form, Filter } from "../utils/interfaces";
import { useFormsQuery } from "./useFormsQuery";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { showErrorNotification } from "../utils/utils";
import { sortForms } from "./helpers/sortForms";
import { filterForms } from "./helpers/filterFroms";
import { paginateForms } from "./helpers/paginateForms";

export type IGetFormsData = (
  nextPage: number,
  from: string,
  currentFilter: Filter,
  additionalFilter?: Filter,
  deleted?: boolean
) => Promise<Form[] | undefined>;

export function useGetFormsData(initialForms: Form[] = [], maxInPage = 24) {
  const [formsData, setFormsData] = useState<Form[]>(initialForms);
  const [loading, setLoading] = useState(false);
  const [loadingBottom, setLoadingBottom] = useState(false);

  const isFetching = useRef(false);
  const pendingFilter = useRef<Filter | null>(null);

  const { data: cachedForms, isLoading: isQueryLoading } = useFormsQuery();
  console.log("===============cachedForms in useGetFormsData:==========", cachedForms);

  useEffect(() => {
    if (!cachedForms?.length || !pendingFilter.current || isFetching.current) return;

    const filter = pendingFilter.current;
    pendingFilter.current = null;

    const filtered = paginateForms(
      sortForms(filterForms(cachedForms, filter.query), filter.sortBy, filter.orderBy),
      filter.pageNumber,
      filter.pageSize
    );

    setFormsData((prev) => (filter.pageNumber === 1 ? filtered : [...prev, ...filtered]));
  }, [cachedForms]);

  const getData: IGetFormsData = async (
    nextPage,
    from,
    currentFilter = {},
    additionalFilter = {},
    deleted = false
  ) => {
    if (isFetching.current) return;

    const sortBy = additionalFilter.sortBy ?? currentFilter.sortBy ?? "name";
    const orderBy = (additionalFilter.orderBy ?? currentFilter.orderBy ?? "ASC") as
      | IOrderBy.ASC
      | IOrderBy.DESC;

    const filter: Filter = {
      query: { ...currentFilter.query, ...additionalFilter.query },
      pageSize: maxInPage,
      pageNumber: nextPage,
      sortBy,
      orderBy,
      signal: additionalFilter.signal,
      deleted,
    };

    const isFirstPage = nextPage === 1;
    setLoading(isFirstPage);
    setLoadingBottom(!isFirstPage);
    isFetching.current = true;

    try {
      const baseForms = cachedForms ?? [];

      if (isQueryLoading && !baseForms.length) {
        pendingFilter.current = filter;

        return;
      }

      const processed = paginateForms(
        sortForms(filterForms(baseForms, filter.query), filter.sortBy, filter.orderBy),
        filter.pageNumber,
        filter.pageSize
      );

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
      setLoading(false);
      setLoadingBottom(false);
    }
  };

  const getFormsByIds = async (ids: number[]) => {
    if (!ids.length) return [];

    const available = cachedForms?.filter((f) => ids.includes(f.id)) ?? [];
    if (!available.length) return [];

    setFormsData((prev) => {
      const merged = new Map(prev.map((f) => [f.id, f]));
      available.forEach((form) => merged.set(form.id, form));
      
      return Array.from(merged.values());
    });

    return available;
  };

  return {
    formsData,
    setFormsData,
    loading: loading || isQueryLoading,
    setLoading,
    loadingBottom,
    setLoadingBottom,
    getData,
    getFormsByIds,
  };
}
