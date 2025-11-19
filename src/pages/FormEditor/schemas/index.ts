import shortTextSchema from "./shortTextSchema";
import longTextSchema from "./longTextSchema";
import optionsSchema from "./optionsSchema";
import linkSchema from "./linkSchema";
import { discriminatedUnion, infer as zod_infer } from "zod";
import locationSchema from "./locationSchema";
import dateSchema from "./dateSchema";
import timeSchema from "./timeSchema";
import checkboxSchema from "./checkboxSchema";
import listSchema from "./listSchema";
import numberSchema from "./numberSchema";
import fileSchema from "./fileSchema";
import linkedFormSchema from "./linkedFormSchema";
import { FormElementTypeId } from "../../../utils/interfaces";

const formFieldSchema = discriminatedUnion("typeId", [
  shortTextSchema,
  longTextSchema,
  optionsSchema,
  linkSchema,
  dateSchema,
  timeSchema,
  locationSchema,
  checkboxSchema,
  listSchema,
  numberSchema,
  fileSchema,
  linkedFormSchema,
]);

type FormFieldData = zod_infer<typeof formFieldSchema>;

type FormFieldExtra<A extends FormElementTypeId> = Partial<NonNullable<(FormFieldData & { typeId: A })["extra"]>>;

export { formFieldSchema };
export type { FormFieldData, FormFieldExtra };