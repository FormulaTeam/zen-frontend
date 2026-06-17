import { InfoOutlined, SettingsOutlined } from "@mui/icons-material";
import styles from "./style.module.css";
import { texts } from "../../../../../utils/texts";
import { Button, Tooltip } from "@mui/material";
import { useFormSandboxContext } from "../../context/FormSandboxContext";

function FormManagementActions() {
  const { setIsConditionsDialogOpen } = useFormSandboxContext();

  return (
    <div className={styles.managementButtonsContainer}>
      <div className={styles.managementActionRow}>
        <Tooltip title={texts.heb.createConditionsAnnounce}>
          <InfoOutlined className={styles.managementInfoIcon} />
        </Tooltip>

        <Button
          className={styles.managementActionButton}
          onClick={() => setIsConditionsDialogOpen(true)}>
          <SettingsOutlined className={styles.managementActionIcon} />
          <span className={styles.managementActionText}>ניהול התניות</span>
        </Button>
      </div>
    </div>
  );
}

export { FormManagementActions };
