import React from "react";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import {
  ConditionGroup as ConditionGroupType,
  LogicalOperators,
  logicalOperatorLabels,
  LogicalOperatorType,
  DEFAULT_LOGICAL_OPERATOR,
} from "../../utils/interfaces";
import ConditionItem from "./ConditionItem";
import {
  ConditionGroupContainer,
  ConditionGroupHeader,
  ConditionGroupTitle,
  ConditionGroupOperatorSelect,
  ConditionGroupButtonsContainer,
  ConditionInGroupContainer,
  ConditionOperatorDividerContainer,
  ConditionDivider,
} from "./styled";
import { FormFieldDto } from "../../types/shared";

type ConditionFieldExtra = {
  connectionType?: string | number;
  conditions?: ConditionGroupType[];
  sectionId?: string;
  sectionOrder?: number;
  sectionName?: string;
  sectionDescription?: string;
};

type ConditionalFormField = FormFieldDto & {
  extra?: ConditionFieldExtra;
};

type FieldOptionValue = {
  value?: unknown;
  fieldId: string;
};

interface ConditionGroupProps {
  group: ConditionGroupType;
  groupIndex: number;
  formFields: ConditionalFormField[];
  availableFields?: ConditionalFormField[];
  onConditionChange: (groupId: string, conditionId: string, field: string, value: any) => void;
  onRemoveCondition: (groupId: string, conditionId: string) => void;
  onGroupLogicalOperatorChange: (groupId: string, operator: LogicalOperatorType) => void;
  onGroupParentLogicalOperatorChange: (groupId: string, operator: LogicalOperatorType) => void;
  onAddCondition: (groupId: string) => void;
  onRemoveGroup: (groupId: string) => void;
  showRemoveGroup: boolean;
  fieldOptions?: Record<string, FieldOptionValue[]>;
}

const ConditionGroup: React.FC<ConditionGroupProps> = ({
  group,
  groupIndex,
  formFields,
  availableFields,
  onConditionChange,
  onRemoveCondition,
  onGroupLogicalOperatorChange,
  onGroupParentLogicalOperatorChange,
  onAddCondition,
  onRemoveGroup,
  showRemoveGroup,
  fieldOptions,
}) => {
  return (
    <ConditionGroupContainer key={group.id} elevation={1}>
      {groupIndex > 0 && (
        <ConditionGroupHeader>
          <ConditionGroupOperatorSelect
            value={group.parentLogicalOperator || DEFAULT_LOGICAL_OPERATOR}
            onChange={(e) =>
              onGroupParentLogicalOperatorChange(group.id, e.target.value as LogicalOperatorType)
            }
            size="small"
            variant="outlined">
            {Object.values(LogicalOperators).map((operator) => (
              <MenuItem key={operator} value={operator}>
                {logicalOperatorLabels[operator]}
              </MenuItem>
            ))}
          </ConditionGroupOperatorSelect>
          <Typography variant="body2" color="text.secondary">
            הקבוצה הקודמת
          </Typography>
        </ConditionGroupHeader>
      )}

      <ConditionGroupTitle variant="subtitle2">קבוצת תנאים {groupIndex + 1}</ConditionGroupTitle>

      {group.conditions.map((condition, conditionIndex) => (
        <ConditionInGroupContainer key={condition.id || conditionIndex}>
          {conditionIndex > 0 && (
            <ConditionOperatorDividerContainer>
              <ConditionDivider />
              <ConditionGroupOperatorSelect
                value={group.logicalOperator}
                onChange={(e) =>
                  onGroupLogicalOperatorChange(group.id, e.target.value as LogicalOperatorType)
                }
                size="small"
                variant="outlined">
                {Object.values(LogicalOperators).map((operator) => (
                  <MenuItem key={operator} value={operator}>
                    {logicalOperatorLabels[operator]}
                  </MenuItem>
                ))}
              </ConditionGroupOperatorSelect>
              <ConditionDivider />
            </ConditionOperatorDividerContainer>
          )}

          <ConditionItem
            condition={condition}
            formFields={formFields}
            availableFields={availableFields}
            onConditionChange={(field, value) =>
              onConditionChange(group.id, condition.id || "", field, value)
            }
            onRemove={() => onRemoveCondition(group.id, condition.id || "")}
            fieldOptions={fieldOptions}
          />
        </ConditionInGroupContainer>
      ))}

      <ConditionGroupButtonsContainer>
        <Button variant="outlined" size="small" onClick={() => onAddCondition(group.id)}>
          + הוסף תנאי
        </Button>

        {showRemoveGroup && (
          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onRemoveGroup(group.id)}>
            הסר קבוצה
          </Button>
        )}
      </ConditionGroupButtonsContainer>
    </ConditionGroupContainer>
  );
};

export default ConditionGroup;
