/**
 * Custom hook for managing deleted responses, including fetching, restoring, searching, sorting, and permissions logic.
 *
 * @param user - The current user object.
 * @param formsData - Array of all forms data.
 * @param getData - Function to fetch forms data.
 * @param currentDeletedForm - The currently selected deleted form (if any).
 * @returns Object with state and handlers for deleted responses management.
 */
import { useRef, useState, useEffect } from "react";
import { Filter, Form, ResponseForm } from "../utils/interfaces";
import { getAllDeletedResponses, restoreResponse } from "../api";
import { PERMISSION_TYPES, showErrorNotification, showSuccessNotification } from "../utils/utils";
import { useSuperAdmin } from "../contexts/SuperAdminContext";
import { useDebounce } from "./utilsHooks/useDebounce";
import { getSortedFilter } from "../utils/filters";
import { IGetFormsData } from "./useGetFormsData";
import { useAuth } from "../contexts/AuthContext";

// Number of responses to fetch per page
const PAGE_SIZE = 50;

// Helper to generate unique key for a response (form_id + response id)
export const getResponseKey = (formId: number, responseId: number) => `${formId}_${responseId}`;

/**
 * Sorts deleted responses by their deleted date.
 * @param responses - Array of deleted responses.
 * @param sortValue - Sorting mode (7: newest to oldest, 8: oldest to newest).
 * @returns Sorted array of responses.
 */
const sortResponses = (responses: ResponseForm[], sortValue: number): ResponseForm[] => {
  return [...responses].sort((a, b) => {
    const aDate = new Date(a.deleted || 0).getTime();
    const bDate = new Date(b.deleted || 0).getTime();

    if (sortValue === 7) return bDate - aDate; // newest to oldest
    if (sortValue === 8) return aDate - bDate; // oldest to newest
    return 0;
  });
};

