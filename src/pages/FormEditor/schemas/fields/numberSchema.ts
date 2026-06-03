import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { enum as zod_enum, literal, number, strictObject } from "zod";

const ErrorMessages = {
  invalidMinMaxFormat: "לא ניתן להגדיר מספר עשרוני כטווח למספר שלם",
  invalidDefaultValueFormat: "לא ניתן להגדיר מספר עשרוני כברירת מחדל למספר שלם",
  invalidRange: "טווח ערכים לא תקין",
  defaultValueNotInRange: "ערך ברירת המחדל חייב להיות בטווח הערכים",
} as const;

const numberSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.number),

  extra: strictObject({
    numberType: zod_enum(["integer", "decimal"]).default("integer"),
    defaultValue: number().nullable().default(null),
    min: number().nullable().default(null),
    max: number().nullable().default(null),
  })
    .superRefine(({ min, max, defaultValue, numberType }, ctx) => {
      if (min !== null && max !== null && max <= min) {
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
        defaultValue !== null &&
        ((min !== null && defaultValue < min) || (max !== null && defaultValue > max))
      ) {
        ctx.addIssue({
          code: "custom",
          message: ErrorMessages.defaultValueNotInRange,
          path: ["defaultValue"],
        });
      }

      if (numberType === "integer") {
        if (min !== null && min % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidMinMaxFormat,
            path: ["min"],
          });
        }

        if (max !== null && max % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidMinMaxFormat,
            path: ["max"],
          });
        }

        if (defaultValue !== null && defaultValue % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidDefaultValueFormat,
            path: ["defaultValue"],
          });
        }
      }
    })
    .default({
      numberType: "integer",
      defaultValue: null,
      min: null,
      max: null,
    }),
});

export default numberSchema;
