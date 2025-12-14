import { Step, StepLabel, Stepper } from "@mui/material";
import { useMemo, useState } from "react";
import styles from "./style.module.css";
import { useFormStructureContext } from "../../../context/FormStructureContext";

enum ConditionEditorStep {
  EDITOR = 0,
  DEPENDENCY_PICKER,
  SUMMARY,
}

type ModifiedConditionStatus = "new" | "existing";

interface ModifiedConditionBase {
  status: ModifiedConditionStatus;
  index?: number;
}

interface NewCondition extends ModifiedConditionBase {
  status: "new";
  index?: never;
}

interface ExistingCondition extends ModifiedConditionBase {
  status: "existing";
  index: number;
}

type ModifiedCondition = NewCondition | ExistingCondition;

interface Props {
  modifiedCondition: ModifiedCondition;
}

function FormConditionEditor({ modifiedCondition }: Props) {
  const { formStructure } = useFormStructureContext();
  const { conditions } = formStructure;
  const [activeStep, setActiveStep] = useState<ConditionEditorStep>(ConditionEditorStep.EDITOR);

  const completedSteps = useMemo<Record<ConditionEditorStep, boolean>>(() => {
    const newState = modifiedCondition.index !== undefined ? {
      [ConditionEditorStep.EDITOR]: conditions[modifiedCondition.index].groups.some(({ conditions }) => (conditions.length)),
      [ConditionEditorStep.DEPENDENCY_PICKER]: !!conditions[modifiedCondition.index].dependantComponents.length,
    } : {
      [ConditionEditorStep.EDITOR]: false,
      [ConditionEditorStep.DEPENDENCY_PICKER]: false,
    };

    return ({
      ...newState,
      [ConditionEditorStep.SUMMARY]: newState[ConditionEditorStep.EDITOR] && newState[ConditionEditorStep.DEPENDENCY_PICKER],
    });
  }, [conditions]);

  return (
    <div className={styles.content}>
      <Stepper alternativeLabel
               activeStep={activeStep}
               sx={{
                 fontSize: 27,
                 "& .MuiStepLabel-label": {
                   fontSize: 20,
                 },
               }}>
        <Step completed={completedSteps[ConditionEditorStep.EDITOR]}>
          <StepLabel>
            הגדרת תנאים
          </StepLabel>
        </Step>
        <Step completed={completedSteps[ConditionEditorStep.DEPENDENCY_PICKER]}>
          <StepLabel>
            בחירת אלמנטים מותנים
          </StepLabel>
        </Step>
        <Step completed={completedSteps[ConditionEditorStep.SUMMARY]}>
          <StepLabel>
            סיכום ותצוגה מקדימה
          </StepLabel>
        </Step>
      </Stepper>
    </div>
  );
}

export { FormConditionEditor };
export type { ModifiedCondition };