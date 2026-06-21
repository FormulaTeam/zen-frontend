import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal } from "zod";
import { OptionsFieldExtraSchema, selectionMode } from "formula-gear";

const DUPLICATE_OPTION_TEXT_ERROR = "שם האפשרות חייב להיות ייחודי בשדה";

const normalizeOptionText = (text?: string): string => text?.trim().toLocaleLowerCase("he") ?? "";

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

    const activeOptions =
      data.options
        ?.map((item, index) => ({ item, index }))
        .filter(({ item }) => item.isActive !== false) ?? [];

    if (activeOptions.length === 0) {
      ctx.addIssue({
        code: "custom",
        path: ["options"],
        message: "חובה להזין לפחות אפשרות אחת",
      });

      return;
    }

    const optionIndexesByText = new Map<string, number[]>();

    activeOptions.forEach(({ item, index }) => {
      if (!item.text || item.text.trim() === "") {
        ctx.addIssue({
          code: "custom",
          path: ["options", index, "text"],
          message: "חובה להזין טקסט לאפשרות",
        });

        return;
      }

      const normalizedText = normalizeOptionText(item.text);
      const indexes = optionIndexesByText.get(normalizedText) ?? [];

      indexes.push(index);
      optionIndexesByText.set(normalizedText, indexes);
    });

    optionIndexesByText.forEach((indexes) => {
      if (indexes.length <= 1) return;

      indexes.forEach((index) => {
        ctx.addIssue({
          code: "custom",
          path: ["options", index, "text"],
          message: DUPLICATE_OPTION_TEXT_ERROR,
        });
      });
    });
  });

export default optionsSchema;
