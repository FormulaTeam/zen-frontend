import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { enum as zod_enum, literal, number, strictObject } from "zod";

enum NumberFormat {
  INTEGER,
  DECIMAL
}

const numberSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.number),

  extra: strictObject({
    format: zod_enum(NumberFormat).default(NumberFormat.DECIMAL),
    defaultValue: number().optional(),
    min: number().optional(),
    max: number().optional(),
  }).superRefine(({ min, max, defaultValue, format }, ctx) => {
    if (format === NumberFormat.INTEGER) {
      if ((min !== undefined && min % 1 != 0) || (max !== undefined && max % 1 != 0)) {
        ctx.addIssue({
          code: "custom",
          message: "לא ניתן להגדיר מספר עשרוני כטווח למספר שלם",
          path: ["max"],
        });
      }
      if (defaultValue !== undefined && defaultValue % 1 != 0) {
        ctx.addIssue({
          code: "custom",
          message: "לא ניתן להגדיר מספר עשרוני כברירת מחדל למספר שלם",
          path: ["defaultValue"],
        });
      }
    }
    if (min !== undefined && max !== undefined && max <= min) {
      ctx.addIssue({
        code: "custom",
        message: "טווח ערכים לא תקין",
        path: ["max"],
      });
    }
    if (defaultValue !== undefined &&
      ((min !== undefined && defaultValue < min) || (max !== undefined && defaultValue > max))) {
      ctx.addIssue({
        code: "custom",
        message: "ערך ברירת המחדל חייב להיות בטווח הערכים",
        path: ["defaultValue"],
      });
    }
  }).optional(),
});

export default numberSchema;