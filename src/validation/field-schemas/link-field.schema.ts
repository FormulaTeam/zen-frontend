import { z } from 'zod';
import { baseFieldSchema } from './base-field.schema';
import { LinkFieldConfig } from '../field-config.types';

export const linkFieldSchema = (config: LinkFieldConfig = {}) => {
  const invalid = 'פורמט קישור לא חוקי';

  const schema = z
    .object({
      link: z
        .string()
        .refine(
          (v) => {
            try {
              new URL(v);
              return true;
            } catch {
              return false;
            }
          },
          { message: invalid },
        )
        .nullable(),
      linkTxt: z.string().nullable(),
    })
    .superRefine((value, ctx) => {
      const hasLink = !!value.link?.trim();
      const hasText = !!value.linkTxt?.trim();

      if (hasLink !== hasText) {
        ctx.addIssue({
          code: 'custom',
          path: hasLink ? ['linkTxt'] : ['link'],
          message: invalid,
        });
      }
    });

  return baseFieldSchema(schema, config);
};
