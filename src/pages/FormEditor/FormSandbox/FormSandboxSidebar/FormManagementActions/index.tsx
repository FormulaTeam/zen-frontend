import { Add, Info, Settings } from "@mui/icons-material";
import styles from "./style.module.css";
import { texts } from "../../../../../utils/texts";
import { Button, Tooltip } from "@mui/material";
import { useFormStructureContext } from "../../../context/FormStructureContext";
import { useFormSandboxContext } from "../../context/FormSandboxContext";

function FormManagementActions() {
  const { appendSection } = useFormStructureContext();
  const { setIsConditionsDialogOpen } = useFormSandboxContext();

  return (
    <div className={styles.managementButtonsContainer}>
      <>
        <Button startIcon={<Add />}
          variant={"contained"}
          size={"medium"}
          onClick={appendSection}>
          יצירת מקטע
        </Button>
        <Tooltip title={texts.heb.createSectionAnnounce}>
          <Info color="disabled" sx={{ cursor: "pointer" }} />
        </Tooltip>
      </>
      <>
        <Button startIcon={<Settings sx={{ marginLeft: "4px" }} />}
          variant={"contained"}
          onClick={() => setIsConditionsDialogOpen(true)}>
          ניהול התניות
        </Button>
        <Tooltip title={texts.heb.createConditionsAnnounce}>
          <Info color="disabled" sx={{ cursor: "pointer" }} />
        </Tooltip>
      </>
    </div>
  );
}

export { FormManagementActions };