import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { enum as zod_enum, literal, number, strictObject } from "zod";

enum NumberFormat {
  INTEGER = 1,
  DECIMAL = 2,
}

const ErrorMessages = {
  invalidMinMaxFormat: "לא ניתן להגדיר מספר עשרוני כטווח למספר שלם",
  invalidDefaultValueFormat: "לא ניתן להגדיר מספר עשרוני כברירת מחדל למספר שלם",
  invalidRange: "טווח ערכים לא תקין",
  defaultValueNotInRange: "ערך ברירת המחדל חייב להיות בטווח הערכים",
} as const;

const numberSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.number),

  extra: strictObject({
    numberFormat: zod_enum(NumberFormat).optional(),
    defaultValue: number().optional(),
    min: number().optional(),
    max: number().optional(),
  })
    .superRefine(({ min, max, defaultValue, numberFormat: format }, ctx) => {
      if (min !== undefined && max !== undefined && max <= min) {
        ctx.addIssue({
          code: "custom",
          message: ErrorMessages.invalidRange,
          path: ["min"],
        });
        ctx.addIssue({
          code: "custom",
          message: ErrorMessages.invalidRange,
          path: ["max"],
        });
      }

      if (
        defaultValue !== undefined &&
        ((min !== undefined && defaultValue < min) || (max !== undefined && defaultValue > max))
      ) {
        ctx.addIssue({
          code: "custom",
          message: ErrorMessages.defaultValueNotInRange,
          path: ["defaultValue"],
        });
      }

      if (format === NumberFormat.INTEGER) {
        if (min !== undefined && min % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidMinMaxFormat,
            path: ["min"],
          });
        }

        if (max !== undefined && max % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidMinMaxFormat,
            path: ["max"],
          });
        }

        if (defaultValue !== undefined && defaultValue % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidDefaultValueFormat,
            path: ["defaultValue"],
          });
        }
      }
    })
    .optional(),
});

export { NumberFormat };
export default numberSchema;
