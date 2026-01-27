import { z } from "zod";
import { baseFieldSchema } from "./base-field.schema";
import { LocationFieldConfig } from "../field-config.types";

export const locationFieldSchema = (config: LocationFieldConfig) => {
  // IMPORTANT: default coordinateType so missing config does not bypass validation
  const coordinateType = config.coordinateType ?? "UTM";

  const invalid = "פורמט קואורדינטות לא חוקי";

  const schema = z.preprocess(
    (val) => {
      if (val && typeof val === "object") {
        const v: any = val;
        const x = typeof v.x === "string" ? v.x.trim() : v.x;
        const y = typeof v.y === "string" ? v.y.trim() : v.y;

        const emptyX = x === "" || x === null || x === undefined;
        const emptyY = y === "" || y === null || y === undefined;

        if (emptyX && emptyY) return undefined;

        return { ...v, x: emptyX ? "" : String(x), y: emptyY ? "" : String(y) };
      }
      return val;
    },
    z
      .object({
        x: z.string(),
        y: z.string(),
      })
      .superRefine((val, ctx) => {
        const x = (val.x ?? "").trim();
        const y = (val.y ?? "").trim();

        const hasX = x.length > 0;
        const hasY = y.length > 0;

        if (hasX !== hasY) {
          if (!hasX) {
            ctx.addIssue({ code: "custom", path: ["x"], message: invalid });
          }
          if (!hasY) {
            ctx.addIssue({ code: "custom", path: ["y"], message: invalid });
          }
        }

        if (coordinateType === "UTM") {
          const valid6 = (s: string) => /^\d{6}$/.test(s);

          if (hasX && !valid6(x)) {
            ctx.addIssue({
              code: "custom",
              path: ["x"],
              message: "אורך X חייב להיות בפורמט UTM",
            });
          }

          if (hasY && !valid6(y)) {
            ctx.addIssue({
              code: "custom",
              path: ["y"],
              message: "אורך Y חייב להיות בפורמט UTM",
            });
          }

          return;
        }

        if (coordinateType === "WKT") {
          const validWkt = (s: string) => /^\d{2}\.\d{6}$/.test(s);

          if (hasX && !validWkt(x)) {
            ctx.addIssue({
              code: "custom",
              path: ["x"],
              message: "אורך X חייב להיות בפורמט WKT",
            });
          }

          if (hasY && !validWkt(y)) {
            ctx.addIssue({
              code: "custom",
              path: ["y"],
              message: "אורך Y חייב להיות בפורמט WKT",
            });
          }

          return;
        }

        if (hasX || hasY) {
          ctx.addIssue({ code: "custom", path: ["x"], message: invalid });
          ctx.addIssue({ code: "custom", path: ["y"], message: invalid });
        }
      }),
  );

  return baseFieldSchema(schema, config);
};
