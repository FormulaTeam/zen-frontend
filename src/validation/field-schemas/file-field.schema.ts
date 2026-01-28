import { z } from "zod";
import { baseFieldSchema } from "./base-field.schema";
import { FileFieldConfig } from "../field-config.types";

export const fileFieldSchema = (config: FileFieldConfig = {}) => {
  const { required = false } = config;

  const schema = z
    .object({
      files: z.array(
        z.object({
          name: z.string().trim().min(1, "שם הקובץ אינו חוקי"),
          url: z
            .string()
            .trim()
            .min(1, "כתובת ה-URL של הקובץ אינה חוקית")
            .refine(
              (v) => {
                try {
                  new URL(v);
                  return true;
                } catch {
                  return false;
                }
              },
              { message: "כתובת ה-URL של הקובץ אינה חוקית" },
            ),
        }),
      ),
    })
    .superRefine((value, ctx) => {
      if (required && (!value.files || value.files.length === 0)) {
        ctx.addIssue({
          code: "custom",
          path: ["files"],
          message: "שדה זה הינו שדה חובה",
        });
      }
    });

  return baseFieldSchema(schema, config);
};
