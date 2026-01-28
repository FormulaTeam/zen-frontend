import { z } from "zod";
import { baseFieldSchema } from "./base-field.schema";
import { LinkFieldConfig } from "../field-config.types";

export const linkFieldSchema = (config: LinkFieldConfig = {}) => {
  const invalid = "פורמט קישור לא חוקי";
  const requiredMsg = "שדה זה הינו חובה";

  const emptyToUndefined = z.preprocess((v) => {
    if (v === "" || v === null) return undefined;
    return v;
  }, z.string().trim().optional());

  const schema = z
    .object({
      link: emptyToUndefined.refine(
        (v) => {
          if (!v) return true;
          try {
            new URL(v);
            return true;
          } catch {
            return false;
          }
        },
        { message: invalid },
      ),
      linkTxt: emptyToUndefined,
    })
    .superRefine((value, ctx) => {
      const hasLink = !!value.link?.trim();
      const hasText = !!value.linkTxt?.trim();

      if (config?.required && !hasLink) {
        ctx.addIssue({
          code: "custom",
          path: ["link"],
          message: requiredMsg,
        });
        return;
      }

      if (hasText && !hasLink) {
        ctx.addIssue({
          code: "custom",
          path: ["link"],
          message: invalid,
        });
      }
    });

  return baseFieldSchema(schema, config);
};
