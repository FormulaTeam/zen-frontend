import { FormField, ConditionGroup } from "../utils/interfaces";

interface UseConditionListProps {
  formFields: FormField[];
}

export const useConditionList = ({ formFields }: UseConditionListProps) => {
  // Get unique condition groups from form fields, grouped by conditionSetId
  const getConditionGroups = () => {
    const conditionMap = new Map<
      string,
      {
        conditions: ConditionGroup[];
        affectedFields: FormField[];
        conditionSetId?: string;
        name?: string;
      }
    >();

    formFields.forEach((field) => {
      if (field.conditions && field.conditions.length > 0) {
        // Group condition groups by conditionSetId
        const conditionSetGroups = new Map<string, ConditionGroup[]>();

        field.conditions.forEach((conditionGroup) => {
          const setId = conditionGroup.conditionSetId || "legacy";
          if (!conditionSetGroups.has(setId)) {
            conditionSetGroups.set(setId, []);
          }
          conditionSetGroups.get(setId)!.push(conditionGroup);
        });

        // Create separate entries for each condition set
        conditionSetGroups.forEach((conditionGroups, setId) => {
          if (conditionMap.has(setId)) {
            // Add this field to existing condition set entry
            const existingEntry = conditionMap.get(setId)!;
            existingEntry.affectedFields.push(field);
            // Update name if we find one in the current condition groups
            if (!existingEntry.name) {
              existingEntry.name = conditionGroups.find((group) => group.name)?.name;
            }
          } else {
            // Create new entry for this condition set
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
      id: key, // Use conditionSetId as the ID
      key,
      ...value,
    }));
  };

  const getConditionDescription = (conditions: ConditionGroup[], affectedFields: FormField[]) => {
    const conditionsCount = conditions.reduce((total, group) => total + group.conditions.length, 0);

    // Group fields by section
    const sectionGroups = new Map<string, FormField[]>();
    const individualFields: FormField[] = [];

    affectedFields.forEach((field) => {
      if (field.sectionId && field.sectionName) {
        if (!sectionGroups.has(field.sectionId)) {
          sectionGroups.set(field.sectionId, []);
        }
        sectionGroups.get(field.sectionId)!.push(field);
      } else {
        individualFields.push(field);
      }
    });

    // Check if entire sections are affected
    const descriptions: string[] = [];

    // For each section, check if all fields in that section have conditions
    for (const [sectionId, fieldsInSection] of sectionGroups) {
      // Get all fields that belong to this section in the entire form
      const allFieldsInSection = formFields.filter((f) => f.sectionId === sectionId);

      // If the number of affected fields equals the total fields in section, show section name
      if (fieldsInSection.length === allFieldsInSection.length) {
        const sectionName = fieldsInSection[0].sectionName || `מקטע ${sectionId}`;
        descriptions.push(`מקטע: ${sectionName}`);
      } else {
        // Otherwise show individual field names
        descriptions.push(...fieldsInSection.map((f) => f.displayName));
      }
    }

    // Add individual fields (not in any section or not all fields from section)
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
