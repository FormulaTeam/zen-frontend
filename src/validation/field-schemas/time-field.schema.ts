import { z } from "zod";
import { baseFieldSchema } from "./base-field.schema";
import { TimeFieldConfig } from "../field-config.types";

export const timeFieldSchema = (config: TimeFieldConfig = {}) => {
  const { showSeconds = false } = config;

  const schema = z
    .string()
    .refine((value) => /^([0-1]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value), "פורמט זמן לא חוקי")
    .superRefine((value, ctx) => {
      const hasSeconds = value.length === 8;
      if (!showSeconds && hasSeconds) {
        ctx.addIssue({ code: "custom", message: "פורמט זמן לא חוקי" });
      }
    })
    .transform((value) => {
      if (showSeconds && value.length === 5) return `${value}:00`;
      return value;
    });

  return baseFieldSchema(schema, config);
};
