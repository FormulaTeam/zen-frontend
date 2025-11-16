import baseFormFieldSchema from "./baseFormFieldSchema";
import { ElementTypeIds } from "../../../utils/interfaces";
import { enum as zod_enum, literal, strictObject } from "zod";

enum CheckboxValue {
  NO,
  YES,
}

const checkboxSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(ElementTypeIds.checkbox),

  extra: strictObject({
    defaultValue: zod_enum(CheckboxValue).default(CheckboxValue.NO),
  }).optional(),
});

export default checkboxSchema;