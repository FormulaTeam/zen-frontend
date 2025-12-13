import { FormStructure, Section } from "./FormStructureContext";
import { texts } from "../../../utils/texts";
import { generateConditionId, generateFieldId, generateSectionId } from "../utils";
import { FormComponentType, FormConditionOperator, FormConditions } from "../schemas/conditions";
import { FieldTypeIds } from "../../../utils/interfaces";
import { TextConditionType } from "../schemas/conditions/conditionField/conditionTypes/TextConditionType";
import { NumberConditionType } from "../schemas/conditions/conditionField/conditionTypes/NumberConditionType";
import { ConditionFieldTypeId } from "../schemas/conditions/conditionField/baseConditionFieldSchema";
import { DateConditionType } from "../schemas/conditions/conditionField/conditionTypes/DateConditionType";

const PLACEHOLDER_FIELD_ID: string = "__PLACEHOLDER__" as const;

const INITIAL_SECTION: Section = {
  title: texts.heb.mainSection,
  expanded: true,
  fieldIds: [],
};

const DUMMY_CONDITIONS: FormConditions = [
  {
    id: generateConditionId(),
    name: "התנייה בדיקה",
    groups: [
      {
        id: generateConditionId(),
        operator: FormConditionOperator.AND,
        conditions: [
          {
            id: generateConditionId(),
            operator: FormConditionOperator.AND,
            field: {
              id: generateFieldId(),
              typeId: FieldTypeIds.shortText,
              conditionType: TextConditionType.CONTAINS,
              targetValue: "hello",
            },
          },
          {
            id: generateConditionId(),
            operator: FormConditionOperator.OR,
            field: {
              id: generateFieldId(),
              typeId: FieldTypeIds.longText,
              conditionType: TextConditionType.NOT_EQUAL,
              targetValue: "bye",
            },
          },
        ],
      },
      {
        id: generateConditionId(),
        operator: FormConditionOperator.AND,
        conditions: [
          {
            id: generateConditionId(),
            operator: FormConditionOperator.AND,
            field: {
              id: generateFieldId(),
              typeId: FieldTypeIds.number,
              conditionType: NumberConditionType.LARGER,
              targetValue: 20,
            },
          },
        ],
      },
    ],
    dependantComponents: [
      {
        id: generateFieldId(),
        type: FormComponentType.FIELD,
      },
      {
        id: generateFieldId(),
        type: FormComponentType.FIELD,
      },
    ],
  },
  {
    id: generateConditionId(),
    groups: [
      {
        id: generateConditionId(),
        operator: FormConditionOperator.AND,
        conditions: [
          {
            id: generateConditionId(),
            operator: FormConditionOperator.AND,
            field: {
              id: generateFieldId(),
              typeId: ConditionFieldTypeId.date,
              conditionType: DateConditionType.AFTER_OR_EQUAL,
              targetValue: new Date(),
            },
          },
        ],
      },
    ],
    dependantComponents: [
      {
        id: generateFieldId(),
        type: FormComponentType.SECTION,
      },
    ],
  },
];

function getEmptyForm(): FormStructure {
  const sectionId = generateSectionId();

  return {
    metadata: {
      title: "",
      validationErrors: null,
    },
    sections: {
      [sectionId]: { ...INITIAL_SECTION },
    },
    orderedSectionIds: [sectionId],
    fields: {},
    conditions: [...DUMMY_CONDITIONS ?? []],
  };
}

export { getEmptyForm, PLACEHOLDER_FIELD_ID };