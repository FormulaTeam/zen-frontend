import { GridColDef } from "@mui/x-data-grid-pro";
import { create } from "zustand";

import { FormDto, FormFieldDto, ResponseFiltersDto } from "../../../types/shared";
import { Filter, PageInfo, ResponseForm, Row } from "../../../utils/interfaces";
import { Permission } from "formula-gear";
import { IOrderBy } from "../../../types/enums/filtersAndSorts.enum";

export type StoreForm = FormDto & {
  fields: FormFieldDto[];
  columns?: GridColDef[];
  responsesCount?: number;
  lastInteractionAt?: string | null;
  metro_access_url?: string | null;
  oasisSourceKey?: string | null;
};

const defaultFilter: Filter = {
  pageSize: 25,
  pageNumber: 1,
  sortBy: "meta:index",
  orderBy: IOrderBy.DESC,
};

interface FormsState {
  form: StoreForm | null;
  setForm: (form: StoreForm | null) => void;
  permissions?: Permission[];
  setPermissions: (permissions: Permission[]) => void;
  responses: ResponseForm[] | null;
  setResponses: (responses: ResponseForm[] | null) => void;
  filter: Filter | null;
  setFilter: (update: Filter | null | ((prev: Filter | null) => Filter | null)) => void;
  setResponseFilters: (responseFilters: ResponseFiltersDto | null) => void;
  rows: Row[];
  setRows: (rows: Row[]) => void;
  isRowsLoading: boolean;
  setIsRowsLoading: (isLoading: boolean) => void;
  pageInfo: PageInfo | null;
  setPageInfo: (pageInfo: PageInfo | null) => void;
}

export const useInitiateFormStore = create<FormsState>((set) => ({
  form: null,
  setForm: (form: StoreForm | null) => set({ form }),

  permissions: [],
  setPermissions: (permissions: Permission[]) => set({ permissions }),

  responses: null,
  setResponses: (responses: ResponseForm[] | null) => set({ responses }),

  filter: defaultFilter,

  setFilter: (update: Filter | null | ((prev: Filter | null) => Filter | null)) =>
    set((state) => ({
      filter: typeof update === "function" ? update(state.filter) : update,
      isRowsLoading: true,
    })),

  setResponseFilters: (responseFilters: ResponseFiltersDto | null) =>
    set((state) => ({
      filter: {
        ...(state.filter ?? defaultFilter),
        responseFilters: responseFilters?.items?.length ? responseFilters : undefined,
        before: undefined,
        after: undefined,
        pageNumber: 1,
      },
      isRowsLoading: true,
    })),

  rows: [],
  setRows: (rows: Row[]) => set({ rows }),

  isRowsLoading: false,
  setIsRowsLoading: (isRowsLoading: boolean) => set({ isRowsLoading }),

  pageInfo: null,
  setPageInfo: (pageInfo: PageInfo | null) => set({ pageInfo }),
}));

export function useFormStore() {
  const store = useInitiateFormStore();

  return {
    form: store.form,
    permissions: store.permissions,
    setForm: store.setForm,
    setPermissions: store.setPermissions,
    responses: store.responses,
    setResponses: store.setResponses,
    filter: store.filter,
    setFilter: store.setFilter,
    setResponseFilters: store.setResponseFilters,
    rows: store.rows,
    setRows: store.setRows,
    isRowsLoading: store.isRowsLoading,
    setIsRowsLoading: store.setIsRowsLoading,
    pageInfo: store.pageInfo,
    setPageInfo: store.setPageInfo,
  };
}
