import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  deleteResponse,
  deleteAllResponses,
  searchResponses,
  deleteForm,
  deleteMultipleResponses,
} from "../api";
import {
  BASE_COLUMNS_NAMES_ARRAY,
  getUserName,
  showErrorNotification,
  showSuccessNotification,
} from "../utils/utils";
import { MRT_ColumnFiltersState, MRT_PaginationState } from "material-react-table";
import { SearchResponsesFilter } from "../utils/interfaces";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import moment from "moment";
import { downloadFileFromResponse } from "../api/filesApi";
import { ViewColumn } from "../types/interfaces/tableViews.types";

interface UseResponsesListProps {
  setShouldRefreshPage: (value: boolean) => void;
  user: any;
  currentViewConfig?: ViewColumn[];
}

export const useResponsesList = ({
  setShouldRefreshPage,
  user,
  currentViewConfig,
}: UseResponsesListProps) => {
  const [loading, setLoading] = useState(true);
  const [loadingTable, setLoadingTable] = useState(true);
  const [loadingInsideTable, setLoadingInsideTable] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [columns, setColumns] = useState([]);
  const [allFilteredResponses, setAllFilteredResponses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [allResponsesCount, setAllResponsesCount] = useState(0);
  const [firstRun, setFirstRun] = useState(true);
  const [searchCount, setSearchCount] = useState(0);
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [showDeleteAllConfirmPopup, setShowDeleteAllConfirmPopup] = useState(false);
  const [sortBy, setSortBy] = useState("");
  const [orderBy, setOrderBy] = useState("");
  const [showConfirmMsg, setShowConfirmMsg] = useState<boolean>(false);
  const [confirmMsg, setConfirmMsg] = useState<string>("");
  const [confirmOkFunc, setConfirmOkFunc] = useState<any>(null);
  const [currentFilter, setCurrentFilter] = useState<any>(null);
  const [rowSelection, setRowSelection] = useState<any>({}); //ts type available
  const [confirmBtnText, setConfirmBtnText] = useState<string>("");
  const { id } = useParams();
  const navigate = useNavigate();

  const [columnFilters, setColumnFilters] = useState<MRT_ColumnFiltersState>([]);
  const [sorting, setSorting] = useState<any[]>([{ id: "id", desc: false }]);
  const [pagination, setPagination] = useState<MRT_PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [mainSearch, setMainSearch] = useState("");
  const [permissionTypes, setPermissionTypes] = useState<number[]>([]);

  const changePageSizeAndRefreshTable = async (pageSize: number, pageIndex: number) => {
    let filter: any = {};
    let columnFiltersArr = getSearchFilters(columnFilters);

    if (sortBy && orderBy) {
      filter = {
        form_id: form.id,
        pageSize: pageSize,
        pageNumber: pageIndex + 1,
        searchFilters: columnFiltersArr || [],
        sortBy,
        orderBy,
      };
    } else {
      filter = {
        form_id: form.id,
        pageSize: pageSize,
        pageNumber: pageIndex + 1,
        searchFilters: columnFiltersArr || [],
      };
    }

    try {
      setLoadingInsideTable(true);
      setCurrentFilterWithoutPagination(filter);
      let ans: any = await searchResponses(filter);
      if (ans) {
        if (ans.countAllResponses !== allResponsesCount) {
          setSearchCount(ans.countAllResponses || 0);
        }
        let responses = ans?.responses || [];
        setAllFilteredResponses(responses);
      }
    } catch (error) {
      showErrorNotification("חיפוש התגובות נכשל"); //Failed to search responses:" + error);
    } finally {
      setLoadingInsideTable(false);
    }
  };

  const getSearchFilters = (columnFilters: any[]) => {
    let searchFilters: any[] = [];
    for (let index = 0; index < columnFilters.length; index++) {
      const element = columnFilters[index];
      if (element.id) {
        const colKey = element.id; // may be accessorKey (string) or numeric column id (string or number)
        if (colKey !== undefined && colKey !== null) {
          const keyMaybeNum = isNaN(Number(colKey)) ? colKey : Number(colKey);
          const col: any = columns?.find(
            (c: any) => c.accessorKey === colKey || c.id === keyMaybeNum || c.id === colKey,
          );
          let searchText = element.value;
          if (col) {
            let searchField = col.accessorKey;
            if (!BASE_COLUMNS_NAMES_ARRAY.includes(col.accessorKey)) {
              searchField = col.innerName;
            }
            if (col.accessorKey === "id") {
              searchText = Number(searchText);
            }
            searchFilters.push({ searchField, searchText });
          }
        }
      } else if (element.searchField !== null && element.searchField !== undefined) {
        searchFilters.push(element);
      }
    }
    return searchFilters;
  };

  const doSearch = async (
    createTableColumns: (
      form: any,
      permissionType: number[],
      currentViewConfig?: ViewColumn[],
    ) => void,
    currentSearchArr: any[],
    abortController?: AbortController,
  ) => {
    let searchFilters = [...currentSearchArr];
    let filter: SearchResponsesFilter = {
      form_id: form.id,
      searchFilters,
      signal: abortController?.signal,
    };
    try {
      setLoadingInsideTable(true);
      setCurrentFilterWithoutPagination(filter);
      let ans: any = await searchResponses(filter);
      if (ans) {
        setAllFilteredResponses(ans?.responses || []);
        setSearchCount(ans?.countAllResponses || 0);
        createTableColumns(form, permissionTypes, currentViewConfig);
      }
      setLoadingInsideTable(false);
    } catch (error: any) {
      if (error?.message === "canceled") {
        return;
      }
      showErrorNotification("חיפוש התגובות נכשל"); //Failed to search responses:" + error);
      setLoadingInsideTable(false);
    }
  };

  const searchBySorting = async (sorting) => {
    if (sorting && sorting[0]) {
      setLoadingInsideTable(true);
      const searchFilters: any[] = getSearchFilters(columnFilters);
      const colKey = sorting[0].id; // may be accessorKey or column numeric id
      const colOrderBy: IOrderBy.ASC | IOrderBy.DESC =
        sorting[0] && sorting[0].desc ? IOrderBy.DESC : IOrderBy.ASC;
      if (colKey !== undefined && colKey !== null) {
        const keyMaybeNum = isNaN(Number(colKey)) ? colKey : Number(colKey);
        const col: any = columns?.find(
          (c: any) => c.accessorKey === colKey || c.id === keyMaybeNum,
        );
        if (col) {
          setPagination({ ...pagination, pageIndex: 0 });

          let sortBy = col.accessorKey;
          if (!BASE_COLUMNS_NAMES_ARRAY.includes(col.accessorKey)) {
            sortBy = col.innerName;
          }
          setSortBy(sortBy);
          const orderBy = colOrderBy ? colOrderBy : IOrderBy.ASC;
          setOrderBy(orderBy);

          const filter: SearchResponsesFilter = {
            form_id: form.id,
            pageSize: pagination.pageSize,
            pageNumber: 1,
            sortBy,
            orderBy: orderBy as IOrderBy.ASC | IOrderBy.DESC,
            searchFilters,
          };

          try {
            setCurrentFilterWithoutPagination(filter);
            const ans: any = await searchResponses(filter);
            setAllFilteredResponses(ans?.responses || []); // trust server ordering
          } catch (error) {
            showErrorNotification("שליפת התגובות נכשלה");
          } finally {
            setLoadingInsideTable(false);
          }
        }
      }
    }
  };

  const searchByColumn = async (
    createTableColumns: (form: any, permissionType: any, currentViewConfig?: ViewColumn[]) => void,
    columnFilters: any[],
    mainSearch,
  ) => {
    if (form) {
      let searchFilters: any[] = [];
      if (columnFilters && columnFilters[0]) {
        let newArr = getSearchFilters(columnFilters);
        searchFilters = getSearchFilters(newArr);
      }

      if (searchFilters.length === 0 && mainSearch !== "") {
        searchFilters.push({ searchField: "", searchText: mainSearch });
      }
      let filter: SearchResponsesFilter = {
        form_id: form.id,
        searchFilters,
        pageSize: pagination.pageSize,
        pageNumber: 1,
      };
      setLoadingInsideTable(true);
      setCurrentFilterWithoutPagination(filter);
      let ans: any = await searchResponses(filter);
      if (ans) {
        setAllFilteredResponses(ans.responses || []);
        setSearchCount(ans.countAllResponses || 0);
        createTableColumns(form, permissionTypes, currentViewConfig);
      }
      setLoadingInsideTable(false);
    }
  };

  const setCurrentFilterWithoutPagination = (filter: any) => {
    let newFilter;
    if (filter) {
      newFilter = { ...filter };
      delete newFilter.pageSize;
      delete newFilter.pageNumber;
    }
    setCurrentFilter(newFilter);
  };

  const isSynchedToMetro = (lastPushed: string, lastEdited: string) => {
    if (!lastPushed) return false;
    const lastPushedDate = moment(lastPushed);
    const lastEditedDate = moment(lastEdited);
    return lastPushedDate.isSameOrAfter(lastEditedDate);
  };

  const fileOnClickHandler = (file: any) => downloadFileFromResponse(file, id);

  const deleteSelectedResponses = async () => {
    const selectedIds = Object.keys(rowSelection)
      .map((k) => Number.parseInt(k, 10))
      .filter((n) => Number.isFinite(n));

    if (selectedIds.length === 0) return;

    setLoadingTable(true);

    try {
      await deleteMultipleResponses({
        form_id: form.id,
        response_ids: selectedIds,
      });

      setRowSelection({});
      setShouldRefreshPage(true);
    } catch (error) {
      showErrorNotification("מחיקת התגובות נכשלה");
    } finally {
      setLoadingTable(false);
    }
  };

  /** delete All Selected Responses */
  const deleteAllSelectedResponses = async () => {
    const keys = Object.keys(rowSelection);

    if (keys.length === 0) return;

    if (keys.length === 1) {
      const rowId = Number.parseInt(keys[0], 10);
      const response = allFilteredResponses.find((re) => re.id === rowId);
      if (response) {
        deleteResponseFromTable(response);
      }
      return;
    }

    setConfirmMsg("האם את/ה בטוח/ה שברצונך למחוק את התגובות?");
    setConfirmOkFunc(() => () => {
      void deleteSelectedResponses();
    });
    setShowConfirmMsg(true);
  };

  const editResponse = () => {
    const rowId = parseInt(Object.keys(rowSelection)[0]);
    let response = allFilteredResponses.find((re) => re.id === rowId);
    if (response) {
      navigate(`/response/edit/${form.id}/${response.id}`);
    }
  };

  const viewResponse = () => {
    const rowId = parseInt(Object.keys(rowSelection)[0]);
    let response = allFilteredResponses.find((re) => re.id === rowId);
    if (response) {
      navigate(`/response/view/${form.id}/${response.id}`);
    }
  };

  /** delete Response */
  const deleteResponseFromTable = async (item: any) => {
    if (item && item.id) {
      setConfirmMsg("האם את/ה בטוח/ה שברצונך למחוק את התגובה?");
      setConfirmOkFunc(() => () => {
        deleteResponseFromBtn(item);
      });
      setShowConfirmMsg(true);
    }
  };

  const deleteResponseFromBtn = async (item) => {
    try {
      setLoadingTable(true);
      await deleteResponse(item.form_id, item.id);
      setShouldRefreshPage(true);
    } catch (error) {
      showErrorNotification("מחיקת התגובה נכשלה"); //Failed to delete response:" + error);
    }
  };

  const deleteAllResponsesConfirmation = async () => {
    setConfirmMsg("האם את/ה בטוח/ה שברצונך למחוק את כל התגובות?");
    setConfirmOkFunc(() => () => {
      deleteAllResponseFromForm();
    });
    setShowDeleteAllConfirmPopup(true);
  };

  const deleteFormFromBtn = async () => {
    if (form.id) {
      setConfirmMsg("האם את/ה בטוח/ה שברצונך למחוק את הטופס?");
      setConfirmOkFunc(() => async () => {
        const currentUserLowerCaseUpn = user?.upn?.toLowerCase();
        const userName = getUserName(user.firstName, user.lastName);
        await deleteForm(form.id, { upn: currentUserLowerCaseUpn, userName: userName });
        let notInMainPage = location.pathname !== "/";
        if (notInMainPage) {
          navigate("/", { replace: true });
        }
        setConfirmBtnText("");
      });
      setConfirmBtnText("מחק טופס");

      setShowConfirmMsg(true);
    }
  };

  const deleteAllResponseFromForm = async () => {
    try {
      setLoadingTable(true);
      await deleteAllResponses(form.id);
      showSuccessNotification("מחיקת כל התגובות בוצעה בהצלחה");
      setShouldRefreshPage(true);
    } catch (error) {
      showErrorNotification("מחיקת התגובה נכשלה"); //Failed to delete response:" + error);
    }
  };

  return {
    loading,
    setLoading,
    loadingInsideTable,
    loadingTable,
    setLoadingTable,
    form,
    setForm,
    columns,
    setColumns,
    allFilteredResponses,
    setAllFilteredResponses,
    search,
    setSearch,
    allResponsesCount,
    setAllResponsesCount,
    firstRun,
    setFirstRun,
    searchCount,
    setSearchCount,
    showSharePopup,
    setShowSharePopup,
    showDeleteAllConfirmPopup,
    setShowDeleteAllConfirmPopup,
    searchByColumn,
    showConfirmMsg,
    setShowConfirmMsg,
    confirmMsg,
    confirmOkFunc,
    currentFilter,
    setCurrentFilter,
    setRowSelection,
    setLoadingInsideTable,
    rowSelection,
    changePageSizeAndRefreshTable,
    sorting,
    setSorting,
    doSearch,
    isSynchedToMetro,
    fileOnClickHandler,
    deleteAllResponsesConfirmation,
    searchBySorting,
    deleteAllSelectedResponses,
    editResponse,
    viewResponse,
    columnFilters,
    setColumnFilters,
    pagination,
    setPagination,
    mainSearch,
    setMainSearch,
    permissionTypes,
    setPermissionTypes,
    deleteFormFromBtn,
    confirmBtnText,
  };
};
