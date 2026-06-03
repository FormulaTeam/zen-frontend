import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal, number, strictObject } from "zod";

const noLinkedIdErrorMessage = "חובה לבחור טופס לקישור";

const linkedFormSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.linkedForm),

  extra: strictObject({
    linkedFormId: number({ message: noLinkedIdErrorMessage }).default(0),
  }).default({
    linkedFormId: 0,
  }),
});

export default linkedFormSchema;
