import { latitudeRegexX, latitudeRegexY, urlRegex, wktLatitudeRegexY, wktLongitudeRegexX } from "../../utils/utils";
import { z } from "zod";

export function buildLinkSchema(required: boolean) {
  return z
    .object({
      link: z.string().optional(),
      linkTxt: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      const link = val.link || "";
      const linkTxt = val.linkTxt || "";
      const hasLink = !!link;
      const hasLinkTxt = !!linkTxt;

      if (!hasLink || !hasLinkTxt) {
        if (required) {
          if (!hasLink) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["link"],
              message: "link required",
            });
          }
          if (!hasLinkTxt) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["linkTxt"],
              message: "linkTxt required",
            });
          }
        } else {
          if (hasLink && !urlRegex.test(link)) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["link"],
              message: "invalid url",
            });
          }
          if (hasLink && !hasLinkTxt) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["linkTxt"],
              message: "linkTxt required when link exists",
            });
          }
          if (hasLinkTxt && !hasLink) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              path: ["link"],
              message: "link required when linkTxt exists",
            });
          }
        }
        return;
      }
      if (!urlRegex.test(link)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["link"],
          message: "invalid url",
        });
      }
    });
}

export function buildLocationSchema(
  required: boolean,
  coordinateType: "UTM" | "WKT" | undefined
) {
  const coordType = coordinateType || "UTM";

  return z
    .object({
      x: z.string().optional(),
      y: z.string().optional(),
    })
    .superRefine((val, ctx) => {
      const x = val.x || "";
      const y = val.y || "";
      const hasX = !!x;
      const hasY = !!y;

      // אין שום ערך
      if (!hasX && !hasY) {
        if (required) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["x"],
            message: "x required",
          });
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["y"],
            message: "y required",
          });
        }
        return;
      }

      // יש לפחות אחד – בדיוק כמו בקוד שלך, אם אחד ריק או לא תואם regex הוא לא תקין
      if (coordType === "UTM") {
        if (!latitudeRegexX.test(x)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["x"],
            message: "invalid utm x",
          });
        }
        if (!latitudeRegexY.test(y)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["y"],
            message: "invalid utm y",
          });
        }
      } else {
        if (!wktLongitudeRegexX.test(x)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["x"],
            message: "invalid wkt x",
          });
        }
        if (!wktLatitudeRegexY.test(y)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["y"],
            message: "invalid wkt y",
          });
        }
      }
    });
}

export function buildNumberSchema(
  required: boolean,
  minValue: number | null | undefined,
  maxValue: number | null | undefined,
  numberType: "integer" | "decimal" | undefined
) {
  return z
    .object({
      value: z.string().or(z.number()).optional().nullable(),
    })
    .superRefine((val, ctx) => {
      const raw = val.value;

      const isEmpty =
        raw === "" ||
        raw === null ||
        raw === undefined;

      // ריק
      if (isEmpty) {
        if (required) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["value"],
            message: "number required",
          });
        }
        return;
      }

      const numericValue = Number(raw);

      if (Number.isNaN(numericValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "not a number",
        });
        return;
      }

      if (numberType === "integer" && !Number.isInteger(numericValue)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "not integer",
        });
      }

      if ((minValue || minValue === 0) && numericValue < minValue!) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "below min",
        });
      }

      if ((maxValue || maxValue === 0) && numericValue > maxValue!) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["value"],
          message: "above max",
        });
      }
    });
}