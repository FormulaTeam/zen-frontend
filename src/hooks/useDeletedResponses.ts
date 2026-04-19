import { useRef, useState, useEffect } from "react";
import { Filter, ResponseForm } from "../utils/interfaces";
import type { FormDto } from "../types/shared";
import { getResponses, restoreResponses } from "../api";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { useDebounce } from "./utilsHooks/useDebounce";
import { IGetFormsData } from "./useGetFormsData";

// Number of responses to fetch per page
const PAGE_SIZE = 50;

export const getResponseKey = (formId: number, responseIndex: number) =>
  `${formId}_${responseIndex}`;

/**
 * Sorts deleted responses by their deleted timestamp.
 */
const sortResponses = (responses: ResponseForm[], sortValue: number): ResponseForm[] => {
  const getDeletedTime = (r: ResponseForm) => {
    const raw = (r as any)?.deleted_at || (r as any)?.deletedAt || 0;
    const time = new Date(raw).getTime();
    return Number.isFinite(time) ? time : 0;
  };

  return [...responses].sort((a: ResponseForm, b: ResponseForm) => {
    const aDate = getDeletedTime(a);
    const bDate = getDeletedTime(b);

    if (sortValue === 7) return bDate - aDate; // newest -> oldest
    if (sortValue === 8) return aDate - bDate; // oldest -> newest

    return 0;
  });
};

export const useDeletedResponses = (
  user: any,
  formsData: FormDto[],
  getData: IGetFormsData,
  currentDeletedForm: FormDto | null,
) => {
  const [selectedResponseKeys, setSelectedResponseKeys] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const [responses, setResponses] = useState<ResponseForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchValue, setSearchValue] = useState("");
  const [sortValue, setSortValue] = useState<number>(7);
  const [filters, setFilters] = useState({ deletedBy: "", createdBy: "" });

  const currentQueryId = useRef(0);
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const { isSuperAdmin } = useSuperAdmin();

  const fetchResponses = async (
    pageNumber = 1,
    search = "",
    customFilters = filters,
    customSort = sortValue,
  ) => {
    if (pageNumber === 1) setResponses([]);
    setIsLoading(true);

    const queryId = ++currentQueryId.current;

    try {
      const trimmedSearch = search.trim();
      const sort = customSort === 8 ? "deletedAtAsc" : "deletedAtDesc";

      const filter: Filter = {
        pageSize: PAGE_SIZE,
        pageNumber,
        deleted: true,
        query: {
          sort,
          deletedByText: customFilters.deletedBy?.trim() || undefined,
          createdByText: customFilters.createdBy?.trim() || undefined,
          search: trimmedSearch || undefined,
          ...(currentDeletedForm
            ? {
                isDeletedForm: true,
              }
            : {}),
        },
      };

      const result = currentDeletedForm
        ? await getResponses(currentDeletedForm.id, filter)
        : [];

      if (queryId !== currentQueryId.current) return;

      const sorted = sortResponses(result as any ?? [], customSort);

      if (pageNumber === 1) {
        setResponses(sorted);
      } else {
        setResponses((prev) => [...prev, ...sorted]);
      }

      setHasMore((result?.length ?? 0) === PAGE_SIZE);

      if (currentDeletedForm) {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Error fetching deleted responses:", err);
      showErrorNotification("Error loading responses");
    } finally {
      if (queryId === currentQueryId.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!mounted) return;
    fetchResponses(1, debouncedSearchValue, filters, sortValue);
  }, [debouncedSearchValue, sortValue, currentDeletedForm]);

  const handleSearch = (val: string) => {
    setSearchValue(val);
    setPage(1);
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchResponses(next, debouncedSearchValue, filters, sortValue);
    }
  };

  const restoreResponseById = async (formId: number, responseId: string) => {
    setIsLoading(true);
    try {
      await restoreResponses(formId, [responseId]);
      showSuccessNotification("התגובה שוחזרה בהצלחה");

      setResponses((prev: any[]) =>
        prev.filter(
          (r) => !((r.form_id ?? r.formId) === formId && (r.id) === responseId),
        ),
      );
    } catch (err) {
      console.error("Failed to restore response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSelection = () => {
    setSelectedResponseKeys([]);
  };

  const restoreSelectedResponses = async () => {
    for (const response of responses) {
      const formId = response.form_id;
      const responseId = response.id;

      const key = getResponseKey(formId, response.index);
      if (selectedResponseKeys.includes(key)) {
        await restoreResponseById(formId, responseId);
      }
    }
    cancelSelection();
  };

  const handleSelect = (formId: number, responseId: string) => {
    const response = responses.find((r) => r.id === responseId);
    if (!response) return;
    const key = getResponseKey(formId, response.index);
    setSelectedResponseKeys((prev) => (prev.includes(key) ? prev : [...prev, key]));
  };

  const handleDeselect = (formId: number, responseId: string) => {
    const response = responses.find((r) => r.id === responseId);
    if (!response) return;
    const key = getResponseKey(formId, response.index);
    setSelectedResponseKeys((prev) => prev.filter((x) => x !== key));
  };

  return {
    responses,
    isLoading,
    fetchResponses,
    searchValue,
    handleSearch,
    loadMore,
    restoreResponseById,
    mounted,
    setMounted,
    filters,
    setFilters,
    sortValue,
    setSortValue,
    selectedResponseKeys,
    handleSelect,
    handleDeselect,
    restoreSelectedResponses,
    cancelSelection,
  };
};
