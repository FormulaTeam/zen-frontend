import { useFormStructureContext } from "../../../context/FormStructureContext";
import { useMemo } from "react";
import styles from "./style.module.css";
import { Typography } from "@mui/material";
import { FormComponentType } from "../../../schemas/conditions";
import { FormConditionsListItem } from "./FormConditionsListItem";

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

        return (
          <FormConditionsListItem key={id}
                                  id={id}
                                  index={index}
                                  name={name}
                                  conditionCount={conditionCount}
                                  dependantComponentNames={dependantComponentNames}
                                  onEdit={() => onEditCondition(index)}
                                  onDelete={() => deleteConditionAt(index)} />

        );
      })
    ) : null
  ), [formStructure.conditions, formStructure.sections, formStructure.fields, onEditCondition]);

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