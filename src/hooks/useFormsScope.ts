import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { formsScopeOption, FormsScopeOption } from "../types/enums/filtersAndSorts.enum";

interface UseFormsScopeParams {
  isSuperAdmin: boolean;
}

const STORAGE_KEY = "formula-forms-scope";

const allowedScopes: FormsScopeOption[] = [
  formsScopeOption.MyForms,
  formsScopeOption.SharedWithMeForms,
];

const normalizeScope = (scope: FormsScopeOption | null): FormsScopeOption => {
  if (scope && allowedScopes.includes(scope)) {
    return scope;
  }

  return formsScopeOption.MyForms;
};

export function useFormsScope({ isSuperAdmin: _isSuperAdmin }: UseFormsScopeParams) {
  const [searchParams, setSearchParams] = useSearchParams();
  const scopeParam = searchParams.get("scope") as FormsScopeOption | null;

  const getInitialScope = (): FormsScopeOption => {
    const urlScope = normalizeScope(scopeParam);

    if (scopeParam && urlScope === scopeParam) {
      return urlScope;
    }

    const storedScope = sessionStorage.getItem(STORAGE_KEY) as FormsScopeOption | null;

    return normalizeScope(storedScope);
  };

  const [scope, setScopeState] = useState<FormsScopeOption>(getInitialScope());

  useEffect(() => {
    const activeScope =
      scopeParam ?? (sessionStorage.getItem(STORAGE_KEY) as FormsScopeOption | null);

    const nextScope = normalizeScope(activeScope);

    setScopeState(nextScope);
    sessionStorage.setItem(STORAGE_KEY, nextScope);

    if (scopeParam && scopeParam !== nextScope) {
      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          updated.set("scope", nextScope);
          return updated;
        },
        { replace: true },
      );
    }
  }, [scopeParam, setSearchParams]);

  const setScope = useCallback(
    (newScope: FormsScopeOption) => {
      const nextScope = normalizeScope(newScope);

      setScopeState(nextScope);
      sessionStorage.setItem(STORAGE_KEY, nextScope);

      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          updated.set("scope", nextScope);
          return updated;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  return { scope, setScope };
}
