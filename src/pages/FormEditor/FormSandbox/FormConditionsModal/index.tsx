import { Button, Modal, Typography } from "@mui/material";
import { useFormSandboxContext } from "../context/FormSandboxContext";
import { useState } from "react";
import styles from "./style.module.css";
import { FormConditionsOverview } from "./FormConditionsOverview";
import { Add, Close, List } from "@mui/icons-material";
import { FormConditionEditor, ModifiedCondition } from "./FormConditionEditor";

function FormConditionsModal() {
  const { isConditionsDialogOpen, setIsConditionsDialogOpen } = useFormSandboxContext();
  const [modifiedCondition, setModifiedCondition] = useState<ModifiedCondition | null>(null);

  const handleClose = () => {
    setIsConditionsDialogOpen(false);
    setModifiedCondition(null);
  };

  const handleReturnToOverview = () => {
    setModifiedCondition(null);
  };

  return (
    <Modal className={styles.modal} open={isConditionsDialogOpen}>
      <div className={styles.content}>
        <div className={styles.header}>
          <Button className={styles.headerButton}
                  variant={"outlined"}
                  style={{ display: modifiedCondition ? "block" : "none" }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleReturnToOverview}>
            <List sx={{ fontSize: 26, transform:'scaleX(-1)' }} />
          </Button>
          {!modifiedCondition && <Typography variant={"h5"}>ניהול התניות</Typography>}
          <Button className={styles.headerButton}
                  variant={"outlined"}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={handleClose}>
            <Close sx={{ fontSize: 25 }} />
          </Button>
        </div>
        {
          modifiedCondition !== null ? (
            <div className={styles.editorContainer}>
              <FormConditionEditor modifiedCondition={modifiedCondition}
                                   onSubmit={() => setModifiedCondition(null)}
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