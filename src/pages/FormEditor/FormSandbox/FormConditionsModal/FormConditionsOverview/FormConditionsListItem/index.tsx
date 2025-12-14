import styles from "./style.module.css";
import { Button, Typography } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

interface Props {
  id: string;
  index: number;
  conditionCount: number;
  dependantComponentNames: string;
  onEdit: () => void;
  onDelete: () => void;

  name?: string;
}

function FormConditionsListItem({
                                  id,
                                  index,
                                  name,
                                  conditionCount,
                                  dependantComponentNames,
                                  onEdit,
                                  onDelete,
                                }: Props) {

  return (
    <div key={id} className={styles.itemContainer}>
      <div className={styles.itemDetails}>
        <Typography variant={"h6"}>
          {name ?? `התנייה #${index + 1}`}
        </Typography>
        <Typography variant={"body1"}>
          {`${conditionCount} תנאים מוחלים על: ${dependantComponentNames}`}
        </Typography>
      </div>
      <div className={styles.itemActions}>
        <Button className={styles.actionButton}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onEdit}>
          <Edit sx={{ fontSize: 25 }} />
        </Button>
        <Button className={styles.actionButton}
                color={"error"}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onDelete}>
          <Delete sx={{ fontSize: 25, color: "#b53442" }} />
        </Button>
      </div>
    </div>
  );
}

export { FormConditionsListItem };