import { FieldTypeIds, FormFieldTypeId } from "../../../utils/interfaces";
import { FormFieldData } from "../schemas/fields";
import { customAlphabet } from "nanoid";
import { v4 as uuid4 } from "uuid";

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
  [FieldTypeIds.linkedForm]: 'linked_form',
} as const satisfies Record<FormFieldTypeId, string>;

function generateFieldName(elementTypeId: FormFieldTypeId) {
  return `${FormElementTypeIdToKey[elementTypeId]}_${nanoid5()}`;
}

import { selectionMode, dateType, timePrecision, numberType, locationFormat } from "formula-gear";

function generateNewFieldData(elementTypeId: FormFieldTypeId): FormFieldData {
  const baseData = {
    typeId: elementTypeId,
    name: generateFieldName(elementTypeId),
    displayName: "",
    required: false,
  };

  let data: FormFieldData;

  switch (elementTypeId) {
    case FieldTypeIds.options: {
      const options = [
        { id: generateOptionItemId(), text: "" },
        { id: generateOptionItemId(), text: "" },
      ];
      data = {
        ...baseData,
        typeId: FieldTypeIds.options,
        extra: {
          selectionMode: selectionMode.Single,
          defaultValue: [],
        },
        options,
      };
      break;
    }

    case FieldTypeIds.date:
      data = {
        ...baseData,
        typeId: FieldTypeIds.date,
        extra: {
          dateType: dateType.Date,
        },
      };
      break;

    case FieldTypeIds.time:
      data = {
        ...baseData,
        typeId: FieldTypeIds.time,
        extra: {
          timePrecision: timePrecision.Minutes,
        },
      };
      break;

    case FieldTypeIds.number:
      data = {
        ...baseData,
        typeId: FieldTypeIds.number,
        extra: {
          numberType: numberType.Integer,
        },
      };
      break;

    case FieldTypeIds.location:
      data = {
        ...baseData,
        typeId: FieldTypeIds.location,
        extra: {
          locationFormat: locationFormat.UTM,
        },
      };
      break;

    case FieldTypeIds.linkedForm:
      data = {
        ...baseData,
        typeId: FieldTypeIds.linkedForm,
        extra: {},
      };
      break;

    case FieldTypeIds.checkbox:
      data = {
        ...baseData,
        typeId: FieldTypeIds.checkbox,
        extra: {
          defaultValue: false,
        },
      };
      break;

    case FieldTypeIds.shortText:
      data = {
        ...baseData,
        typeId: FieldTypeIds.shortText,
        extra: {},
      };
      break;

    case FieldTypeIds.longText:
      data = {
        ...baseData,
        typeId: FieldTypeIds.longText,
        extra: {},
      };
      break;

    case FieldTypeIds.link:
      data = {
        ...baseData,
        typeId: FieldTypeIds.link,
        extra: {},
      };
      break;

    case FieldTypeIds.list:
      data = {
        ...baseData,
        typeId: FieldTypeIds.list,
        extra: {},
      };
      break;

    case FieldTypeIds.file:
      data = {
        ...baseData,
        typeId: FieldTypeIds.file,
        extra: {},
      };
      break;

    default:
      data = {
        ...baseData,
        extra: {},
      } as FormFieldData;
  }

  return data;
}

function generateOptionItemId() {
  return uuid4();
}

function generateConditionId() {
  return uuid4();
}

export { generateSectionId, generateFieldId, generateFieldName, generateNewFieldData, generateOptionItemId, generateConditionId };
