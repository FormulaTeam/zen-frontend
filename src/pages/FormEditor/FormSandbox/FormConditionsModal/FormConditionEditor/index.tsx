import { Step, StepContent, StepLabel, Stepper } from "@mui/material";
import { useState } from "react";
import styles from "./style.module.css";

function FormConditionEditor() {
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  return (
    <div className={styles.content}>
      <Stepper alternativeLabel sx={{
        fontSize: 27,
        "& .MuiStepLabel-label": {
          fontSize: 20,
        },
      }}>
        <Step completed={completedSteps[0]}>
          <StepLabel>
            הגדרת תנאים
          </StepLabel>
          <StepContent>

          </StepContent>
        </Step>
        <Step completed={completedSteps[1]}>
          <StepLabel>
            בחירת אלמנטים מותנים
          </StepLabel>
          <StepContent>

          </StepContent>
        </Step>
        <Step completed={completedSteps[2]}>
          <StepLabel>
            סיכום ותצוגה מקדימה
          </StepLabel>
          <StepContent>

          </StepContent>
        </Step>
      </Stepper>
    </div>
  );
}

export { FormConditionEditor };