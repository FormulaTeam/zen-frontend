import { IOrderBy } from "../types/enums/filtersAndSorts.enum";
import { Filter } from "./interfaces";

export const getSortedFilter = (newValueInt: number, filter: Filter) => {
  switch (newValueInt) {
    case 1: // "שם טופס א-ת"
      filter.sortBy = "meta:name";
      filter.orderBy = IOrderBy.ASC;
      break;
    case 2: // "שם טופס ת-א"
      filter.sortBy = "meta:name";
      filter.orderBy = IOrderBy.DESC;
      break;
    case 5: // "טפסים שנוצרו מהחדש לישן"
      filter.sortBy = "meta:created_at";
      filter.orderBy = IOrderBy.DESC;
      break;
    case 6: // "טפסים שנוצרו מהישן לחדש"
      filter.sortBy = "meta:created_at";
      filter.orderBy = IOrderBy.ASC;
      break;
    case 7: // "תגובות שנמחקו מהחדש לישן"
      filter.sortBy = "meta:created_at";
      filter.orderBy = IOrderBy.DESC;
      break;
    case 8: // "תגובות שנמחקו מהישן לחדש"
      filter.sortBy = "meta:created_at";
      filter.orderBy = IOrderBy.ASC;
      break;
    default:
      break;
  }

  return filter;
};
