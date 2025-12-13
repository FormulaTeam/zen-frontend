import { useFormStructureContext } from "../../../context/FormStructureContext";
import { useMemo } from "react";
import styles from "./style.module.css";
import { Button, Typography } from "@mui/material";
import { FormComponentType } from "../../../schemas/conditions";
import { Delete, Edit } from "@mui/icons-material";

interface Props {
  onEditCondition: (index: number) => void;
}

const COMPONENT_NOT_FOUND_NAME = "לא קיים";

function FormConditionsOverview({ onEditCondition }: Props) {
  const { formStructure, deleteConditionAt } = useFormStructureContext();

  const renderConditionsListItems = useMemo(() => (
    formStructure.conditions?.length ? (
      formStructure.conditions.map(({ id, name, groups, dependantComponents }, index) => {
        const conditionCount = groups.reduce((sum, { conditions: currentConditions }) => sum + currentConditions.length, 0);
        const dependantComponentNames = dependantComponents.map(({ type, id }) => {
          switch (type) {
            case FormComponentType.SECTION:
              return `${formStructure.sections[id]?.title ?? COMPONENT_NOT_FOUND_NAME} (מקטע)`;
            case FormComponentType.FIELD:
              return formStructure.fields[id]?.data?.displayName ?? COMPONENT_NOT_FOUND_NAME;
          }
        }).join(", ");

        //TODO export to a child component
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
                      onClick={() => onEditCondition(index)}>
                <Edit sx={{ fontSize: 25 }} />
              </Button>
              <Button className={styles.actionButton}
                      color={"error"}
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => deleteConditionAt(index)}>
                <Delete sx={{ fontSize: 25, color: "#b53442" }} />
              </Button>
            </div>
          </div>
        );
      })
    ) : null
  ), [formStructure.conditions, formStructure.sections, formStructure.fields]);

  return (
    <div className={styles.content}>
      <div className={styles.listContainer}>
        {
          renderConditionsListItems ??
          <div className={styles.noConditionsTextContainer}>
            <Typography color={"#a7abb1"} variant={"h4"} align={"center"} sx={{ userSelect: "none" }}>
              אין תנאים מוגדרים
            </Typography>
            <Typography color={"#a7abb1"} variant={"h5"} align={"center"} sx={{ userSelect: "none" }}>
              לחצו על "הוספת התנייה חדשה" כדי להתחיל
            </Typography>
          </div>
        }
      </div>
    </div>
  );
}

export { FormConditionsOverview };