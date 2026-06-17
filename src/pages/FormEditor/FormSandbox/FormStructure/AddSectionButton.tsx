import { AddOutlined, InfoOutlined } from "@mui/icons-material";
import { Button, Tooltip } from "@mui/material";
import { texts } from "@utils/texts";
import { useFormStructureContext } from "../../context/FormStructureContext";
import styles from "./style.module.css";

function AddSectionButton() {
  const { appendSection } = useFormStructureContext();

  return (
    <div className={styles.addSectionRow}>
      <Button className={styles.addSectionButton} onClick={appendSection}>
        <span>יצירת מקטע</span>
        <AddOutlined className={styles.addSectionIcon} />
      </Button>

      <Tooltip title={texts.heb.createSectionAnnounce}>
        <InfoOutlined className={styles.addSectionInfoIcon} />
      </Tooltip>
    </div>
  );
}

export { AddSectionButton };
