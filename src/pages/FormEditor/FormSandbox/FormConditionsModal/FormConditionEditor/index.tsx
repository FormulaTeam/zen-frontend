import { Button, Step, StepLabel, Stepper } from "@mui/material";
import { FunctionComponent, useMemo, useState } from "react";
import styles from "./style.module.css";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import { FormConditionsBuilder } from "./steps/FormConditionBuilder";
import { FormConditionsDependencyPicker } from "./steps/FormConditionDependencyPicker";
import { FormConditionsSummary } from "./steps/FormConditionSummary";
import { FormConditionEditorContext } from "./context/FormConditionEditorContext";
import { ConditionEditorStepId } from "./constants";
import { useFormConditionEditorData } from "./context/useFormConditionEditorData";

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

interface ConditionEditorStep {
  id: ConditionEditorStepId;
  label: string;
  content: FunctionComponent;
}

const ConditionEditorSteps: ConditionEditorStep[] = [
  {
    id: ConditionEditorStepId.CONDITION_BUILDER,
    label: "הגדרת תנאים",
    content: FormConditionsBuilder,
  },
  {
    id: ConditionEditorStepId.DEPENDENCY_PICKER,
    label: "בחירת אלמנטים מותנים",
    content: FormConditionsDependencyPicker,
  },
  {
    id: ConditionEditorStepId.SUMMARY,
    label: "סיכום ותצוגה מקדימה",
    content: FormConditionsSummary,
  },
];

interface Props {
  modifiedCondition: ModifiedCondition;
  onSubmit: () => void;
  onReturn: () => void;
}

function FormConditionEditor({ modifiedCondition, onSubmit }: Props) {
  const { formStructure: { conditions } } = useFormStructureContext();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [conditionData, setConditionData] = useFormConditionEditorData(modifiedCondition.index !== undefined ? conditions[modifiedCondition.index] : undefined);

  const completedSteps = useMemo<Record<ConditionEditorStepId, boolean>>(() => {
    const newState = modifiedCondition.index !== undefined ? {
      [ConditionEditorStepId.CONDITION_BUILDER]: conditions[modifiedCondition.index].groups.some(({ conditions }) => (conditions.length)),
      [ConditionEditorStepId.DEPENDENCY_PICKER]: !!conditions[modifiedCondition.index].dependantComponents.length,
    } : {
      [ConditionEditorStepId.CONDITION_BUILDER]: false,
      [ConditionEditorStepId.DEPENDENCY_PICKER]: false,
    };

    return ({
      ...newState,
      [ConditionEditorStepId.SUMMARY]: newState[ConditionEditorStepId.CONDITION_BUILDER] && newState[ConditionEditorStepId.DEPENDENCY_PICKER],
    });
  }, [conditions]);

  const isFirstStepActive = activeStepIndex === 0;
  const isLastStepActive = activeStepIndex === ConditionEditorSteps.length - 1;

  const handleNext = () => {
    !isLastStepActive ?
      setActiveStepIndex((prev) => (prev + 1)) :
      onSubmit();
  };

  const handlePrev = () => {
    !isFirstStepActive &&
    setActiveStepIndex((prev) => prev - 1);
  };

  const StepContent = ConditionEditorSteps[activeStepIndex].content;

  return (
    <div className={styles.container}>
      <div className={styles.stepperContainer}>
        <Stepper alternativeLabel
                 activeStep={activeStepIndex}
                 sx={{
                   fontSize: 27,
                   "& .MuiStepLabel-label": {
                     fontSize: 20,
                   },
                 }}>
          {
            ConditionEditorSteps.map(({ id, label }) => (
              <Step key={id} completed={completedSteps[id]}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))
          }
        </Stepper>
      </div>
      <div className={styles.contentContainer}>
        <FormConditionEditorContext.Provider
          value={{
            conditionData,
            setConditionData,
          }}>
          <StepContent />
        </FormConditionEditorContext.Provider>
      </div>
      <div className={styles.footer}>
        <Button variant={isLastStepActive ? "contained" : "outlined"}
                className={styles.button}
                size={"large"}
                onClick={handleNext}>
          {isLastStepActive ? "שמור" : "הבא"}
        </Button>
        {
          activeStepIndex !== 0 &&
          <Button variant={"outlined"}
                  className={styles.button}
                  size={"large"}
                  onClick={handlePrev}>
            הקודם
          </Button>
        }
      </div>
    </div>
  );
}

export { FormConditionEditor };
export type { ModifiedCondition };