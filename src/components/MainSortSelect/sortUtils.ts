import { formsSortOption, FormsSortOption, sortDirectionOption, SortDirection } from "../../types/enums/filtersAndSorts.enum";

export type { FormsSortOption, SortDirection };

/**
 * Definition of a sorting configuration.
 */
export interface SortConfig {
  value: number;
  sortBy: FormsSortOption;
  sortDirection: SortDirection;
}

/**
 * List of all supported sorting configurations.
 * Acts as the single source of truth for sorting mappings.
 */
export const SORT_CONFIGS: readonly SortConfig[] = [
  { value: 1, sortBy: formsSortOption.CreatedAt, sortDirection: sortDirectionOption.Descending },
  { value: 2, sortBy: formsSortOption.CreatedAt, sortDirection: sortDirectionOption.Ascending },
  { value: 3, sortBy: formsSortOption.Name, sortDirection: sortDirectionOption.Ascending },
  { value: 4, sortBy: formsSortOption.Name, sortDirection: sortDirectionOption.Descending },
];

/**
 * Finds the sorting configuration for a given numeric value.
 */
export const getSortConfigByValue = (value: number): SortConfig | undefined => {
  return SORT_CONFIGS.find((config) => config.value === value);
};

/**
 * Finds the numeric value corresponding to a given sort field and direction.
 */
export const getSortValueByEnums = (sortBy: FormsSortOption, sortDirection: SortDirection): number => {
  const config = SORT_CONFIGS.find(
    (config) => config.sortBy === sortBy && config.sortDirection === sortDirection
  );
  return config ? config.value : 1; // Fallback to 1 (CreatedAt Descending)
};
