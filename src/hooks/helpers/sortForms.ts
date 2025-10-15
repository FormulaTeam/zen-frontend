import { Form } from "../../utils/interfaces";

const toLower = (v: any) => (v == null ? "" : String(v).toLowerCase());

export const sortForms = (
  forms: Form[],
  sortBy: string = "name",
  orderBy: "ASC" | "DESC" = "ASC",
): Form[] => {
  return forms.sort((a: any, b: any) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return orderBy === "ASC" ? -1 : 1;
    if (bVal == null) return orderBy === "ASC" ? 1 : -1;

    if (typeof aVal === "number" && typeof bVal === "number") {
      return orderBy === "ASC" ? aVal - bVal : bVal - aVal;
    }

    const aDate = aVal instanceof Date ? aVal : new Date(aVal);
    const bDate = bVal instanceof Date ? bVal : new Date(bVal);
    if (!isNaN(aDate.getTime()) && !isNaN(bDate.getTime())) {
      return orderBy === "ASC"
        ? aDate.getTime() - bDate.getTime()
        : bDate.getTime() - aDate.getTime();
    }

    const aStr = toLower(aVal);
    const bStr = toLower(bVal);
    if (aStr < bStr) return orderBy === "ASC" ? -1 : 1;
    if (aStr > bStr) return orderBy === "ASC" ? 1 : -1;
    return 0;
  });
};
