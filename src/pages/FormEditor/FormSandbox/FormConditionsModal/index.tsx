import { Button, Modal } from "@mui/material";
import { useFormSandboxContext } from "../context/FormSandboxContext";
import { useCallback, useState } from "react";
import styles from "./style.module.css";
import { FormConditionsOverview } from "./FormConditionsOverview";
import { Add, Close, List } from "@mui/icons-material";
import { FormConditionEditor, ModifiedCondition } from "./FormConditionEditor";
import { useFormStructureContext } from "../../context/FormStructureContext";
import { FormCondition } from "../../schemas/conditions";

function FormConditionsModal() {
  const { appendCondition, setConditionDataAt } = useFormStructureContext();
  const { isConditionsDialogOpen, setIsConditionsDialogOpen } = useFormSandboxContext();
  const [modifiedCondition, setModifiedCondition] = useState<ModifiedCondition | null>(null);

  const handleClose = () => {
    setIsConditionsDialogOpen(false);
    setModifiedCondition(null);
  };

  const handleReturnToOverview = () => {
    setModifiedCondition(null);
  };

  const handleSubmit = useCallback((condition: FormCondition) => {
    const validationErrors = (
      modifiedCondition?.status === "existing" ?
        setConditionDataAt(modifiedCondition.index, condition) :
        appendCondition(condition)
    );

    !validationErrors && setModifiedCondition(null);
  }, [appendCondition, modifiedCondition, setConditionDataAt]);

  return (
    <Modal className={styles.modal} open={isConditionsDialogOpen}>
      <div className={styles.content}>
        <div className={styles.header}>
          <div className={styles.conditionsListButtonContainer}
            style={{ display: modifiedCondition ? "block" : "none" }}>
            <Button className={styles.headerButton}
              variant={"outlined"}
              onClick={handleReturnToOverview}>
              <List sx={{ fontSize: 26, transform: "scaleX(-1)" }} />
            </Button>
          </div>
          <div className={styles.closeButtonContainer}>
            <Button className={styles.headerButton}
              variant={"outlined"}
              onClick={handleClose}>
              <Close sx={{ fontSize: 25 }} />
            </Button>
          </div>
        </div>
        {
          modifiedCondition !== null ? (
            <div className={styles.editorContainer}>
              <FormConditionEditor modifiedCondition={modifiedCondition}
                onSubmit={handleSubmit}
                onReturn={handleReturnToOverview} />
            </div>
          ) : (
            <div className={styles.overviewContainer}>
              <div className={styles.overviewWrapper}>
                <FormConditionsOverview onEditCondition={(index) => (
                  setModifiedCondition({ index, status: "existing" })
                )} />
              </div>
              <Button startIcon={<Add />}
                variant={"contained"}
                size={"large"}
                onClick={() => setModifiedCondition({ status: "new" })}>
                הוספת התנייה חדשה
              </Button>
            </div>
          )
        }
      </div>
    </Modal>
  );
}

export { FormConditionsModal };