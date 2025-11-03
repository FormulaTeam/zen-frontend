import styles from "./style.module.css";
import { getFormIconByName } from "../../../utils/utils";
import { Button, IconButton, Tooltip, Typography } from "@mui/material";
import { CustomIcon } from "../../../theme/icons";
import { useFormEditorContext } from "../context/FormEditorContext";
import { useFormStructureContext } from "../context/FormStructureContext";

interface Props {
  formIconName?: string;
}

function FormEditorHeader({ formIconName }: Props) {
  const { mode } = useFormEditorContext();
  const { formStructure } = useFormStructureContext();

  const { title, description } = formStructure;

  return (
    <div className={styles.header}>
      <div className={styles.headerStart}>
        <div className={styles.formIconWrapper}>
          <img src={getFormIconByName(formIconName)}
               alt={"icon"}
               className={styles.formIcon}
               onClick={() => null} />
        </div>
        <div>
          <Typography variant="h5">
            {title ?? "שם הטופס"}
            <Tooltip title="עריכת פרטי הטופס">
              <IconButton onClick={() => null}>
                <CustomIcon iconName="edit" />
              </IconButton>
            </Tooltip>
          </Typography>
          <Typography variant="subtitle1">{description ?? "ללא תיאור"}</Typography>
        </div>
      </div>
      <div className={styles.headerEnd}>
        <Button variant={"contained"} color={"primary"}>שמירה</Button>
        <Button variant={"outlined"} color={"error"}>יציאה</Button>
      </div>
    </div>
  );
}

export { FormEditorHeader };