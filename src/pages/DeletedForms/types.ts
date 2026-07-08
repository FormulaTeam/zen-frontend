import { DeletedFormOverviewDto, FormOverviewDto } from "../../types/shared";
import { formsSortOption } from "../../types/enums/filtersAndSorts.enum";

export type DeletedFormWithResponses = (DeletedFormOverviewDto | FormOverviewDto) & {
  responses?: any[];
};

export interface DeletedFormsFilters {
  searchTerm: string;
  createdBySearch: string;
  deletedBySearch: string;
  hasResponsesFilter: boolean | undefined;
}

export interface DeletedFormsSort {
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export const sortOptions = [
  { label: "מועד מחיקה (חדש-ישן)", sortBy: formsSortOption.DeletedAt, direction: "desc" },
  { label: "מועד מחיקה (ישן-חדש)", sortBy: formsSortOption.DeletedAt, direction: "asc" },
  { label: "שם הטופס (א-ת)", sortBy: formsSortOption.Name, direction: "asc" },
  { label: "שם הטופס (ת-א)", sortBy: formsSortOption.Name, direction: "desc" },
];
