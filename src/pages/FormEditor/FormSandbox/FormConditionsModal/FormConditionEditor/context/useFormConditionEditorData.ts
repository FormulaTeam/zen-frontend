import { FormCondition } from "../../../../schemas/conditions";
import { useMemo, useState } from "react";
import { DeepPartial } from "../../../../../../types/utils";
import { generateEmptyCondition } from "./utils";
import { generateConditionId } from "../../../../utils";

function useFormConditionEditorData(editedConditionData?: FormCondition) {
  const initialState = useMemo(() => {
    const initialState: DeepPartial<FormCondition> = !!editedConditionData ? { ...editedConditionData } : generateEmptyCondition();

    if (!editedConditionData) {
      initialState.groups?.[0]?.conditions?.push({ id: generateConditionId() });
    }

    return initialState;
  }, []);


  return useState<DeepPartial<FormCondition>>(initialState);
}

export { useFormConditionEditorData };