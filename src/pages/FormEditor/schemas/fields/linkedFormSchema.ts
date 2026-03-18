import baseFormFieldSchema from "./baseFormFieldSchema";
import { FieldTypeIds } from "../../../../utils/interfaces";
import { literal, strictObject, string } from "zod";

const noLinkedIdErrorMessage = "לא נבחר טופס לקישור";

const linkedFormSchema = baseFormFieldSchema.safeExtend({
  typeId: literal(FieldTypeIds.linkedForm),

  extra: strictObject({
    linkedFormId: string(noLinkedIdErrorMessage).min(1, noLinkedIdErrorMessage),
  }).optional(),
});

export default linkedFormSchema;