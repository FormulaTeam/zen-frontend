import { Form } from "../../utils/interfaces";

/**
 * Client-side pagination
 * @param forms - full array of forms
 * @param pageNumber - 1-based page number
 * @param pageSize - items per page
 * @returns paginated array of forms
 */
export const paginateForms = (
  forms: Form[],
  pageNumber: number = 1,
  pageSize: number = 24
): Form[] => {
  if (!forms || forms.length === 0) return [];
  const start = (pageNumber - 1) * pageSize;
  return forms.slice(start, start + pageSize);
};
