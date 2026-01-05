import { z } from 'zod';
import { baseFieldSchema } from './base-field.schema';
import { OptionsFieldConfig } from '../field-config.types';

export const optionsFieldSchema = (config: OptionsFieldConfig = {}) => {
  const { options = [], multiSelect = false, dependencies, uniqueId } = config;

  if (!uniqueId) {
    throw new Error('optionsFieldSchema requires config.uniqueId');
  }

  const fieldSchema = baseFieldSchema(
    z.array(z.string()).superRefine((value, ctx) => {
      if (!Array.isArray(value)) {
        ctx.addIssue({
          code: 'custom',
          message:
            'הערך חייב להיות מתוך האפשרויות: ' + options.join(', '),
        });
        return;
      }

      if (!multiSelect && value.length !== 1) {
        ctx.addIssue({
          code: 'custom',
          message:
            'הערך חייב להיות אחד מהאפשרויות: ' + options.join(', '),
        });
      }

      value.forEach((v) => {
        if (!options.includes(v)) {
          ctx.addIssue({
            code: 'custom',
            message:
              'הערך חייב להיות מתוך מהאפשרויות: ' + options.join(', '),
          });
        }
      });
    }),
    config,
  );

  if (!dependencies) {
    return { fieldSchema };
  }

  const dependencyValidator = (
    row: Record<string, unknown>,
    ctx: z.RefinementCtx,
  ) => {
    const childRaw = row[uniqueId];
    const childValue = Array.isArray(childRaw) ? (childRaw as string[]) : [];

    const parentRaw = row[dependencies.parentFieldUniqueId];
    const parentValue = Array.isArray(parentRaw) ? (parentRaw as string[]) : [];

    childValue.forEach((childOption) => {
      const allowedParents = dependencies.rules[childOption];

      if (!allowedParents || allowedParents.length === 0) {
        return;
      }

      const satisfied = parentValue.some((p) => allowedParents.includes(p));

      if (!satisfied) {
        ctx.addIssue({
          code: 'custom',
          path: [uniqueId],
          message:
            (multiSelect
              ? 'הערך חייב להיות מתוך האפשרויות: '
              : 'הערך חייב להיות אחד מהאפשרויות: ') +
            options.join(', '),
        });
      }
    });
  };

  return { fieldSchema, dependencyValidator };
};
