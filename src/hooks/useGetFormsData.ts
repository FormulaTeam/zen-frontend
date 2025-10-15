import { useState, useEffect } from "react";
import { Form, Filter } from "../utils/interfaces";
import { useAuth } from "../contexts/AuthContext";
import { useFormsQuery } from "./useFormsQuery";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { showErrorNotification } from "../utils/utils";
import { getForms } from "../api/formsApi";
import { getResponsesCount } from "../api/responsesApi";
import { sortForms } from "./helpers/sortForms";
import { filterForms } from "./helpers/filterFroms";
import { paginateForms } from "./helpers/paginateForms";

export type IGetFormsData = (
  nextPage: number,
  from: string,
  currentFilter: Filter,
  additionalFilter?: Filter,
  deleted?: boolean,
) => Promise<Form[] | undefined>;

export function useGetFormsData(initialForms: Form[] = [], maxInPage = 24) {
  const { user } = useAuth();
  const [formsData, setFormsData] = useState<Form[]>(initialForms);
  const [loading, setLoading] = useState(true);
  const [loadingBottom, setLoadingBottom] = useState(false);

  // React Query cache
  const { data: cachedForms, isFetching, refetch } = useFormsQuery();

  useEffect(() => {
    if (cachedForms?.length) {
      setFormsData(cachedForms);
      setLoading(false);
    }
  }, [cachedForms]);

  const getData: IGetFormsData = async (
    nextPage,
    from,
    currentFilter = {},
    additionalFilter = {},
    deleted = false,
  ) => {
    const sortBy = additionalFilter.sortBy || currentFilter?.sortBy || "name";
    const orderBy = additionalFilter.orderBy || currentFilter?.orderBy || "ASC";
    let query = { ...currentFilter?.query, ...additionalFilter?.query };

    const filter: Filter = {
      query,
      pageSize: maxInPage,
      pageNumber: nextPage,
      sortBy,
      orderBy: orderBy as IOrderBy.ASC | IOrderBy.DESC,
      signal: additionalFilter?.signal,
      deleted,
    };

    if (nextPage === 1) setLoading(true);
    else setLoadingBottom(true);

    try {
      // Use cache first
      let forms: Form[] = cachedForms ?? [];

      if (forms.length > 0) {
        forms = filterForms(forms, filter.query);
        forms = sortForms(forms, filter.sortBy, filter.orderBy);
        forms = paginateForms(forms, filter.pageNumber, filter.pageSize);

        // Merge paginated results
        if (filter.pageNumber === 1) setFormsData(forms);
        else setFormsData((prev) => [...prev, ...forms]);

        return forms;
      }

      // Fallback to server
      const fetched = (await getForms(filter)) || [];
      if (!fetched.length) return [];

      // Attach response counts
      const withCounts: Form[] = await Promise.all(
        fetched.map(async (f) => {
          try {
            const userInForm = f.users?.find(
              (u: any) => u.upn?.toLowerCase() === user?.upn?.toLowerCase(),
            );
            if (!userInForm) return f;
            const resp = await getResponsesCount(f.id);
            return { ...f, numberOfResponses: resp.count };
          } catch {
            return f;
          }
        }),
      );

      const result = filter.pageNumber === 1 ? withCounts : [...formsData, ...withCounts];
      setFormsData(result);
      return withCounts;
    } catch (err: any) {
      if (err?.message === "canceled") return;
      console.error("useGetFormsData getData error", err);
      showErrorNotification("שליפת הטפסים נכשלה");
      return [];
    } finally {
      setLoading(false);
      setLoadingBottom(false);
    }
  };

  const getFormsByIds = async (ids: number[]) => {
    if (ids.length === 0) return [];

    // Try cache first
    if (cachedForms?.length) {
      const found = cachedForms.filter((f) => ids.includes(f.id));
      if (found.length === ids.length) return found;
    }

    // Server fallback
    const filter: Filter = {
      query: { id: { $in: ids } },
      pageSize: ids.length,
      pageNumber: 1,
      sortBy: "id",
      orderBy: IOrderBy.ASC,
    };

    try {
      const newForms = (await getForms(filter)) || [];
      const newWithCounts: Form[] = await Promise.all(
        newForms.map(async (f) => {
          try {
            const userInForm = f.users?.find(
              (u: any) => u.upn?.toLowerCase() === user?.upn?.toLowerCase(),
            );
            if (!userInForm) return f;
            const resp = await getResponsesCount(f.id);
            return { ...f, numberOfResponses: resp.count };
          } catch {
            return f;
          }
        }),
      );

      setFormsData((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        newWithCounts.forEach((nf) => map.set(nf.id, nf));
        return Array.from(map.values());
      });

      return newWithCounts;
    } catch (err) {
      console.error("useGetFormsData getFormsByIds error", err);
      showErrorNotification("טעינת טפסים לפי מזהים נכשלה");
      return [];
    }
  };

  return {
    formsData,
    setFormsData,
    loading: loading || isFetching,
    setLoading,
    loadingBottom,
    setLoadingBottom,
    getData,
    getFormsByIds,
    refetchForms: refetch,
  };
}
