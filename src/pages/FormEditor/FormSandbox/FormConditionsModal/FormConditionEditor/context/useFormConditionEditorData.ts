import { FormCondition, FormConditionDependantComponents } from "../../../../schemas/conditions";
import { useMemo, useState } from "react";
import { DeepPartial } from "../../../../../../types/utils";
import { generateEmptyCondition } from "./utils";

function useFormConditionEditorData(editedConditionData?: FormCondition) {
  const initialState = useMemo(() => ((
    !!editedConditionData ? { ...editedConditionData } : generateEmptyCondition()
  ) as DeepPartial<FormCondition> & { dependantComponents: FormConditionDependantComponents }), []);

  return useState<DeepPartial<FormCondition> & { dependantComponents: FormConditionDependantComponents }>(initialState);
}

export { useFormConditionEditorData };