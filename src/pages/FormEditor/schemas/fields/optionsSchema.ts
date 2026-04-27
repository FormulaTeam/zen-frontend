import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import {
  any,
  array,
  boolean,
  discriminatedUnion,
  literal,
  object,
  record,
  string,
} from "zod";
import * as Gear from "formula-gear";

// Use bracket notation to bypass potential bundler export issues if cache is stale
const GearAny = Gear as any;
const gearOptionsSource = GearAny["optionsSource"] || { Manual: 1, FormFieldResponses: 2 };

enum OptionsSource {
  MANUAL = 1,
  FORM_FIELD_RESPONSES = 2,
}

const noFormSelectedErrorMessage = "לא נבחר טופס";
const noFieldSelectedErrorMessage = "לא נבחר שדה";
const duplicateOptionErrorMessage = "לא ניתן לחזור על אפשרות קיימת";

const baseOptionsExtraSchema = object({
  source: any(), // We'll refine this in sub-schemas
  multiple: boolean().default(false),

  options: record(string(), any()).optional(),
});

const manualOptionsSchema = baseOptionsExtraSchema.extend({
  source: literal(OptionsSource.MANUAL),

  options: object({
    items: array(
      object({
        id: string().min(1),
        text: string().min(1, "חובה לציין טקסט לכל אפשרות"),
        controllingItemsIds: array(string().min(1)).optional(),
      }),
    ).min(2, "על השדה להכיל 2 או יותר אפשרויות"),
    controllingOptionsFieldId: string().min(1).optional(),
    defaultOptionId: string().min(1).optional(),
  }).superRefine(({ items, defaultOptionId }, ctx) => {
    if (items.length) {
      const erroredItemIndices = new Set();

      for (let i = 0; i < items.length - 1; i++) {
        if (erroredItemIndices.has(i)) continue;

        for (let j = i + 1; j < items.length; j++) {
          if (erroredItemIndices.has(j)) continue;

          if (items[i].text === items[j].text) {
            ctx.addIssue({
              code: "custom",
              message: duplicateOptionErrorMessage,
              path: ["items", j, "text"],
            });

            erroredItemIndices.add(j);
          }
        }
      }
    }

    if (defaultOptionId && !items.find(({ id }) => defaultOptionId === id)) {
      ctx.addIssue({
        code: "custom",
        message: "אפשרות אינה קיימת",
        path: ["defaultOptionId"],
      });
    }
  }),
});

const formFieldResponsesOptionsSchema = baseOptionsExtraSchema.extend({
  source: literal(OptionsSource.FORM_FIELD_RESPONSES),

  options: object({
    formId: string(noFormSelectedErrorMessage).min(1, noFormSelectedErrorMessage),
    fieldId: string(noFieldSelectedErrorMessage).min(1, noFieldSelectedErrorMessage),
  }),
});

const optionsSchema = baseFormFieldSchema.extend({
  typeId: literal(FieldTypeIds.options),

  extra: discriminatedUnion("source", [manualOptionsSchema, formFieldResponsesOptionsSchema]).optional(),
});

export { OptionsSource };
export default optionsSchema;
