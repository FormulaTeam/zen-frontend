import { ConditionGroup } from "../utils/interfaces";
import { FormFieldDto } from "../types/shared";

type ConditionFieldExtra = {
  conditions?: ConditionGroup[];
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type ConditionalFormField = FormFieldDto & {
  extra?: ConditionFieldExtra;
};

interface UseConditionListProps {
  formFields: ConditionalFormField[];
}

const getFieldExtra = (field: ConditionalFormField): ConditionFieldExtra =>
  (field.extra as ConditionFieldExtra | undefined) ?? {};

export const useConditionList = ({ formFields }: UseConditionListProps) => {
  const getConditionGroups = () => {
    const conditionMap = new Map<
      string,
      {
        conditions: ConditionGroup[];
        affectedFields: ConditionalFormField[];
        conditionSetId?: string;
        name?: string;
      }
    >();

    formFields.forEach((field) => {
      const fieldConditions = getFieldExtra(field).conditions ?? [];

      if (fieldConditions.length > 0) {
        const conditionSetGroups = new Map<string, ConditionGroup[]>();

        fieldConditions.forEach((conditionGroup) => {
          const setId = conditionGroup.conditionSetId || "legacy";
          if (!conditionSetGroups.has(setId)) {
            conditionSetGroups.set(setId, []);
          }
          conditionSetGroups.get(setId)!.push(conditionGroup);
        });

        conditionSetGroups.forEach((conditionGroups, setId) => {
          if (conditionMap.has(setId)) {
            const existingEntry = conditionMap.get(setId)!;
            existingEntry.affectedFields.push(field);
            if (!existingEntry.name) {
              existingEntry.name = conditionGroups.find((group) => group.name)?.name;
            }
          } else {
            conditionMap.set(setId, {
              conditions: conditionGroups,
              affectedFields: [field],
              conditionSetId: setId !== "legacy" ? setId : undefined,
              name: conditionGroups.find((group) => group.name)?.name,
            });
          }
        });
      }
    });

    return Array.from(conditionMap.entries()).map(([key, value]) => ({
      id: key,
      key,
      ...value,
    }));
  };

  const getConditionDescription = (
    conditions: ConditionGroup[],
    affectedFields: ConditionalFormField[],
  ) => {
    const conditionsCount = conditions.reduce((total, group) => total + group.conditions.length, 0);

    const sectionGroups = new Map<string, ConditionalFormField[]>();
    const individualFields: ConditionalFormField[] = [];

    affectedFields.forEach((field) => {
      const extra = getFieldExtra(field);
      if (extra.sectionId && extra.sectionName) {
        if (!sectionGroups.has(extra.sectionId)) {
          sectionGroups.set(extra.sectionId, []);
        }
        sectionGroups.get(extra.sectionId)!.push(field);
      } else {
        individualFields.push(field);
      }
    });

    const descriptions: string[] = [];

    for (const [sectionId, fieldsInSection] of sectionGroups) {
      const allFieldsInSection = formFields.filter((f) => getFieldExtra(f).sectionId === sectionId);

      if (fieldsInSection.length === allFieldsInSection.length) {
        const sectionName = getFieldExtra(fieldsInSection[0]).sectionName || `מקטע ${sectionId}`;
        descriptions.push(`מקטע: ${sectionName}`);
      } else {
        descriptions.push(...fieldsInSection.map((f) => f.displayName));
      }
    }

    descriptions.push(...individualFields.map((f) => f.displayName));

    const targetsText = descriptions.length > 0 ? descriptions.join(", ") : "אין מטרות";
    return `${conditionsCount} תנאים מוחלים על: ${targetsText}`;
  };

  const conditionGroups = getConditionGroups();

  return {
    conditionGroups,
    getConditionDescription,
  };
};
