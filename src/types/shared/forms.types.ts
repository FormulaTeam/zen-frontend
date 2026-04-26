import { z } from "zod";

import {
  CreateFormSchema,
  FormBaseSchema,
  FormFieldSchema,
  FormOverviewSchema,
  FormSchema,
  FormSectionSchema,
  GetFormsOverviewsQuerySchema,
  UpdateFormSchema,
} from "formula-gear";

export type FormDto = z.infer<typeof FormSchema>;
export type FormBaseDto = z.infer<typeof FormBaseSchema>;
export type CreateFormDto = z.infer<typeof CreateFormSchema>;
export type UpdateFormDto = z.infer<typeof UpdateFormSchema>;
export type FormOverviewDto = z.infer<typeof FormOverviewSchema>;
export type GetFormsOverviewsQueryDto = z.infer<typeof GetFormsOverviewsQuerySchema>;
export type FormFieldDto = z.infer<typeof FormFieldSchema>;
export type FormSectionDto = z.infer<typeof FormSectionSchema>;
export { MetaColumnIds } from "../../utils/interfaces";
