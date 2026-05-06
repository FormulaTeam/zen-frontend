import { Button, Step, StepLabel, Stepper, Tooltip } from "@mui/material";
import { FunctionComponent, useCallback, useMemo, useState } from "react";
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
  validateConditionDependantComponents,
  validateConditionPredicateGroups,
  validateConditionSummary,
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
    validator: ({ groups }) => validateConditionPredicateGroups(groups),
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
    validator: ({ name }) => validateConditionSummary({ name }),
  },
] as const satisfies ConditionEditorStep[];

interface Props {
  modifiedCondition: ModifiedCondition;
  onSubmit: (condition: FormCondition) => void;
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

  const [completedSteps, setCompletedSteps] = useState<Record<ValueOf<typeof ConditionEditorStepId>, boolean>>(
    modifiedCondition.index !== undefined ? {
      [ConditionEditorStepId.CONDITION_BUILDER]: true,
      [ConditionEditorStepId.DEPENDENCY_PICKER]: true,
      [ConditionEditorStepId.SUMMARY]: true,
    } : {
      [ConditionEditorStepId.CONDITION_BUILDER]: false,
      [ConditionEditorStepId.DEPENDENCY_PICKER]: false,
      [ConditionEditorStepId.SUMMARY]: false,
    });

  const isFirstStepActive = useMemo(() => activeStepIndex === 0, [activeStepIndex]);
  const isLastStepActive = useMemo(() => activeStepIndex === ConditionEditorSteps.length - 1, [activeStepIndex]);
  const isDependencyPickerStep = useMemo(() => ConditionEditorSteps[activeStepIndex].id === ConditionEditorStepId.DEPENDENCY_PICKER, [activeStepIndex]);

  const hasDependencies = useMemo(() => {
    if (!conditionData.dependantComponents) return false;
    return Object.values(conditionData.dependantComponents).some((arr) => arr && arr.length > 0);
  }, [conditionData.dependantComponents]);

  const disableNext = isDependencyPickerStep && !hasDependencies;

  const validateSteps = useCallback(() => {
    let activeStepErrors: ValueOf<ConditionEditorValidationErrors> = null;

    ConditionEditorSteps.forEach((step, stepIndex) => {
      if (stepIndex === activeStepIndex || completedSteps[stepIndex]) {
        const errors = step.validator(conditionData as FormCondition);

        setCompletedSteps((prev) => ({ ...prev, [stepIndex]: !errors }));
        setStepValidationErrors(ConditionEditorSteps[stepIndex].id, errors);

        if (stepIndex === activeStepIndex) {
          activeStepErrors = errors;
        }
      }
    });

    return activeStepErrors;
  }, [conditionData, activeStepIndex, setStepValidationErrors, completedSteps]);

  const handleNext = useCallback(() => {
    const validationErrors = validateSteps();

    if (!validationErrors) {
      !isLastStepActive ?
        setActiveStepIndex((prev) => (prev + 1)) :
        onSubmit(conditionData as FormCondition);
    }
  }, [validateSteps, onSubmit, conditionData, isLastStepActive]);

  const handlePrev = useCallback(() => {
    // validateSteps();

    !isFirstStepActive &&
      setActiveStepIndex((prev) => prev - 1);
  }, [isFirstStepActive]);

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
                    ...(completedSteps[id] && { color: "#1976D2 !important" }),
                    ...(
                      index === activeStepIndex ? {
                        fontSize: 21,
                        fontWeight: "bold !important",
                      } : {
                        fontWeight: 500,
                        fontSize: 20,
                      }),
                  },
                }}>
                <StepLabel error={!!validationErrors[id]}>{label}</StepLabel>
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
        <Tooltip title={disableNext ? "יש לבחור לפחות שדה אחד או מקטע אחד שיוצגו כאשר התנאים מתקיימים" : ""} placement="top">
          <span>
            <Button variant={isLastStepActive ? "contained" : "outlined"}
              className={styles.button}
              size={"large"}
              disabled={disableNext}
              onClick={handleNext}>
              {isLastStepActive ? "שמור" : "הבא"}
            </Button>
          </span>
        </Tooltip>
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