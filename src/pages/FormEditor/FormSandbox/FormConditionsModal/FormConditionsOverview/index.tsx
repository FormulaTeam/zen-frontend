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
        const conditionCount = groups.reduce((sum, { predicates: currentPredicates }) => sum + currentPredicates.length, 0);
        const dependantComponentNames = Object.keys(dependantComponents).flatMap((componentType) => {
          switch (componentType) {
            case FormComponentType.SECTION:
              return dependantComponents[FormComponentType.SECTION]?.map((sectionId) => (
                `${formStructure.sections[sectionId]?.title ?? COMPONENT_NOT_FOUND_NAME} (מקטע)`
              ));
            case FormComponentType.FIELD:
              return dependantComponents[FormComponentType.FIELD]?.map((fieldId) => (
                formStructure.fields[fieldId]?.data?.displayName ?? COMPONENT_NOT_FOUND_NAME
              ));
          }
        },
        ).join(", ");

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
  ), [formStructure.conditions, formStructure.sections, formStructure.fields, onEditCondition, deleteConditionAt]);

  return (
    <div className={styles.content}>
      <Typography className={styles.header} variant={"h5"}>ניהול התניות</Typography>
      <div className={styles.listContainer}>
        {
          renderConditionsListItems ??
          <div className={styles.noConditionsTextContainer}>
            <Typography color={"#a7abb1"} variant={"h4"} align={"center"} sx={{ userSelect: "none" }}>
              אין התניות מוגדרות
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