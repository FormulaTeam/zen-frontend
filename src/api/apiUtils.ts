import { Filter } from "../utils/interfaces";
import { IOrderBy } from "../types/enums/filtersAndSorts.enum";

export const mapFilterToApiParams = (filter?: Filter) => {
  if (!filter) return {};

  return {
    search: filter.query,
    sortBy: filter.sortBy,
    sortDirection: filter.orderBy === IOrderBy.DESC ? "desc" : "asc",
    limit: filter.pageSize,
    offset:
      filter.pageNumber !== undefined && filter.pageSize !== undefined
        ? (filter.pageNumber - 1) * filter.pageSize
        : undefined,
    createdBy: filter.createdBy,
    deletedBy: filter.deletedBy,
    hasResponses: filter.hasResponses,
  };
};
