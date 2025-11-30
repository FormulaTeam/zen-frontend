import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../utils/interfaces";
import { any, array, boolean, discriminatedUnion, enum as zod_enum, literal, object, record, string } from "zod";

enum OptionsSource {
  MANUAL = 0,
  FORM_FIELD_RESPONSES = 1, // TODO make extra object a discriminated union based on this enum
}

const noFormSelectedErrorMessage = "לא נבחר טופס";
const noFieldSelectedErrorMessage = "לא נבחר שדה";

const baseOptionsExtraSchema = object({
  source: zod_enum(OptionsSource),
  multiple: boolean().default(false),

  options: record(string(), any()).optional(),
});

const manualOptionsSchema = baseOptionsExtraSchema.safeExtend({
  source: literal(OptionsSource.MANUAL),

  options: object({
    items: array(object({
      id: string().min(1),
      text: string().min(1, "חובה לציין טקסט לכל אפשרות"),
      controllingOptionsIds: array(string().min(1)).optional(),
    })).min(2, "על השדה להכיל 2 או יותר אפשרויות"),
    controllingOptionsFieldId: string().min(1).optional(),
    defaultOptionId: string().min(1).optional(),
  }).superRefine(({ items, defaultOptionId }, ctx) => {
    if (!items.find(({ id }) => defaultOptionId === id)) {
      ctx.addIssue({
        code: "custom",
        message: "אפשרות אינה קיימת",
        path: ["defaultOptionId"],
      });
    }
  }),
});

const formFieldResponsesOptionsSchema = baseOptionsExtraSchema.safeExtend({
  source: literal(OptionsSource.FORM_FIELD_RESPONSES),

  options: object({
    formId: string(noFormSelectedErrorMessage).min(1, noFormSelectedErrorMessage),
    fieldId: string(noFieldSelectedErrorMessage).min(1, noFieldSelectedErrorMessage),
  }),
});

const optionsSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.options),

  extra: discriminatedUnion("source", [
    manualOptionsSchema,
    formFieldResponsesOptionsSchema,
  ]).optional(),
});

export { OptionsSource };
export default optionsSchema;
