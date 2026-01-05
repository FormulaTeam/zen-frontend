import { z } from 'zod';
import { BaseFieldConfig } from '../field-config.types';

export const baseFieldSchema = <T extends z.ZodTypeAny>(
  type: T,
  config: BaseFieldConfig = {},
) => {
  const { required = false } = config;

  return type.optional().superRefine((value, ctx) => {
    if (required && (value === undefined || value === null)) {
      ctx.addIssue({
        code: 'custom',
        message: 'שדה זה הינו שדה חובה',
      });
    }
  });
};
