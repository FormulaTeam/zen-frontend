// src/validation/field-schemas/form-field.schema.ts
import { z } from "zod";
import type { SchemaFactoryContext, SchemaFactoryResult } from "../field-type-map";
import type { FormFieldConfig } from "../field-config.types";

/**
 * typeId=12 ("form inside form")
 *
 * Rules:
 * - This field is NEVER required.
 * - Value is optional.
 * - If present, it must be an array of nested row objects: 0..N
 * - Each item (if any) must be a plain object (not array).
 * - Recursively validates each nested row using the connected form definition.
 */
export function formFieldSchema(
  config: FormFieldConfig,
  ctx?: SchemaFactoryContext,
): SchemaFactoryResult {
  const fieldSchema = z
    .array(z.any())
    .optional()
    .superRefine(async (value, refineCtx) => {
      if (value === undefined || value === null) return;

      if (!Array.isArray(value)) {
        refineCtx.addIssue({
          code: "custom",
          path: [],
          message: `${config.displayName ?? "Nested form"} must be an array`,
          input: value,
        });
        return;
      }

      if (value.length === 0) return;

      if (!ctx) {
        refineCtx.addIssue({
          code: "custom",
          path: [],
          message: `${config.displayName ?? "Nested form"}: missing validation context`,
          input: value,
        });
        return;
      }

      const connectedFormId = config.connectedFormId;
      if (!connectedFormId) {
        refineCtx.addIssue({
          code: "custom",
          path: [],
          message: `${config.displayName ?? "Nested form"}: connectedFormId is missing`,
          input: value,
        });
        return;
      }

      if (ctx.ancestorFormIds.includes(connectedFormId)) {
        refineCtx.addIssue({
          code: "custom",
          path: [],
          message: `${config.displayName ?? "Nested form"}: circular nested form reference`,
          input: value,
        });
        return;
      }

      const nestedForm = await ctx.fetchFormById(connectedFormId);
      if (!nestedForm) {
        refineCtx.addIssue({
          code: "custom",
          path: [],
          message: `${config.displayName ?? "Nested form"}: failed to load connected form`,
          input: value,
        });
        return;
      }

      // Validate each nested row
      for (let i = 0; i < value.length; i++) {
        const item = value[i];

        if (!item || typeof item !== "object" || Array.isArray(item)) {
          refineCtx.addIssue({
            code: "custom",
            path: [i],
            message: `${config.displayName ?? "Nested form"}[${i}] must be an object`,
            input: item,
          });
          continue;
        }

        const nestedRow = item as Record<string, unknown>;

        const { schema: nestedSchema } = await ctx.buildDynamicRowSchema(
          nestedForm,
          nestedRow,
          ctx.fetchFormById,
          [...ctx.ancestorFormIds, connectedFormId],
        );

        const nestedRes = await nestedSchema.safeParseAsync(nestedRow);
        if (!nestedRes.success) {
          nestedRes.error.issues.forEach((issue) => {
            refineCtx.addIssue({
              ...issue,
              path: [i, ...(issue.path ?? [])],
            });
          });
        }
      }
    });

  return { fieldSchema };
}
