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
import { FormFieldTypeId } from "../../../utils/interfaces";
import { SpecificDiscriminatedUnionObject } from "./types";

const FormFieldSchema = discriminatedUnion("typeId", [
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

type FormFieldData = zod_infer<typeof FormFieldSchema>;

type SpecificFormFieldData<T extends FormFieldTypeId> = SpecificDiscriminatedUnionObject<FormFieldData, "typeId", T>;
type FormFieldExtra<T extends FormFieldTypeId> = Partial<NonNullable<SpecificFormFieldData<T>["extra"]>>;

export { FormFieldSchema };
export type { FormFieldData, SpecificFormFieldData, FormFieldExtra };