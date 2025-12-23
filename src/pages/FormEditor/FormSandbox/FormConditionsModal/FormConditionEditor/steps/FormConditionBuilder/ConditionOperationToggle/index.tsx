import { FormConditionOperator } from "../../../../../../schemas/conditions";
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
  value: FormConditionOperator,

  onChange?: (value: FormConditionOperator) => void;
}) {
  const className = type === "group" ? styles.groupOperatorButtonGroup : styles.conditionOperatorButtonGroup;
  const orientation: ToggleButtonGroupProps["orientation"] = type === "group" ? "horizontal" : "vertical";

  return (
    <ToggleButtonGroup exclusive
                       orientation={orientation}
                       className={className}
                       value={value}
                       onClick={() => onChange?.(value === FormConditionOperator.AND ? FormConditionOperator.OR : FormConditionOperator.AND)}>
      <ToggleButton className={styles.operatorButton}
                    disabled={true}
                    value={FormConditionOperator.AND}
                    sx={toggleButtonSx}>
        {ConditionOperatorLabel[FormConditionOperator.AND]}
      </ToggleButton>
      <ToggleButton className={styles.operatorButton}
                    disabled={true}
                    value={FormConditionOperator.OR}
                    sx={toggleButtonSx}>
        {ConditionOperatorLabel[FormConditionOperator.OR]}
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export { ConditionOperationToggle };