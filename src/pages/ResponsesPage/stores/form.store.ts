import { GridColDef } from "@mui/x-data-grid-pro";
import { create } from "zustand";

import { FormDto } from "../../../types/shared";
import { Filter, ResponseForm, Row } from "../../../utils/interfaces";
import { LegacyPermission } from "../../../utils/utils";

export type StoreForm = FormDto & {
  columns?: GridColDef[];
  metro_access_url?: string | null;
  oasisSourceKey?: string | null;
};

interface FormsState {
  form: StoreForm | null;
  setForm: (form: StoreForm | null) => void;
  permissions?: LegacyPermission[];
  setPermissions: (permissions: number[]) => void;
  responses: ResponseForm[] | null;
  setResponses: (responses: ResponseForm[] | null) => void;
  filter: Filter | null;
  setFilter: (filter: Filter | null) => void;
  rows: Row[];
  setRows: (rows: Row[]) => void;
  isRowsLoading?: boolean;
}

export const useInitiateFormStore = create<FormsState>((set) => ({
  form: null,
  setForm: (form: StoreForm | null) => set({ form }),
  permissions: [],
  setPermissions: (permissions: number[]) => set({ permissions }),
  responses: null,
  setResponses: (responses: ResponseForm[] | null) => set({ responses }),
  filter: { pageSize: 25, pageNumber: 1 },
  setFilter: (filter: Filter | null) => set({ filter }),
  rows: [],
  setRows: (rows: Row[]) => set({ rows }),
}));

export function useFormStore() {
  const store = useInitiateFormStore();

  if (!store.form || !store.permissions) throw new Error("form has not been loaded.");

  return {
    form: store.form,
    permissions: store.permissions,
    setForm: store.setForm,
    setPermissions: store.setPermissions,
    responses: store.responses,
    setResponses: store.setResponses,
    filter: store.filter,
    setFilter: store.setFilter,
    rows: store.rows,
    setRows: store.setRows,
    isRowsLoading: store.isRowsLoading,
  };
}
