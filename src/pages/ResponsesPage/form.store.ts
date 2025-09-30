import { create } from "zustand";
import { Form } from "../../utils/interfaces";

interface FormsState {
  form: Form | null;
  setForm: (form: Form | null) => void;
  columns?: any[];
  permissions?: number[];
  setPermissions: (permissions: number[]) => void;
}

export const useFormStore = create<FormsState>((set) => ({
  form: null,
  setForm: (form: Form | null) => set({ form }),
  permissions: [],
  setPermissions: (permissions: number[]) => set({ permissions }),
}));
