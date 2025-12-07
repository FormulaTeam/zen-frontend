import { useQuery } from "@tanstack/react-query";
import { getResponses, getResponsesCount } from "../api";
import { ResponseForm } from "../utils/interfaces";

interface ResponsesQueryParams {
  formId?: number;
  pageIndex: number;
  pageSize: number;
  searchFilters?: any[];
}

interface ResponsesQueryResult {
  count: number;
  responses: ResponseForm[];
}

export const useResponsesQuery = ({
  formId,
  pageIndex,
  pageSize,
  searchFilters = [],
}: ResponsesQueryParams) => {
  return useQuery<ResponsesQueryResult, Error>({
    queryKey: ["responses", formId, pageIndex, pageSize, searchFilters],
    enabled: !!formId,
    queryFn: async () => {
      if (!formId) {
        return { count: 0, responses: [] };
      }

      const [countRes, responses] = await Promise.all([
        getResponsesCount(formId),
        getResponses({
          form_id: formId,
          pageSize,
          pageNumber: pageIndex + 1,
          searchFilters,
        }),
      ]);

      return {
        count: countRes?.count ?? 0,
        responses: Array.isArray(responses) ? responses : [],
      };
    },
  });
};
