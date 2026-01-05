import z from "zod";
import { baseFieldSchema } from "./base-field.schema";
import { NumberFieldConfig, NumberType } from "../field-config.types";

export const numberFieldSchema = (config: NumberFieldConfig = {}) => {
  const { numberType, minValue, maxValue } = config;

  const schema = z.coerce
    .number('מספר לא חוקי')
    .superRefine((value, ctx) => {
      if (value == null) return;

      if (numberType === NumberType.INTEGER && !Number.isInteger(value)) {
        ctx.addIssue({
          code: "custom",
          message: 'מספר שלם לא חוקי',
        });
      }

      if (minValue !== undefined && value < minValue) {
        ctx.addIssue({
          code: "custom",
          message: 'מספר לא חוקי',
        });
      }

      if (maxValue !== undefined && value > maxValue) {
        ctx.addIssue({
          code: "custom",
          message: 'מספר לא חוקי',
        });
      }
    });

  return baseFieldSchema(schema, config);
};
