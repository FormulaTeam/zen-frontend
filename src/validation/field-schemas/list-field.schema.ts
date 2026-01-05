import { z } from 'zod';
import { baseFieldSchema } from './base-field.schema';
import { ListFieldConfig } from '../field-config.types';

export const listFieldSchema = (config: ListFieldConfig = {}) => {
  const { minItems, maxItems } = config;

  const schema = z.array(z.string()).superRefine((value, ctx) => {
    if (minItems !== undefined && value.length < minItems) {
      ctx.addIssue({
        code: 'custom',
        message: 'מספר הפריטים המינימלי לא הושג',
      });
    }

    if (maxItems !== undefined && value.length > maxItems) {
      ctx.addIssue({
        code: 'custom',
        message: 'מספר הפריטים המקסימלי הושג',
      });
    }
  });

  return baseFieldSchema(schema, config);
};
