import { z } from "zod";
import { baseFieldSchema } from "./base-field.schema";

export type SubformFieldConfig = {
  required?: boolean;
};

const isPlainObject = (val: unknown): val is Record<string, unknown> =>
  typeof val === "object" && val !== null && !Array.isArray(val);

export const subformFieldSchema = <T extends z.ZodTypeAny>(
  innerResponseSchema: T,
  config: SubformFieldConfig = {},
) => {
  const schema = z.preprocess((input, ctx) => {
    if (input == null || input === "") return undefined;

    if (!isPlainObject(input)) {
      ctx.addIssue({
        code: "custom",
        message: 'סוג קלט לא חוקי',
      });
      return z.NEVER;
    }

    return input;
  }, innerResponseSchema.optional());

  return baseFieldSchema(schema, config);
};
