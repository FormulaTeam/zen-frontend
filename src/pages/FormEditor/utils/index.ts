import { FieldTypeIds, FormFieldTypeId } from "../../../utils/interfaces";
import {customAlphabet} from "nanoid";
import {v4 as uuid4} from "uuid";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid5 = customAlphabet(alphabet, 5);

function generateSectionId() {
  return uuid4();
}

function generateFieldId() {
  return uuid4();
}

const FormElementTypeIdToKey = {
  [FieldTypeIds.longText]: 'long_text',
  [FieldTypeIds.shortText]: 'short_text',
  [FieldTypeIds.options]: 'options',
  [FieldTypeIds.link]: 'link',
  [FieldTypeIds.date]: 'date',
  [FieldTypeIds.time]: 'time',
  [FieldTypeIds.location]: 'location',
  [FieldTypeIds.checkbox]: 'checkbox',
  [FieldTypeIds.list]: 'list',
  [FieldTypeIds.number]: 'number',
  [FieldTypeIds.file]: 'file',
  [FieldTypeIds.linkedForm]: 'form',
} as const satisfies Record<FormFieldTypeId, string>;

function generateFieldName(elementTypeId: FormFieldTypeId){
  return `${FormElementTypeIdToKey[elementTypeId]}_${nanoid5()}`;
}

export { generateSectionId, generateFieldId, generateFieldName };