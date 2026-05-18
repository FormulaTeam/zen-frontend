import { z } from "zod";

import {
  BulkDeleteResponsesQuerySchema,
  ResponseFieldValueSchema,
  ResponseSchema,
  ResponseFieldFilterSchema,
  ResponseFiltersSchema,
} from "formula-gear";

export type ParentResponseDto = {
  responseId: string;
};

export type BulkDeleteResponsesQuery = z.infer<typeof BulkDeleteResponsesQuerySchema>;

export type CreateResponseDto = {
  fieldValues: ResponseFieldValueDto[];
  parentResponse?: ParentResponseDto;
};

export type ResponseDto = z.infer<typeof ResponseSchema>;
export type ResponseFieldValueDto = z.infer<typeof ResponseFieldValueSchema>;

export type ResponseFieldFilterDto = z.infer<typeof ResponseFieldFilterSchema>;
export type ResponseFiltersDto = z.infer<typeof ResponseFiltersSchema>;

export type UpdateOneResponseDto = {
  responseId: string;
  fieldValues: ResponseFieldValueDto[];
};

export type BulkUpdateResponsesDto = {
  responses: UpdateOneResponseDto[];
};
