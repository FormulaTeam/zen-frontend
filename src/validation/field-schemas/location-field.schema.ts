import { z } from 'zod';
import { baseFieldSchema } from './base-field.schema';
import { LocationFieldConfig } from '../field-config.types';

export const locationFieldSchema = (config: LocationFieldConfig) => {
  const { coordinateType } = config;

  const schema = z
    .object({
      x: z.string().min(1, 'פורמט קואורדינטות לא חוקי'),
      y: z.string().min(1, 'פורמט קואורדינטות לא חוקי'),
    })
    .optional()
    .superRefine((val, ctx) => {
      if (!val) return;
      const { x, y } = val;

      if (coordinateType === 'UTM') {
        const valid6 = (s: string) => /^\d{6}$/.test(s);

        if (!valid6(x)) {
          ctx.addIssue({
            code: 'custom',
            path: ['x'],
            message: 'אורך X חייב להיות בפורמט UTM',
          });
        }

        if (!valid6(y)) {
          ctx.addIssue({
            code: 'custom',
            path: ['y'],
            message: 'אורך Y חייב להיות בפורמט UTM',
          });
        }

        return;
      }

      if (coordinateType === 'WKT') {
        const validWkt = (s: string) => /^\d{2}\.\d{6}$/.test(s);

        if (!validWkt(x)) {
          ctx.addIssue({
            code: 'custom',
            path: ['x'],
            message: 'אורך X חייב להיות בפורמט WKT',
          });
        }

        if (!validWkt(y)) {
          ctx.addIssue({
            code: 'custom',
            path: ['y'],
            message: 'אורך Y חייב להיות בפורמט WKT',
          });
        }

        return;
      }
    });

  return baseFieldSchema(schema, config);
};
