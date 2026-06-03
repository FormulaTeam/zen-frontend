import { any, array, boolean, literal, object, record, strictObject, string, union } from "zod";
import { FieldTypeIds, FormFieldTypeId } from "../../../../utils/interfaces";

const EMPTY_FIELD_ERROR_MESSAGE = "שדה חובה";

const literalTypeId = union(
  Object.values(FieldTypeIds).map((v: FormFieldTypeId) => literal(v)),
);

const baseFormFieldSchema = strictObject({
  name: string().min(1, EMPTY_FIELD_ERROR_MESSAGE).regex(/^[a-zA-Z_]*$/, "שם פנימי יכול להכיל רק אותיות באנגלית וקו תחתון (_)"),
  displayName: string().min(1, EMPTY_FIELD_ERROR_MESSAGE).max(255, "סך התווים המקסימלי הוא 255"),
  required: boolean().default(false),

  typeId: literalTypeId,
  options: array(
    object({
      id: string().min(1),
      text: string().min(1, "חובה לציין טקסט לכל אפשרות"),
      controllingItemsIds: array(string().min(1)).optional(),
    }),
  ).optional(),
  extra: record(string(), any()).optional(),
});

export default baseFormFieldSchema;