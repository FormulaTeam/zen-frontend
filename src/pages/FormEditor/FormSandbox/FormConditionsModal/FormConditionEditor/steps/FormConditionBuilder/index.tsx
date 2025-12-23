import { useFormConditionEditorContext } from "../../context/FormConditionEditorContext";
import { ConditionEditorStepId } from "../../constants";
import { Button } from "@mui/material";
import styles from "./style.module.scss";
import { FormConditionOperator } from "../../../../../schemas/conditions";
import { Add } from "@mui/icons-material";
import { generateEmptyConditionGroup } from "../../context/utils";
import { FormConditionGroupElement } from "./FormConditionGroupElement";
import { useState } from "react";
import { useEffectAfterMount } from "../../../../../../../hooks/utilsHooks/useEffectAfterMount";

function FormConditionsBuilder() {
  const { conditionData: { groups }, setData } = useFormConditionEditorContext(ConditionEditorStepId.CONDITION_BUILDER);
  const [scrollNewGroupIntoView, setScrollNewGroupIntoView] = useState(false);

  const hasMultipleGroups = (groups?.length ?? 0) > 1;

  useEffectAfterMount(() => {
    setScrollNewGroupIntoView(true);
  }, [groups]);

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