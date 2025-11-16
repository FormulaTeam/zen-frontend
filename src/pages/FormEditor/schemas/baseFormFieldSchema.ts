import { any, boolean, literal, record, strictObject, string, union } from "zod";
import { EMPTY_FIELD_ERROR_MESSAGE } from "./constants/errorMessage";
import { ElementTypeIds, FormElementTypeId } from "../../../utils/interfaces";

const literalTypeId = union(
  Object.values(ElementTypeIds).map((v: FormElementTypeId) => literal(v)),
);

const baseFormFieldSchema = strictObject({
  name: string().min(1, EMPTY_FIELD_ERROR_MESSAGE).regex(/^[a-zA-Z_]*$/, "שם פנימי יכול להכיל רק אותיות באנגלית ו-_"),
  displayName: string().min(1, EMPTY_FIELD_ERROR_MESSAGE),
  required: boolean().default(false),

  typeId: literalTypeId,
  extra: record(string(), any()).optional(),
});

export default baseFormFieldSchema;