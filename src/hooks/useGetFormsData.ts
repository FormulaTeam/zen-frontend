import { useState, useEffect } from "react";
import { Form, Filter } from "../utils/interfaces";
import { useAuth } from "../contexts/AuthContext";
import { useFormsQuery } from "./useFormsQuery";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { showErrorNotification } from "../utils/utils";

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

  // ✅ Use cached React Query data
  const { data: cachedForms, isFetching, refetch } = useFormsQuery();

  useEffect(() => {
    if (cachedForms) {
      setFormsData(cachedForms);
      setLoading(false);
    }
  }, [cachedForms]);

  const getData: IGetFormsData = async (
    nextPage,
    from,
    currentFilter = {},
    additionalFilter = {},
    deleted = false
  ) => {
    // Optional: do pagination/filtering here
    // For now, just return cached forms
    setLoading(true);
    try {
      // If filters change, you can apply them locally
      let result = cachedForms ?? [];
      // Example: apply search locally
      if (currentFilter?.query?.name) {
        const search = currentFilter.query.name.$regex.toLowerCase();
        result = result.filter(f => f.name.toLowerCase().includes(search));
      }
      setFormsData(result);
      return result;
    } catch (err) {
      showErrorNotification("Failed to get forms");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getFormsByIds = async (ids: number[]) => {
    if (!cachedForms) return [];
    return cachedForms.filter(f => ids.includes(f.id));
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
