import { useFormConditionEditorContext } from "../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../constants";
import { Button } from "@mui/material";
import styles from "./style.module.scss";
import { FormConditionOperator } from "../../../../../schemas/conditions";
import { Add } from "@mui/icons-material";
import { generateEmptyConditionGroup } from "../../context/utils";
import { FormConditionGroupElement } from "./FormConditionGroupElement";
import { useEffect, useMemo, useState } from "react";
import { usePrevious } from "@dnd-kit/utilities";

function FormConditionsBuilder() {
  const { conditionData: { groups }, setData } = useFormConditionEditorContext(ConditionEditorStepId.CONDITION_BUILDER);
  const [scrollNewGroupIntoView, setScrollNewGroupIntoView] = useState(false);

  const totalConditionsCount = useMemo(() => (
    groups?.flatMap((group) => group?.conditions).length
  ), [groups]);

  const previousTotalConditionCount = usePrevious(totalConditionsCount);
  const previousGroupCount = usePrevious(groups?.length);

  const hasMultipleGroups = (groups?.length ?? 0) > 1;

  useEffect(() => {
    (
      (previousGroupCount !== undefined && (previousGroupCount < (groups?.length ?? 0))) ||
      (previousTotalConditionCount !== undefined && (previousTotalConditionCount < (totalConditionsCount ?? 0)))
    ) &&
    setScrollNewGroupIntoView(true);
  }, [groups?.length, totalConditionsCount]);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.conditionsContainer}>
        {
          groups?.map((group, groupIndex) => (
            group &&
            <FormConditionGroupElement key={group.id}
                                       group={group}
                                       index={groupIndex}
                                       hasSiblings={hasMultipleGroups}
                                       shouldScrollIntoView={scrollNewGroupIntoView}
                                       setData={setData} />
          ))
        }
      </div>
      <div className={styles.floatingFooter}>
        <Button startIcon={<Add />}
                variant={"contained"}
                size={"medium"}
                onClick={() => {
                  setData((prev) => {
                    const groups = [...prev];
                    groups.push({ ...generateEmptyConditionGroup(), operator: FormConditionOperator.AND });

                    return groups;
                  });
                }}>
          הוספת קבוצת תנאים חדשה
        </Button>
      </div>
    </div>
  );
}

export { FormConditionsBuilder };