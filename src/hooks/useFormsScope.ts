import { useState, useEffect, useCallback } from "react";
import { formsScopeOption, FormsScopeOption } from "../types/enums/filtersAndSorts.enum";

interface UseFormsScopeParams {
  isSuperAdmin: boolean;
}

const STORAGE_KEY = "formula_forms_scope";

export function useFormsScope({ isSuperAdmin }: UseFormsScopeParams) {
  const [scope, setScopeState] = useState<FormsScopeOption>(formsScopeOption.AccessibleForms);

  useEffect(() => {
    const storedScope = localStorage.getItem(STORAGE_KEY) as FormsScopeOption | null;

    if (storedScope) {
      if (storedScope === formsScopeOption.AllForms && !isSuperAdmin) {
        setScopeState(formsScopeOption.AccessibleForms);
        localStorage.setItem(STORAGE_KEY, formsScopeOption.AccessibleForms);
      } else if (Object.values(formsScopeOption).includes(storedScope)) {
        setScopeState(storedScope);
      } else {
        setScopeState(formsScopeOption.AccessibleForms);
        localStorage.setItem(STORAGE_KEY, formsScopeOption.AccessibleForms);
      }
    } else {
      setScopeState(formsScopeOption.AccessibleForms);
    }
  }, [isSuperAdmin]);

  const setScope = useCallback((newScope: FormsScopeOption) => {
    setScopeState(newScope);
    localStorage.setItem(STORAGE_KEY, newScope);
  }, []);

  return { scope, setScope };
}
