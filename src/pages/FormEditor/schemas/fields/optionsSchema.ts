import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal, number, string, nativeEnum, array, any } from "zod";
import { OptionsFieldExtraSchema, selectionMode, optionsSource } from "formula-gear";

const optionsSchema = baseFormFieldSchema
  .safeExtend({
    typeId: literal(FieldTypeIds.options),

    extra: OptionsFieldExtraSchema.extend({
      linkedFormId: number().optional(),
      connectedFieldId: string().optional(),
      source: nativeEnum(optionsSource).optional(),
      connectionType: string().optional(),
      parentFieldId: string().optional(),
      parentDependencies: array(any()).optional(),
      linkedOptionsFieldId: string().optional().nullable(),
    }).default({
      selectionMode: selectionMode.Single,
      defaultValue: [],
    }),
  })
  .superRefine((data, ctx) => {
    const extra = data.extra;
    const isLinkedToForm = extra.source === optionsSource.FormFieldResponses;

    if (!isLinkedToForm) {
      // Manual options validation - must have root options
      if (!data.options || data.options.length === 0) {
        ctx.addIssue({
          code: "custom",
          path: ["options"],
          message: "חובה להזין לפחות אפשרות אחת",
        });
      } else {
        // Check for empty text in options
        data.options.forEach((item: any, index: number) => {
          if (!item.text || item.text.trim() === "") {
            ctx.addIssue({
              code: "custom",
              path: ["options", index, "text"],
              message: "חובה להזין טקסט לאפשרות",
            });
          }
        });
      }
    } else {
      // Linked to form validation
      if (!extra.linkedFormId) {
        ctx.addIssue({
          code: "custom",
          path: ["extra", "linkedFormId"],
          message: "חובה לבחור טופס",
        });
      }
      if (!extra.connectedFieldId) {
        ctx.addIssue({
          code: "custom",
          path: ["extra", "connectedFieldId"],
          message: "חובה לבחור שדה",
        });
      }
    }
  });

export default optionsSchema;
