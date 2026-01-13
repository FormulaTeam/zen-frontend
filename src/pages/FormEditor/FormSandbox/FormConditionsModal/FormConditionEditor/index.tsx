import { Button, Step, StepLabel, Stepper } from "@mui/material";
import { FunctionComponent, useCallback, useEffect, useMemo, useState } from "react";
import styles from "./style.module.css";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import { FormConditionsBuilder } from "./steps/FormConditionBuilder";
import { FormConditionsDependencyPicker } from "./steps/FormConditionDependencyPicker";
import { FormConditionsSummary } from "./steps/FormConditionSummary";
import { FormConditionEditorContext } from "./context/FormConditionEditorContext";
import { ConditionEditorStepId } from "./constants";
import { ConditionEditorValidationErrors, useFormConditionEditorData } from "./context/useFormConditionEditorData";
import { ValueOf } from "../../../../../types/utils";
import {
  validateCondition,
  validateConditionDependantComponents,
  validateConditionGroups,
} from "../../../hooks/useFormStructure";
import { FormCondition } from "../../../schemas/conditions";

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
  id: ValueOf<typeof ConditionEditorStepId>;
  label: string;
  content: FunctionComponent;
  validator: (conditionData: FormCondition) => ValueOf<ConditionEditorValidationErrors>;
}

const ConditionEditorSteps = [
  {
    id: ConditionEditorStepId.CONDITION_BUILDER,
    label: "הגדרת תנאים",
    content: FormConditionsBuilder,
    validator: ({ groups }) => validateConditionGroups(groups),
  },
  {
    id: ConditionEditorStepId.DEPENDENCY_PICKER,
    label: "בחירת אלמנטים מותנים",
    content: FormConditionsDependencyPicker,
    validator: ({ dependantComponents }) => validateConditionDependantComponents(dependantComponents),
  },
  {
    id: ConditionEditorStepId.SUMMARY,
    label: "סיכום ותצוגה מקדימה",
    content: FormConditionsSummary,
    validator: (conditionData) => validateCondition(conditionData),
  },
] as const satisfies ConditionEditorStep[];

interface Props {
  modifiedCondition: ModifiedCondition;
  onSubmit: () => void;
  onReturn: () => void;
}

function FormConditionEditor({ modifiedCondition, onSubmit }: Props) {
  const { formStructure: { conditions } } = useFormStructureContext();
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const {
    conditionData,
    setConditionData,
    validationErrors,
    setStepValidationErrors,
  } = useFormConditionEditorData(modifiedCondition.index !== undefined ? conditions[modifiedCondition.index] : undefined);

  const completedSteps = useMemo<Record<ValueOf<typeof ConditionEditorStepId>, boolean>>(() => {
    const newState = !!conditionData ? {
      [ConditionEditorStepId.CONDITION_BUILDER]: !!conditionData.groups?.some((group) => (group?.conditions?.some((condition) => !!condition?.field))),
      [ConditionEditorStepId.DEPENDENCY_PICKER]: Object.keys(conditionData.dependantComponents).some((dependantComponentType) => (conditionData.dependantComponents[dependantComponentType]?.length)),
    } : {
      [ConditionEditorStepId.CONDITION_BUILDER]: false,
      [ConditionEditorStepId.DEPENDENCY_PICKER]: false,
    };

    return ({
      ...newState,
      [ConditionEditorStepId.SUMMARY]: (
        newState[ConditionEditorStepId.CONDITION_BUILDER] &&
        newState[ConditionEditorStepId.DEPENDENCY_PICKER]
      ),
    });
  }, [conditionData]);

  const isFirstStepActive = activeStepIndex === 0;
  const isLastStepActive = activeStepIndex === ConditionEditorSteps.length - 1;

  const validateCurrentStep = useCallback(() => {
    const errors = ConditionEditorSteps[activeStepIndex].validator(conditionData as FormCondition);
    setStepValidationErrors(ConditionEditorSteps[activeStepIndex].id, errors);

    console.log(errors);
    console.log(conditionData);

    return errors;
  }, [conditionData, activeStepIndex]);

  const handleNext = useCallback(() => {
    const validationErrors = validateCurrentStep();

    if (!validationErrors) {
      !isLastStepActive ?
        (completedSteps[activeStepIndex] && setActiveStepIndex((prev) => (prev + 1))) :
        onSubmit();
    }
  }, [validateCurrentStep, completedSteps]);

  const handlePrev = useCallback(() => {
    validateCurrentStep();

    !isFirstStepActive &&
    setActiveStepIndex((prev) => prev - 1);
  }, [validateCurrentStep]);

  useEffect(() => {
    validateCurrentStep();
  }, [conditionData]);

  const StepContent = ConditionEditorSteps[activeStepIndex].content;

  return (
    <div className={styles.container}>
      <div className={styles.stepperContainer}>
        <Stepper alternativeLabel activeStep={activeStepIndex} sx={{ fontSize: 27 }}>
          {
            ConditionEditorSteps.map(({ id, label }, index) => (
              <Step key={id}
                    completed={completedSteps[id]}
                    sx={{
                      "& .MuiStepLabel-label": {
                        transition: "all 100ms ease-in-out",
                        lineHeight: "21px",
                        ...(
                          index === activeStepIndex ? {
                            color: "#1976D2 !important",
                            fontSize: 21,
                            fontWeight: "bold !important",
                          } : {
                            fontWeight: 500,
                            fontSize: 20,
                          }),
                      },
                    }}>
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
            validationErrors,
            setStepValidationErrors,
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