import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { OptionsFieldExtraSchema, selectionMode } from "formula-gear";

const optionsSchema = baseFormFieldSchema
  .safeExtend({
    typeId: literal(FieldTypeIds.options),

    extra: OptionsFieldExtraSchema.default({
      selectionMode: selectionMode.Single,
      defaultValue: [],
    }),
  })
  .superRefine((data, ctx) => {
    const linkedOptionsFieldId = data.extra.linkedOptionsFieldId;

    const isLinkedOptionsField =
      typeof linkedOptionsFieldId === "string" && linkedOptionsFieldId.trim() !== "";

    if (isLinkedOptionsField) {
      return;
    }

    if (!data.options || data.options.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "חובה להזין לפחות אפשרות אחת",
      });

      return;
    }

    data.options.forEach((item, index) => {
      if (!item.text || item.text.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["options", index, "text"],
          message: "חובה להזין טקסט לאפשרות",
        });
      }
    });
  });

export default optionsSchema;
