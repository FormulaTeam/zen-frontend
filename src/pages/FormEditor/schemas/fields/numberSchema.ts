import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { NumberFieldExtraSchema, numberType } from "formula-gear";

const ErrorMessages = {
  invalidMinMaxFormat: "לא ניתן להגדיר מספר עשרוני כטווח למספר שלם",
  invalidDefaultValueFormat: "לא ניתן להגדיר מספר עשרוני כברירת מחדל למספר שלם",
  invalidRange: "טווח ערכים לא תקין",
  defaultValueNotInRange: "ערך ברירת המחדל חייב להיות בטווח הערכים",
} as const;

const numberSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.number),

  extra: NumberFieldExtraSchema
    .superRefine(({ min, max, defaultValue, numberType: type }, ctx) => {
      if (min != null && max != null && max <= min) {
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
        defaultValue != null &&
        ((min != null && defaultValue < min) || (max != null && defaultValue > max))
      ) {
        ctx.addIssue({
          code: "custom",
          message: ErrorMessages.defaultValueNotInRange,
          path: ["defaultValue"],
        });
      }

      if (type === numberType.Integer) {
        if (min != null && min % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidMinMaxFormat,
            path: ["min"],
          });
        }

        if (max != null && max % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidMinMaxFormat,
            path: ["max"],
          });
        }

        if (defaultValue != null && defaultValue % 1 != 0) {
          ctx.addIssue({
            code: "custom",
            message: ErrorMessages.invalidDefaultValueFormat,
            path: ["defaultValue"],
          });
        }
      }
    })
    .default({
      numberType: numberType.Integer,
    }),
});

export default numberSchema;
