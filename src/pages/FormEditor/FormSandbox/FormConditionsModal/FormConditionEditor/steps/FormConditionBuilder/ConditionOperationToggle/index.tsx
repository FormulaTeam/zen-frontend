import { FormConditionBooleanOperator } from "../../../../../../schemas/conditions";
import styles from "./style.module.scss";
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from "@mui/material";
import { ConditionOperatorLabel } from "../../../constants";

const toggleButtonSx = {
  color: "white",
  boxShadow: "0 2px 0px 0 #a0abc0 inset",
  backgroundColor: "#c5cdd5",
  "&.Mui-selected": {
    color: "black",
    boxShadow: "unset",
    backgroundColor: "#ffffff",
  },
};

function ConditionOperationToggle({ type, value, onChange }: {
  type: "group" | "condition",
  value: FormConditionBooleanOperator,

  onChange?: (value: FormConditionBooleanOperator) => void;
}) {
  const className = type === "group" ? styles.groupOperatorButtonGroup : styles.conditionOperatorButtonGroup;
  const orientation: ToggleButtonGroupProps["orientation"] = type === "group" ? "horizontal" : "vertical";

  return (
    <ToggleButtonGroup exclusive
                       orientation={orientation}
                       className={className}
                       value={value}
                       onClick={() => onChange?.(value === FormConditionBooleanOperator.AND ? FormConditionBooleanOperator.OR : FormConditionBooleanOperator.AND)}>
      <ToggleButton className={styles.operatorButton}
                    disabled={true}
                    value={FormConditionBooleanOperator.AND}
                    sx={toggleButtonSx}>
        {ConditionOperatorLabel[FormConditionBooleanOperator.AND]}
      </ToggleButton>
      <ToggleButton className={styles.operatorButton}
                    disabled={true}
                    value={FormConditionBooleanOperator.OR}
                    sx={toggleButtonSx}>
        {ConditionOperatorLabel[FormConditionBooleanOperator.OR]}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export { ConditionOperationToggle };