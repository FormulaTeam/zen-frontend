import { cloneDeep } from "lodash";

import type { FormDto } from "@src/types/shared";
import type { FormStructure } from "../context/FormStructureContext";
import { getEmptyForm } from "../context/utils";
import { FormComponentType, type FormConditions } from "../schemas/conditions";
import { generateConditionId, generateFieldId, generateOptionItemId, generateSectionId } from ".";

export type DuplicateFormSelections = {
  name: boolean;
  description: boolean;
  permissions: boolean;
  fields: boolean;
  conditions: boolean;
  colors: boolean;
};

export type DuplicateFormRouteState = {
  duplicateFormStructure: FormStructure;
  duplicateSourceFormId: number;
  duplicateCopyPermissions: boolean;
};

const remapConditionIds = (
  conditions: FormConditions,
  fieldIdMap: Map<string, string>,
  sectionIdMap: Map<string, string>,
  optionIdMap: Map<string, string>,
): FormConditions =>
  cloneDeep(conditions).map((condition) => ({
    ...condition,
    id: generateConditionId(),
    groups: condition.groups.map((group) => ({
      ...group,
      id: generateConditionId(),
      predicates: group.predicates.map((predicate) => ({
        ...predicate,
        id: generateConditionId(),
        field: {
          ...predicate.field,
          id: fieldIdMap.get(predicate.field.id) ?? predicate.field.id,
          targetValue:
            typeof predicate.field.targetValue === "string"
              ? optionIdMap.get(predicate.field.targetValue) ?? predicate.field.targetValue
              : predicate.field.targetValue,
        },
      })),
    })),
    dependantComponents: {
      ...(condition.dependantComponents[FormComponentType.SECTION]?.length
        ? {
            [FormComponentType.SECTION]: condition.dependantComponents[
              FormComponentType.SECTION
            ]
              ?.map((sectionId) => sectionIdMap.get(sectionId))
              .filter((sectionId): sectionId is string => !!sectionId),
          }
        : {}),
      ...(condition.dependantComponents[FormComponentType.FIELD]?.length
        ? {
            [FormComponentType.FIELD]: condition.dependantComponents[FormComponentType.FIELD]
              ?.map((fieldId) => fieldIdMap.get(fieldId))
              .filter((fieldId): fieldId is string => !!fieldId),
          }
        : {}),
    },
  })) as FormConditions;

export const buildDuplicatedFormStructure = (
  sourceForm: FormDto,
  selections: DuplicateFormSelections,
  duplicateName: string,
  duplicateDescription: string,
): FormStructure => {
  const emptyForm = getEmptyForm();

  const metadata: FormStructure["metadata"] = {
    title: selections.name ? duplicateName : "",
    description: selections.description ? duplicateDescription : undefined,
    validationErrors: null,
  };

  if (!selections.fields) {
    return {
      ...emptyForm,
      metadata,
    };
  }

  const fieldIdMap = new Map<string, string>();
  const sectionIdMap = new Map<string, string>();
  const optionIdMap = new Map<string, string>();
  const sections: FormStructure["sections"] = {};
  const orderedSectionIds: string[] = [];
  const fields: FormStructure["fields"] = {};

  [...(sourceForm.sections ?? [])]
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
    .forEach((sectionData) => {
      const originalSectionId = sectionData.id?.toString() ?? generateSectionId();
      const sectionId = generateSectionId();
      sectionIdMap.set(originalSectionId, sectionId);
      orderedSectionIds.push(sectionId);

      const fieldIds = [...(sectionData.fields ?? [])]
        .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))
        .map((fieldData) => {
          const originalFieldId = fieldData.id?.toString() ?? generateFieldId();
          const fieldId = generateFieldId();
          fieldIdMap.set(originalFieldId, fieldId);

          const options = cloneDeep((fieldData as any).options || []).map((option: any) => {
            const originalOptionId = typeof option?.id === "string" ? option.id : undefined;
            const optionId = generateOptionItemId();

            if (originalOptionId) {
              optionIdMap.set(originalOptionId, optionId);
            }

            return {
              ...option,
              id: optionId,
            };
          });

          const extra = cloneDeep(fieldData.extra || {});

          if (Array.isArray((extra as any).defaultValue)) {
            (extra as any).defaultValue = (extra as any).defaultValue.map((optionId: string) =>
              optionIdMap.get(optionId) ?? optionId,
            );
          } else if (typeof (extra as any).defaultValue === "string") {
            (extra as any).defaultValue =
              optionIdMap.get((extra as any).defaultValue) ?? (extra as any).defaultValue;
          }

          fields[fieldId] = {
            id: fieldId,
            parentSectionId: sectionId,
            data: {
              typeId: fieldData.fieldType as any,
              name: fieldData.name || "",
              displayName: fieldData.displayName || "",
              required: fieldData.isRequired || false,
              extra,
              options,
            },
            validationErrors: null,
          };

          return fieldId;
        });

      sections[sectionId] = {
        title: sectionData.name || "",
        expanded: true,
        fieldIds,
      };
    });

  Object.values(fields).forEach((field) => {
    field.data.options = field.data.options?.map((option: any) => ({
      ...option,
      controllingItemsIds: option.controllingItemsIds?.map((optionId: string) =>
        optionIdMap.get(optionId) ?? optionId,
      ),
      controllingOptionIds: option.controllingOptionIds?.map((optionId: string) =>
        optionIdMap.get(optionId) ?? optionId,
      ),
    }));
  });

  return {
    metadata,
    sections,
    orderedSectionIds,
    fields,
    conditions: selections.conditions
      ? remapConditionIds(
          (sourceForm.conditions ?? []) as FormConditions,
          fieldIdMap,
          sectionIdMap,
          optionIdMap,
        )
      : [],
  };
};
