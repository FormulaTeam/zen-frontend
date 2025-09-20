import { useState } from "react";
import { getForms } from "../api";
import { getResponsesCount } from "../api/responsesApi";
import { Form, Filter } from "../utils/interfaces";
import { showErrorNotification } from "../utils/utils";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { useAuth } from "../contexts/AuthContext";

/**
 * Custom hook to manage forms data and loading state.
 * @param {Form[]} initialForms - Initial forms data.
 * @param {number} maxInPage - Maximum number of forms to fetch per page.
 * @returns Forms data and utilities to manage them.
 */
export type IGetFormsData = (
  nextPage: number,
  from: string,
  currentFilter: Filter,
  additionalFilter?: Filter,
  deleted?: boolean,
) => Promise<Form[] | undefined>;

export function useGetFormsData(initialForms: Form[] = [], maxInPage = 24) {
  const [formsData, setFormsData] = useState<Form[]>(initialForms);
  const [loading, setLoading] = useState(true);
  const [loadingBottom, setLoadingBottom] = useState(false);
  const { user } = useAuth();

  /**
   * Fetch response counts for all forms and update their numberOfResponses property
   */
  const updateFormsWithResponseCounts = async (forms: Form[]): Promise<Form[]> => {
    if (!forms || forms.length === 0) return forms;

    try {
      // Fetch response counts for all forms in parallel
      const responseCountPromises = forms.map(async (form) => {
        try {
          const userInForm = form.users?.find(
            (u: any) => u.upn?.toLowerCase() === user?.upn?.toLowerCase(),
          );
          if (!userInForm) return form;
          const responseCount = await getResponsesCount(form.id);
          return { ...form, numberOfResponses: responseCount.count };
        } catch (error) {
          console.error(`Failed to fetch response count for form ${form.id}:`, error);
          // Keep the original numberOfResponses if API call fails
          return form;
        }
      });

      const updatedForms = await Promise.all(responseCountPromises);
      return updatedForms;
    } catch (error) {
      console.error("Failed to update forms with response counts:", error);
      return forms;
    }
  };

  const getData: IGetFormsData = async (
    nextPage: number,
    from: string,
    currentFilter: Filter = {},
    additionalFilter: Filter = {},
    deleted = false,
  ) => {
    const sortBy = additionalFilter.sortBy || currentFilter?.sortBy || "name";
    const orderBy = additionalFilter.orderBy || currentFilter?.orderBy || "ASC";
    let query = { ...currentFilter?.query, ...additionalFilter?.query };

    if (Object.keys(query).length === 0) {
      query = {};
    }

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
      const forms = (await getForms(filter)) || [];
      if (!forms || forms.length === 0) {
        setLoading(false);
        return;
      }

      // Update forms with response counts
      const formsWithCounts = await updateFormsWithResponseCounts(forms);
      const updatedFormsData =
        nextPage === 1 ? formsWithCounts : [...formsData, ...formsWithCounts];
      setFormsData(updatedFormsData);
      return updatedFormsData;
    } catch (error: any) {
      if (error?.message === "canceled") return;
      showErrorNotification("שליפת הטפסים נכשלה");
    } finally {
      setLoading(false);
      setLoadingBottom(false);
    }
  };

  const getFormsByIds = async (ids: number[]) => {
    if (ids.length === 0) return [];
    try {
      const filter: Filter = {
        query: { id: { $in: ids } },
        pageSize: ids.length,
        pageNumber: 1,
        sortBy: "id",
        orderBy: IOrderBy.ASC,
      };
      const newForms = (await getForms(filter)) || [];

      // Update new forms with response counts
      const newFormsWithCounts = await updateFormsWithResponseCounts(newForms);

      setFormsData((prev) => {
        const newMap = new Map(prev.map((f) => [f.id, f]));
        newFormsWithCounts.forEach((form) => {
          newMap.set(form.id, form); // תמיד נעדכן/נחליף
        });
        return Array.from(newMap.values());
      });

      return newFormsWithCounts;
    } catch (error) {
      showErrorNotification("טעינת טפסים לפי מזהים נכשלה");
      return [];
    }
  };

  return {
    formsData,
    setFormsData,
    loading,
    setLoading,
    loadingBottom,
    setLoadingBottom,
    getData,
    getFormsByIds,
  };
}
