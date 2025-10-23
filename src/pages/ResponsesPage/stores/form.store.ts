import { create } from "zustand";
import { Form } from "../../../utils/interfaces";
import { LegacyPermission } from "../../../utils/utils";

interface FormsState {
  form: Form | null;
  setForm: (form: Form | null) => void;
  columns?: any[];
  permissions?: LegacyPermission[];
  setPermissions: (permissions: number[]) => void;
}

export const useInitiateFormStore = create<FormsState>((set) => ({
  form: null,
  setForm: (form: Form | null) => set({ form }),
  permissions: [],
  setPermissions: (permissions: number[]) => set({ permissions }),
}));

export function useFormStore() {
  const store = useInitiateFormStore((state) => state);

  if (!store.form || !store.permissions) {
    throw new Error("form has not been loaded.");
  }

  return {
    form: store.form,
    permissions: store.permissions,
    setForm: store.setForm,
    setPermissions: store.setPermissions,
  };
}
