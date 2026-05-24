import { formsSortOption, FormsSortOption, sortDirectionOption, SortDirection } from "../../types/enums/filtersAndSorts.enum";

export type { FormsSortOption, SortDirection };

export const sortValueToEnums: Record<number, { sortBy: FormsSortOption; sortDirection: SortDirection }> = {
  1: { sortBy: formsSortOption.Name, sortDirection: sortDirectionOption.Ascending },
  2: { sortBy: formsSortOption.Name, sortDirection: sortDirectionOption.Descending },
  5: { sortBy: formsSortOption.CreatedAt, sortDirection: sortDirectionOption.Descending },
  6: { sortBy: formsSortOption.CreatedAt, sortDirection: sortDirectionOption.Ascending },
};
