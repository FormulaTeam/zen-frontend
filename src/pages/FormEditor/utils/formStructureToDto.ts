import { DEFAULT_ICON_NAME } from "@utils/utils";
import { CreateFormDto } from "../../../api/formsApi";
import { FormStructure } from "../context/FormStructureContext";
import { FormFieldSchema } from "../schemas/fields";
import { FieldTypeIds } from "@utils/interfaces";
import { TextComparator } from "../schemas/conditions/conditionField/comparators/TextComparator";
import { NumberComparator } from "../schemas/conditions/conditionField/comparators/NumberComparator";
import { DateComparator } from "../schemas/conditions/conditionField/comparators/DateComparator";
import { OptionsComparator } from "../schemas/conditions/conditionField/comparators/OptionsComparator";
import { CheckboxComparator } from "../schemas/conditions/conditionField/comparators/CheckboxComparator";

const DB_COMPARATOR_IDS = {
  equals: 1,
  notEquals: 2,
  contains: 3,
  isEmpty: 4,
  isNotEmpty: 5,
  before: 6,
  after: 7,
  notContains: 8,
  greaterThan: 9,
  lessThan: 10,
  greaterThanOrEqual: 11,
  lessThanOrEqual: 12,
  beforeOrEqual: 13,
  afterOrEqual: 14,
} as const;

const COMPARATOR_TO_DB_COMPARATOR_ID_BY_FIELD_TYPE: Record<number, Record<number, number>> = {
  [FieldTypeIds.shortText]: {
    [TextComparator.EQUAL]: DB_COMPARATOR_IDS.equals,
    [TextComparator.NOT_EQUAL]: DB_COMPARATOR_IDS.notEquals,
    [TextComparator.CONTAINS]: DB_COMPARATOR_IDS.contains,
    [TextComparator.NOT_CONTAINS]: DB_COMPARATOR_IDS.notContains,
    [TextComparator.EMPTY]: DB_COMPARATOR_IDS.isEmpty,
    [TextComparator.NOT_EMPTY]: DB_COMPARATOR_IDS.isNotEmpty,
  },

  [FieldTypeIds.longText]: {
    [TextComparator.EQUAL]: DB_COMPARATOR_IDS.equals,
    [TextComparator.NOT_EQUAL]: DB_COMPARATOR_IDS.notEquals,
    [TextComparator.CONTAINS]: DB_COMPARATOR_IDS.contains,
    [TextComparator.NOT_CONTAINS]: DB_COMPARATOR_IDS.notContains,
    [TextComparator.EMPTY]: DB_COMPARATOR_IDS.isEmpty,
    [TextComparator.NOT_EMPTY]: DB_COMPARATOR_IDS.isNotEmpty,
  },

  [FieldTypeIds.number]: {
    [NumberComparator.EQUAL]: DB_COMPARATOR_IDS.equals,
    [NumberComparator.NOT_EQUAL]: DB_COMPARATOR_IDS.notEquals,
    [NumberComparator.LARGER]: DB_COMPARATOR_IDS.greaterThan,
    [NumberComparator.SMALLER]: DB_COMPARATOR_IDS.lessThan,
    [NumberComparator.LARGER_OR_EQUAL]: DB_COMPARATOR_IDS.greaterThanOrEqual,
    [NumberComparator.SMALLER_OR_EQUAL]: DB_COMPARATOR_IDS.lessThanOrEqual,
    [NumberComparator.EMPTY]: DB_COMPARATOR_IDS.isEmpty,
    [NumberComparator.NOT_EMPTY]: DB_COMPARATOR_IDS.isNotEmpty,
  },

  [FieldTypeIds.date]: {
    [DateComparator.EQUAL]: DB_COMPARATOR_IDS.equals,
    [DateComparator.NOT_EQUAL]: DB_COMPARATOR_IDS.notEquals,
    [DateComparator.BEFORE]: DB_COMPARATOR_IDS.before,
    [DateComparator.AFTER]: DB_COMPARATOR_IDS.after,
    [DateComparator.BEFORE_OR_EQUAL]: DB_COMPARATOR_IDS.beforeOrEqual,
    [DateComparator.AFTER_OR_EQUAL]: DB_COMPARATOR_IDS.afterOrEqual,
    [DateComparator.EMPTY]: DB_COMPARATOR_IDS.isEmpty,
    [DateComparator.NOT_EMPTY]: DB_COMPARATOR_IDS.isNotEmpty,
  },

  [FieldTypeIds.options]: {
    [OptionsComparator.ONLY]: DB_COMPARATOR_IDS.equals,
    [OptionsComparator.OTHER_THAN]: DB_COMPARATOR_IDS.notEquals,
    [OptionsComparator.INCLUDES]: DB_COMPARATOR_IDS.contains,
    [OptionsComparator.NOT_INCLUDES]: DB_COMPARATOR_IDS.notContains,
    [OptionsComparator.NONE]: DB_COMPARATOR_IDS.isEmpty,
    [OptionsComparator.ANY]: DB_COMPARATOR_IDS.isNotEmpty,
  },

  [FieldTypeIds.checkbox]: {
    [CheckboxComparator.EQUAL]: DB_COMPARATOR_IDS.equals,
  },
};

const getDbComparatorId = (fieldTypeId: number, comparator: number): number => {
  return COMPARATOR_TO_DB_COMPARATOR_ID_BY_FIELD_TYPE[fieldTypeId]?.[comparator] ?? comparator;
};

const mapConditionsComparatorsToDbIds = (conditions: FormStructure["conditions"]) => {
  return conditions.map((condition) => ({
    ...condition,
    groups: condition.groups.map((group) => ({
      ...group,
      predicates: group.predicates.map((predicate) => ({
        ...predicate,
        field: {
          ...predicate.field,
          comparator: getDbComparatorId(predicate.field.typeId, predicate.field.comparator),
        },
      })),
    })),
  }));
};

export function convertFormStructureToCreateDto(formStructure: FormStructure): CreateFormDto {
  const sections = formStructure.orderedSectionIds.map((sectionId, index) => {
    const section = formStructure.sections[sectionId];

    const fields = section.fieldIds
      .map((fieldId) => formStructure.fields[fieldId])
      .filter((field) => !!field)
      .map((field) => {
        const fieldData = field.data;

        const validatedData = FormFieldSchema.parse({
          ...fieldData,
          extra: fieldData.extra ?? {},
        });

        return {
          id: field.id,
          name: validatedData.name,
          index: formStructure.sections[sectionId].fieldIds.indexOf(field.id) + 1,
          fieldType: validatedData.typeId as number,
          displayName: validatedData.displayName,
          isRequired: validatedData.required,
          options: validatedData.options,
          extra: validatedData.extra ?? {},
        };
      });

    return {
      id: sectionId,
      name: section.title,
      index: index + 1,
      fields,
    };
  });

  const payload: any = {
    name: formStructure.metadata.title,
    description: formStructure.metadata.description ?? "",
    sections,
    conditions: mapConditionsComparatorsToDbIds(formStructure.conditions ?? []),
  };

  if (
    formStructure.metadata.iconId &&
    formStructure.metadata.iconId !== DEFAULT_ICON_NAME &&
    formStructure.metadata.iconId !== "default-icon"
  ) {
    payload.icon = formStructure.metadata.iconId;
  }

  return payload as CreateFormDto;
}
