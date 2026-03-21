import React from "react";
import Button from "@mui/material/Button";
import { ConditionsRoot, LogicalOperators, ConditionUtils } from "../../utils/interfaces";
import { ConditionControlsContainer, ConditionControlsButtonGroup } from "./styled";
import Tooltip from "@mui/material/Tooltip";
import type { ConditionalFormField } from "../../utils/conditionUtils";

interface ConditionControlsProps {
  conditionsRoot: ConditionsRoot;
  formFields: ConditionalFormField[];
  onAddConditionGroup: (logicalOperator?: any) => void;
  onSave: () => void;
}

const ConditionControls: React.FC<ConditionControlsProps> = ({
  conditionsRoot,
  formFields,
  onAddConditionGroup,
  onSave,
}) => {
  return (
    <ConditionControlsContainer>
      <ConditionControlsButtonGroup>
        <Tooltip title="הוספת קבוצת תנאים עם תנאי לוגי לקבוצה הקודמת">
          <Button variant="outlined" onClick={() => onAddConditionGroup(LogicalOperators.and)}>
            + קבוצת תנאים
          </Button>
        </Tooltip>
      </ConditionControlsButtonGroup>

      <Button
        variant="contained"
        color="primary"
        onClick={onSave}
        disabled={
          !ConditionUtils.validateConditionsRoot(conditionsRoot, formFields) ||
          conditionsRoot.affectedTargets.length === 0
        }>
        שמור תנאים
      </Button>
    </ConditionControlsContainer>
  );
};

export default ConditionControls;
