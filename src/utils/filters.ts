import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { Filter } from "./interfaces";

export const getSortedFilter = (newValueInt: number, filter: Filter) => {
  switch (newValueInt) {
    case 1: // "שם טופס א-ת"
      filter.sortBy = "name";
      filter.orderBy = IOrderBy.ASC;
      break;
    case 2: // "שם טופס ת-א"
      filter.sortBy = "name";
      filter.orderBy = IOrderBy.DESC;
      break;
    case 5: // "טפסים שנוצרו מהחדש לישן"
      filter.sortBy = "created";
      filter.orderBy = IOrderBy.DESC;
      break;
    case 6: // "טפסים שנוצרו מהישן לחדש"
      filter.sortBy = "created";
      filter.orderBy = IOrderBy.ASC;
      break;
    case 7: // "תגובות שנמחקו מהחדש לישן"
      filter.sortBy = "deleted";
      filter.orderBy = IOrderBy.DESC;
      break;
    case 8: // "תגובות שנמחקו מהישן לחדש"
      filter.sortBy = "deleted";
      filter.orderBy = IOrderBy.ASC;
      break;
    default:
      break;
  }

  return filter;
};
