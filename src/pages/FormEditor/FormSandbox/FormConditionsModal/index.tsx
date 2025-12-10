import { Modal, Step, StepButton, StepContent, Stepper } from "@mui/material";
import { useFormSandboxContext } from "../../context/FormSandboxContext";
import { useState } from "react";
import styles from "./style.module.css";

function FormConditionsModal() {
  const { isConditionsDialogOpen, setIsConditionsDialogOpen } = useFormSandboxContext();
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  return (
    <Modal className={styles.modal} open={isConditionsDialogOpen} onClose={() => setIsConditionsDialogOpen(false)}>
      <div className={styles.content}>
        <Stepper>
          <Step completed={completedSteps[0]}>
            <StepButton>

            </StepButton>
            <StepContent>

            </StepContent>
          </Step>
        </Stepper>
      </div>
    </Modal>
  );
}

export { FormConditionsModal };