import { any, boolean, literal, record, strictObject, string, union } from "zod";
import { FieldTypeIds, FormFieldTypeId } from "../../../utils/interfaces";

const EMPTY_FIELD_ERROR_MESSAGE = 'שדה חובה';

const literalTypeId = union(
  Object.values(FieldTypeIds).map((v: FormFieldTypeId) => literal(v)),
);

const baseFormFieldSchema = strictObject({
  name: string().min(1, EMPTY_FIELD_ERROR_MESSAGE).regex(/^[a-zA-Z_]*$/, "שם פנימי יכול להכיל רק אותיות באנגלית וקו תחתון (_)"),
  displayName: string().min(1, EMPTY_FIELD_ERROR_MESSAGE),
  required: boolean().default(false),

  typeId: literalTypeId,
  extra: record(string(), any()).optional(),
});

export default baseFormFieldSchema;