export const useDeletedResponses = (
  user: any,
  formsData: Form[],
  getData: IGetFormsData,
  currentDeletedForm: Form | null,
) => {
  // Selected response keys for bulk actions
  const [selectedResponseKeys, setSelectedResponseKeys] = useState<string[]>([]);
  // Indicates if the component is mounted
  const [mounted, setMounted] = useState(false);
  // Array of deleted responses
  const [responses, setResponses] = useState<ResponseForm[]>([]);
  // Loading state for async operations
  const [isLoading, setIsLoading] = useState(false);
  // Current page for pagination
  const [page, setPage] = useState(1);
  // Whether there are more responses to load
  const [hasMore, setHasMore] = useState(true);
  // Search input value
  const [searchValue, setSearchValue] = useState("");
  // Sorting mode
  const [sortValue, setSortValue] = useState<number>(7);
  // Filters for deleted/created by
  const [filters, setFilters] = useState({ deletedBy: "", createdBy: "" });
  // Used to prevent race conditions in async fetches
  const currentQueryId = useRef(0);

  // Debounced search value to avoid excessive requests
  const debouncedSearchValue = useDebounce(searchValue, 500);
  // Super admin flag from context
  const { isSuperAdmin } = useSuperAdmin();
  // User roles from context
  const { roles } = useAuth();

  /**
   * Helper to fetch forms data with a given filter.
   * @param filter - Filter for forms.
   * @returns Array of forms.
   */
  const wrappedGetForms = async (filter: Filter): Promise<Form[]> => {
    const result = await getData(1, "deleted-responses-search", filter);
    return result || [];
  };

  /**
   * Fetches deleted responses with support for permissions, filters, search, and pagination.
   * Handles permission logic for super admin and regular users, and builds the appropriate query.
   *
   * @param pageNumber - The page number to fetch.
   * @param search - Search string for forms.
   * @param customFilters - Filters for deleted/created by.
   * @param customSort - Sorting mode.
   */
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
      // If formsData is empty and no currentDeletedForm, load forms for permission evaluation
      if (!currentDeletedForm && formsData.length === 0) {
        console.log("⏳ Loading formsData for permission evaluation...");

        const userUpn = user?.upn?.toLowerCase();

        const loadedForms = await getData(1, "auto-load-for-permissions", {
          query: {
            $or: [{ owner_upn: userUpn }, { "users.upn": userUpn }],
          },
        });

        if (Array.isArray(loadedForms) && loadedForms.length > 0) {
          formsData = loadedForms; // Local assignment only
        }
      }

      // Build filter for deleted responses
      const filter = getSortedFilter(customSort, {
        pageSize: PAGE_SIZE,
        pageNumber,
        deleted: true,
        query: {},
      });

      if (!filter.query) filter.query = {};

      // Build $or conditions for deleted/created by filters
      const orConditions: any[] = [];

      if (customFilters.deletedBy) {
        orConditions.push(
          { deleted_by_name: { $regex: customFilters.deletedBy, $options: "i" } },
          { deleted_by: { $regex: customFilters.deletedBy, $options: "i" } },
        );
      }

      if (customFilters.createdBy) {
        orConditions.push(
          { created_by_name: { $regex: customFilters.createdBy, $options: "i" } },
          { created_by: { $regex: customFilters.createdBy, $options: "i" } },
        );
      }

      // User identifiers for permission checks
      const identifiers = [user?.id?.toLowerCase(), user?.upn?.toLowerCase()].filter(Boolean);

      // Find forms where user is an editor
      const editorForms = formsData
        .filter((form) =>
          form.users?.some((u) => identifiers.includes(u.upn?.toLowerCase()) && u.role_id === 1),
        )
        .map((f) => f.id);


      // Build access query for non-super-admins
      if (!isSuperAdmin) {
        const accessConditions: any[] = [];

        if (identifiers.length) {
          accessConditions.push(
            { created_by: { $in: identifiers } },
            { edited_by: { $in: identifiers } },
          );
        }

        if (editorForms.length) {
          accessConditions.push({ form_id: { $in: editorForms } });
        }


        if (accessConditions.length > 0 || orConditions.length > 0) {
          filter.query.$or = [...orConditions, ...accessConditions];
        } else {
          setResponses([]);
          setHasMore(false);
          return;
        }
      } else {
        // Super admin: only apply orConditions if present
        if (orConditions.length > 0) {
          filter.query.$or = orConditions;
        }
      }

      // If a specific deleted form is selected, filter by its ID
      if (currentDeletedForm) {
        filter.query.form_id = currentDeletedForm.id;
        filter.query.isDeletedForm = true;

        const result = await getAllDeletedResponses(filter);
        if (queryId !== currentQueryId.current) return;

        setResponses(sortResponses(result ?? [], customSort));
        setHasMore(false);
        return;
      }

      // Otherwise, fetch all deleted responses
      filter.query.deleted = { $exists: true };

      // Handle search for forms by name or ID
      const trimmed = search.trim();
      const isSearch = trimmed.length > 0;
      const isNumeric = !isNaN(Number(trimmed));

      if (isSearch) {
        const formQuery = {
          $or: [
            { name: { $regex: trimmed, $options: "i" } },
            ...(isNumeric ? [{ id: Number(trimmed) }] : []),
          ],
        };

        const forms = await wrappedGetForms({ query: formQuery });
        const formIds = forms.map((f) => f.id);

        if (queryId !== currentQueryId.current) return;

        if (!formIds.length) {
          setResponses([]);
          setHasMore(false);
          return;
        }

        filter.query.form_id = { $in: formIds };
      }

      // Fetch deleted responses from API
      const result = await getAllDeletedResponses(filter);
      if (queryId !== currentQueryId.current) {
        setIsLoading(false);
        return;
      }

      const sorted = sortResponses(result ?? [], customSort);
      setResponses(pageNumber === 1 ? sorted : [...responses, ...sorted]);
      setHasMore((result?.length ?? 0) === PAGE_SIZE);
    } catch (err) {
      console.error("Error fetching responses:", err);
      showErrorNotification("Error loading responses");
    } finally {
      if (queryId === currentQueryId.current) setIsLoading(false);
    }
  };

  // Refetch responses when search, sort, or selected form changes
  useEffect(() => {
    if (!mounted) return;
    fetchResponses(1, debouncedSearchValue, filters, sortValue);
  }, [debouncedSearchValue, sortValue, currentDeletedForm]);

  /**
   * Handler for search input change.
   * @param val - New search value.
   */
  const handleSearch = (val: string) => {
    setSearchValue(val);
    setPage(1);
  };

  /**
   * Loads the next page of deleted responses (for infinite scroll/pagination).
   */
  const loadMore = () => {
    if (!isLoading && hasMore) {
      const next = page + 1;
      setPage(next);
      fetchResponses(next, debouncedSearchValue, filters, sortValue);
    }
  };

  /**
   * Restores a deleted response by its form and response ID.
   * @param formId - The form ID.
   * @param responseId - The response ID.
   */
  const restoreResponseById = async (formId: number, responseId: number) => {
    setIsLoading(true);
    try {
      const restored = await restoreResponse(formId, responseId);
      if (!restored) return showErrorNotification("Restore failed");

      showSuccessNotification("התגובה שוחזרה בהצלחה");
      setResponses((prev) => prev.filter((r) => !(r.id === responseId && r.form_id === formId)));
    } catch (err) {
      console.error("Failed to restore response:", err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancels the current selection of responses (for bulk actions).
   */
  const cancelSelection = () => {
    setSelectedResponseKeys([]);
  };

  /**
   * Restores all selected responses (bulk restore).
   */
  const restoreSelectedResponses = async () => {
    for (const response of responses) {
      const key = getResponseKey(response.form_id, response.id);
      if (selectedResponseKeys.includes(key)) {
        await restoreResponseById(response.form_id, response.id);
      }
    }
    cancelSelection();
  };

  /**
   * Selects a response by its ID (for bulk actions).
   * @param id - The response ID to select.
   */
  const handleSelect = (formId: number, responseId: number) => {
    const key = getResponseKey(formId, responseId);
    setSelectedResponseKeys((prev) => [...prev, key]);
  };

  /**
   * Deselects a response by its ID (for bulk actions).
   * @param id - The response ID to deselect.
   */
  const handleDeselect = (formId: number, responseId: number) => {
    const key = getResponseKey(formId, responseId);
    setSelectedResponseKeys((prev) => prev.filter((x) => x !== key));
  };

  // Expose state and handlers for use in components
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
