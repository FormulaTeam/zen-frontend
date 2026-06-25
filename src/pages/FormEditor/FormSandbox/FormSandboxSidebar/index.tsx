import { FormManagementActions } from "./FormManagementActions";
import { FormElementCatalog } from "./FormElementCatalog";
import { Switch, Typography } from "@mui/material";
import { useState } from "react";
import styles from "./style.module.css";
import { useFormSandboxContext } from "../context/FormSandboxContext";
import { useFormStructureContext } from "../../context/FormStructureContext";

function FormSandboxSidebar() {
  const { formStructure } = useFormStructureContext();
  const { isInternalNamesShown, toggleInternalNamesShown } = useFormSandboxContext();
  const [isToggleError, setIsToggleError] = useState(false);

  const hasInternalNameErrors = Object.values(formStructure.fields).some(
    (field) => !field.data.name || field.data.name.trim() === "" || !!field.validationErrors?.name
  );

  const handleToggle = () => {
    if (isInternalNamesShown && hasInternalNameErrors) {
      setIsToggleError(true);
      setTimeout(() => setIsToggleError(false), 1000);
      return;
    }

    toggleInternalNamesShown();
  };

  return (
    <div className={styles.sidebar}>
      <Typography
        variant="subtitle1"
        className={`${styles.logicSectionTitle} ${styles.displaySectionTitle}`}>
        תצוגה
      </Typography>

      <div className={styles.displayInternalNames}>
        <Typography sx={{ color: isToggleError ? "error.main" : "inherit", transition: "color 160ms ease" }}>
          הצג שמות פנימיים
        </Typography>
        <Switch
          className={styles.internalNamesSwitch}
          checked={isInternalNamesShown}
          onChange={handleToggle}
          color={isToggleError ? "error" : "primary"}
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
