import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import type { Filter } from "../../../utils/interfaces";

const STORAGE_KEY_PREFIX = "responses-color-filter";

type SetFilter = (
  update: Filter | null | ((previousFilter: Filter | null) => Filter | null),
) => void;

interface UseColorRuleFilterParams {
  formId?: number;
  activeRuleIds: readonly string[];
  areRulesLoaded: boolean;
  setFilter: SetFilter;
}

interface UseColorRuleFilterResult {
  selectedRuleIds: string[];
  setSelectedRuleIds: Dispatch<SetStateAction<string[]>>;
  hiddenRuleIdSet: ReadonlySet<string>;
  toggleRuleColor: (ruleId: string) => void;
  toggleAllColors: () => void;
}

const getStorageKey = (formId: number): string => `${STORAGE_KEY_PREFIX}:${formId}`;

const readSelectedRuleIds = (formId?: number): string[] => {
  if (formId === undefined) return [];

  try {
    const savedValue = localStorage.getItem(getStorageKey(formId));
    if (!savedValue) return [];

    const parsedValue: unknown = JSON.parse(savedValue);
    if (!Array.isArray(parsedValue)) return [];

    return [...new Set(parsedValue.filter((value): value is string => typeof value === "string"))];
  } catch {
    return [];
  }
};

const writeSelectedRuleIds = (formId: number, ruleIds: readonly string[]): void => {
  try {
    localStorage.setItem(getStorageKey(formId), JSON.stringify(ruleIds));
  } catch {
    // The filter remains usable when storage is disabled or unavailable.
  }
};

const haveSameIds = (
  first: readonly string[] | undefined,
  second: readonly string[] | undefined,
): boolean => {
  const firstValues = first ?? [];
  const secondValues = second ?? [];

  if (firstValues.length !== secondValues.length) return false;

  const secondSet = new Set(secondValues);
  return firstValues.every((value) => secondSet.has(value));
};

export const useColorRuleFilter = ({
  formId,
  activeRuleIds,
  areRulesLoaded,
  setFilter,
}: UseColorRuleFilterParams): UseColorRuleFilterResult => {
  const [selectedRuleIds, setSelectedRuleIds] = useState<string[]>(() =>
    readSelectedRuleIds(formId),
  );
  const [hiddenRuleIds, setHiddenRuleIds] = useState<string[]>([]);

  const activeRuleIdSet = useMemo(() => new Set(activeRuleIds), [activeRuleIds]);
  const hiddenRuleIdSet = useMemo(() => new Set(hiddenRuleIds), [hiddenRuleIds]);

  useEffect(() => {
    if (!areRulesLoaded) return;

    setSelectedRuleIds((previousRuleIds) => {
      const nextRuleIds = previousRuleIds.filter((ruleId) => activeRuleIdSet.has(ruleId));
      return haveSameIds(previousRuleIds, nextRuleIds) ? previousRuleIds : nextRuleIds;
    });

    setHiddenRuleIds((previousRuleIds) => {
      const nextRuleIds = previousRuleIds.filter((ruleId) => activeRuleIdSet.has(ruleId));
      return haveSameIds(previousRuleIds, nextRuleIds) ? previousRuleIds : nextRuleIds;
    });
  }, [activeRuleIdSet, areRulesLoaded]);

  useEffect(() => {
    if (!areRulesLoaded || formId === undefined) return;
    writeSelectedRuleIds(formId, selectedRuleIds);
  }, [areRulesLoaded, formId, selectedRuleIds]);

  useEffect(() => {
    if (!areRulesLoaded) return;

    const colorRuleIds = selectedRuleIds.length > 0 ? selectedRuleIds : undefined;

    setFilter((previousFilter) => {
      if (haveSameIds(previousFilter?.colorRuleIds, colorRuleIds)) return previousFilter;

      return {
        ...(previousFilter ?? {}),
        colorRuleIds,
        pageNumber: 1,
        before: undefined,
        after: undefined,
      };
    });
  }, [areRulesLoaded, selectedRuleIds, setFilter]);

  const toggleRuleColor = useCallback((ruleId: string) => {
    setHiddenRuleIds((previousRuleIds) =>
      previousRuleIds.includes(ruleId)
        ? previousRuleIds.filter((id) => id !== ruleId)
        : [...previousRuleIds, ruleId],
    );
  }, []);

  const toggleAllColors = useCallback(() => {
    setHiddenRuleIds((previousRuleIds) =>
      activeRuleIds.every((ruleId) => previousRuleIds.includes(ruleId)) ? [] : [...activeRuleIds],
    );
  }, [activeRuleIds]);

  return {
    selectedRuleIds,
    setSelectedRuleIds,
    hiddenRuleIdSet,
    toggleRuleColor,
    toggleAllColors,
  };
};
