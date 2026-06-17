import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { formsScopeOption, FormsScopeOption } from "../types/enums/filtersAndSorts.enum";

interface UseFormsScopeParams {
  isSuperAdmin: boolean;
}

const STORAGE_KEY = "formula-forms-scope";

export function useFormsScope({ isSuperAdmin }: UseFormsScopeParams) {
  const [searchParams, setSearchParams] = useSearchParams();
  const scopeParam = searchParams.get("scope") as FormsScopeOption | null;

  // Resolve initial scope: URL parameter takes highest precedence, then sessionStorage, then fallback
  const getInitialScope = (): FormsScopeOption => {
    if (scopeParam && Object.values(formsScopeOption).includes(scopeParam)) {
      return scopeParam;
    }
    const storedScope = sessionStorage.getItem(STORAGE_KEY) as FormsScopeOption | null;
    if (storedScope && Object.values(formsScopeOption).includes(storedScope)) {
      return storedScope;
    }
    return formsScopeOption.AccessibleForms;
  };

  const [scope, setScopeState] = useState<FormsScopeOption>(getInitialScope());

  // Sync state with URL scope query parameters
  useEffect(() => {
    let activeScope = scopeParam;
    if (!activeScope) {
      activeScope = sessionStorage.getItem(STORAGE_KEY) as FormsScopeOption | null;
    }

    if (activeScope) {
      if (activeScope === formsScopeOption.AllForms && !isSuperAdmin) {
        setScopeState(formsScopeOption.AccessibleForms);
        sessionStorage.setItem(STORAGE_KEY, formsScopeOption.AccessibleForms);
      } else if (Object.values(formsScopeOption).includes(activeScope)) {
        setScopeState(activeScope);
      }
    }
  }, [scopeParam, isSuperAdmin]);

  const setScope = useCallback((newScope: FormsScopeOption) => {
    setScopeState(newScope);
    sessionStorage.setItem(STORAGE_KEY, newScope);

    // Sync to URL
    setSearchParams((prev) => {
      const updated = new URLSearchParams(prev);
      updated.set("scope", newScope);
      return updated;
    }, { replace: true });
  }, [setSearchParams]);

  return { scope, setScope };
}
