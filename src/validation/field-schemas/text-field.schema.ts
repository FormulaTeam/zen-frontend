import z from "zod";
import { baseFieldSchema } from "./base-field.schema";
import { TextFieldConfig } from "../field-config.types";

export const textFieldSchema = (config: TextFieldConfig = {}) => {
  const { maxLength, validationRegex } = config;

  const regex = typeof validationRegex === "string" ? new RegExp(validationRegex) : validationRegex;

  const schema = z
    .string()
    .refine((value) => (maxLength !== undefined ? value.length <= maxLength : true), {
      message: 'טקסט ארוך מדי',
    })
    .refine((value) => (regex ? regex.test(value) : true), {
      message: 'ערך לא חוקי',
    });

  return baseFieldSchema(schema, config);
};
