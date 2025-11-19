import { ElementTypeIds, FormElementTypeId } from "../../../utils/interfaces";
import {customAlphabet} from "nanoid";

const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const nanoid5 = customAlphabet(alphabet, 5);
const nanoid6 = customAlphabet(alphabet, 6);

function generateSectionId() {
  return nanoid6();
}

function generateFieldId() {
  return nanoid6();
}

const FormElementTypeIdToKey = {
  [ElementTypeIds.longText]: 'long_text',
  [ElementTypeIds.shortText]: 'short_text',
  [ElementTypeIds.options]: 'options',
  [ElementTypeIds.link]: 'link',
  [ElementTypeIds.date]: 'date',
  [ElementTypeIds.time]: 'time',
  [ElementTypeIds.location]: 'location',
  [ElementTypeIds.checkbox]: 'checkbox',
  [ElementTypeIds.list]: 'list',
  [ElementTypeIds.number]: 'number',
  [ElementTypeIds.file]: 'file',
  [ElementTypeIds.linkedForm]: 'form',
} as const satisfies Record<FormElementTypeId, string>;

function generateFieldName(elementTypeId: FormElementTypeId){
  return `${FormElementTypeIdToKey[elementTypeId]}_${nanoid5()}`;
}

export { generateSectionId, generateFieldId, generateFieldName };