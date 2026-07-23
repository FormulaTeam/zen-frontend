import { z } from "zod";

import {
  BulkDeleteResponsesQuerySchema,
  ResponseFieldValueSchema,
  ResponseSchema,
  ResponseFieldFilterSchema,
  ResponseFiltersSchema,
  ResponseMetaFieldSchema,
} from "formula-gear";

export type ParentResponseDto = {
  responseId: string;
};

export type BulkDeleteResponsesQuery = z.infer<typeof BulkDeleteResponsesQuerySchema>;

export type CreateResponseDto = {
  fieldValues: ResponseFieldValueDto[];
  parentResponse?: ParentResponseDto;
};

export type CreateResponseFileAttachmentDto = {
  responseIndex: number;
  fieldId: string;
  fileIndex: number;
};

export type ResponseDto = z.infer<typeof ResponseSchema>;
export type ResponseFieldValueDto = z.infer<typeof ResponseFieldValueSchema>;

export type ResponseFieldFilterDto = z.infer<typeof ResponseFieldFilterSchema>;
export type ResponseFiltersDto = z.infer<typeof ResponseFiltersSchema>;
export type ResponseMetaField = z.infer<typeof ResponseMetaFieldSchema>;
export type ResponsesTableColorRuleColor =
  | "red"
  | "lightRed"
  | "orange"
  | "lightOrange"
  | "blue"
  | "lightBlue"
  | "green"
  | "lightGreen";

export type ResponsesTableColorRuleDto = {
  id: string;
  formId?: number;
  fieldId: string;
  fieldType: number;
  comparatorId: number;
  targetValue?: unknown;
  color: ResponsesTableColorRuleColor;
  targetType: "cell" | "row";
  order: number;
  isActive: boolean;
};

export type UpdateOneResponseDto = {
  responseId: string;
  fieldValues: ResponseFieldValueDto[];
};

export type BulkUpdateResponsesDto = {
  responses: UpdateOneResponseDto[];
};
