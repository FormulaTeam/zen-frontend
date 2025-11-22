import { any, boolean, literal, record, strictObject, string, union } from "zod";
import { EMPTY_FIELD_ERROR_MESSAGE } from "./constants/errorMessage";
import { FieldTypeIds, FormFieldTypeId } from "../../../utils/interfaces";

const literalTypeId = union(
  Object.values(FieldTypeIds).map((v: FormFieldTypeId) => literal(v)),
);

const baseFormFieldSchema = strictObject({
  name: string().min(1, EMPTY_FIELD_ERROR_MESSAGE).regex(/^[a-zA-Z_]*$/, "שם פנימי יכול להכיל רק אותיות באנגלית ו-_"),
  displayName: string().min(1, EMPTY_FIELD_ERROR_MESSAGE),
  required: boolean().default(false),

  typeId: literalTypeId,
  extra: record(string(), any()).optional(),
});

export default baseFormFieldSchema;