import React from "react";
import Typography from "@mui/material/Typography";
import {
  Condition,
  conditionOperatorLabels,
  ConditionOperators,
  ConditionsRoot,
  DEFAULT_LOGICAL_OPERATOR,
  FieldTypeIds,
  logicalOperatorLabels,
} from "../../utils/interfaces";
import {
  ConditionsPreviewAffectedTitle,
  ConditionsPreviewContainer,
  ConditionsPreviewDescription,
  ConditionsPreviewTitle,
} from "./styled";
import type { ConditionalFormField } from "../../utils/conditionUtils";

interface ConditionsPreviewProps {
  conditionsRoot: ConditionsRoot;
  formFields: ConditionalFormField[];
}

const ConditionsPreview: React.FC<ConditionsPreviewProps> = ({ conditionsRoot, formFields }) => {
  const getConditionDescription = (
    condition: Condition,
    formField?: ConditionalFormField,
  ): string => {
    if (!formField) return "שדה לא נבחר";

    const operatorLabel = conditionOperatorLabels[condition.operator];
    const fieldName = formField.displayName;

    if (
      condition.operator === ConditionOperators.empty ||
      condition.operator === ConditionOperators.not_empty
    ) {
      return `${fieldName} ${operatorLabel}`;
    }

    let valueDisplay = "";
    if (formField.fieldType === FieldTypeIds.date && typeof condition.value === "string") {
      valueDisplay = condition.value ? new Date(condition.value).toLocaleDateString("he-IL") : "";
    } else if (formField.fieldType === FieldTypeIds.checkbox) {
      valueDisplay = condition.value === "true" ? "כן" : "לא";
    } else if (Array.isArray(condition.value)) {
      valueDisplay = condition.value.join(", ");
    } else {
      valueDisplay = String(condition.value || "");
    }

    return `${fieldName} ${operatorLabel} "${valueDisplay}"`;
  };

  if (!conditionsRoot.groups.some((g) => g.conditions.length > 0)) {
    return null;
  }

  return (
    <ConditionsPreviewContainer elevation={2}>
      <ConditionsPreviewTitle variant="subtitle2">תצוגה מקדימה של התנאים:</ConditionsPreviewTitle>
      <ConditionsPreviewDescription variant="body2" color="text.secondary">
        {conditionsRoot.groups
          .map((group, groupIndex) => {
            const groupConditions = group.conditions
              .filter((c) => c.field)
              .map((c) =>
                getConditionDescription(
                  c,
                  formFields.find((f) => f.id === c.field),
                ),
              )
              .join(` ${logicalOperatorLabels[group.logicalOperator]} `);

            const prefix =
              groupIndex > 0
                ? ` ${
                    logicalOperatorLabels[group.parentLogicalOperator || DEFAULT_LOGICAL_OPERATOR]
                  } `
                : "";
            const groupDisplay =
              group.conditions.length > 1 ? `(${groupConditions})` : groupConditions;

            return prefix + groupDisplay;
          })
          .join("")}
      </ConditionsPreviewDescription>

      {conditionsRoot.affectedTargets.length > 0 && (
        <>
          <ConditionsPreviewAffectedTitle variant="subtitle2">
            יציג את:
          </ConditionsPreviewAffectedTitle>
          <Typography variant="body2" color="text.secondary">
            {conditionsRoot.affectedTargets
              .map((target) => `${target.type === "section" ? "מקטעים" : "שדות"}: ${target.name}`)
              .join(", ")}
          </Typography>
        </>
      )}
    </ConditionsPreviewContainer>
  );
};

export default ConditionsPreview;
