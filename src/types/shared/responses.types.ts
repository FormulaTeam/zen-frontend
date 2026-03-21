import { z } from "zod";

import {
  BulkDeleteResponsesQuerySchema,
  CreateResponseSchema,
  ResponseFieldValueSchema,
  ResponseSchema,
  UpdateResponseSchema,
} from "formula-gear";

export type BulkDeleteResponsesQuery = z.infer<typeof BulkDeleteResponsesQuerySchema>;
export type CreateResponseDto = z.infer<typeof CreateResponseSchema>;
export type ResponseDto = z.infer<typeof ResponseSchema>;
export type ResponseFieldValueDto = z.infer<typeof ResponseFieldValueSchema>;
export type UpdateResponseDto = z.infer<typeof UpdateResponseSchema>;
