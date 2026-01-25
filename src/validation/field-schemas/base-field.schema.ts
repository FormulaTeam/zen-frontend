import { z } from "zod";
import { BaseFieldConfig } from "../field-config.types";

export const baseFieldSchema = <T extends z.ZodTypeAny>(type: T, config: BaseFieldConfig = {}) => {
  const { required = false } = config;

  const normalized = z.preprocess((v) => {
    if (v === "" || v === null) return undefined;
    return v;
  }, type.optional());

  return normalized.superRefine((value, ctx) => {
    if (required && (value === undefined || value === null)) {
      ctx.addIssue({
        code: "custom",
        message: "שדה זה הינו שדה חובה",
      });
    }
  });
};
