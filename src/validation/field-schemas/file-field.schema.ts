import { z } from 'zod';
import { baseFieldSchema } from './base-field.schema';
import { FileFieldConfig } from '../field-config.types';

export const fileFieldSchema = (config: FileFieldConfig = {}) => {
  const schema = z
    .object({
      files: z
        .array(
          z.object({
            name: z.string(),
            url: z.string().refine(
              (v) => {
                try {
                  new URL(v);
                  return true;
                } catch {
                  return false;
                }
              },
              { message: 'כתובת ה-URL של הקובץ אינה חוקית' },
            ),
          }),
        )
        .optional(),
    })
    .superRefine((value, ctx) => {
      if (!value.files) return;

      value.files.forEach((f, i) => {
        if (!f.name?.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['files', i, 'name'],
            message: 'שם הקובץ אינו חוקי',
          });
        }
        if (!f.url?.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: ['files', i, 'url'],
            message: 'כתובת ה-URL של הקובץ אינה חוקית',
          });
        }
      });
    });

  return baseFieldSchema(schema, config);
};
