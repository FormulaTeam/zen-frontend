import { FormManagementActions } from "./FormManagementActions";
import { FormElementCatalog } from "./FormElementCatalog";
import { Switch, Typography } from "@mui/material";
import styles from "./style.module.css";
import { useFormSandboxContext } from "../context/FormSandboxContext";

function FormSandboxSidebar() {
  const { isInternalNamesShown, toggleInternalNamesShown } = useFormSandboxContext();

  return (
    <div className={styles.sidebar}>
      <Typography variant="subtitle1" className={styles.logicSectionTitle}>
        תצוגה
      </Typography>

      <div className={styles.displayInternalNames}>
        <Typography>הצג שמות פנימיים</Typography>
        <Switch
          className={styles.internalNamesSwitch}
          checked={isInternalNamesShown}
          onChange={toggleInternalNamesShown}
        />{" "}
      </div>

      <Typography variant="subtitle1" className={styles.logicSectionTitle}>
        לוגיקה והתנהגות
      </Typography>

      <FormManagementActions />

      <FormElementCatalog />
    </div>
  );
}

export { FormSandboxSidebar };
