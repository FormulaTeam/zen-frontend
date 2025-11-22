import { Add, Info, Settings } from "@mui/icons-material";
import styles from "./style.module.css";
import { texts } from "../../../../../utils/texts";
import { Button, Tooltip } from "@mui/material";
import { useFormStructureContext } from "../../../context/FormStructureContext";

function FormManagementActions() {
  const { appendSection } = useFormStructureContext();

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
                variant={"contained"}>
          ניהול התניות
        </Button>
        <Tooltip title={texts.heb.createSectionAnnounce}>
          <Info color="disabled" sx={{ cursor: "pointer" }} />
        </Tooltip>
      </>
    </div>
  );
}

export { FormManagementActions };