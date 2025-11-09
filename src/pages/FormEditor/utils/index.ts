import { v4 as uuid4 } from "uuid";
import { ElementTypeIds, FormElementTypeId } from "../../../utils/interfaces";

function generateSectionId() {
  return `section_${uuid4()}`;
}

function generateFieldId() {
  return `field_${uuid4()}`;
}

const FormElementTypeIdToKey = {
  [ElementTypeIds.longText]: 'long_text',
  [ElementTypeIds.smallText]: 'small_text',
  [ElementTypeIds.options]: 'options',
  [ElementTypeIds.link]: 'link',
  [ElementTypeIds.date]: 'date',
  [ElementTypeIds.hour]: 'hour',
  [ElementTypeIds.location]: 'location',
  [ElementTypeIds.checkbox]: 'checkbox',
  [ElementTypeIds.list]: 'list',
  [ElementTypeIds.number]: 'number',
  [ElementTypeIds.file]: 'file',
  [ElementTypeIds.form]: 'form',
} as const satisfies Record<FormElementTypeId, string>;

function generateFieldName(elementTypeId: FormElementTypeId){
  return `${FormElementTypeIdToKey[elementTypeId]}_${uuid4()}`; //TODO talk to Roey about this
}

export { generateSectionId, generateFieldId, generateFieldName };