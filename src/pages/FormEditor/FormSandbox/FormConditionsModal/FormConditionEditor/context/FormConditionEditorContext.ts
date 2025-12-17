import { createContext, SetStateAction, useContext } from "react";
import { FormCondition, FormConditionDependantComponents, FormConditionGroups } from "../../../../schemas/conditions";
import { DeepPartial } from "../../../../../../types/utils";
import { ConditionEditorStepId } from "../constants";

interface FormConditionEditorContext {
  conditionData: DeepPartial<FormCondition>;
  setConditionData: (value: SetStateAction<DeepPartial<FormCondition>>) => void;
}

const FormConditionEditorContext = createContext<FormConditionEditorContext>({
  conditionData: {},
  setConditionData: () => null,
});

function useFormConditionEditorContext(stepId: ConditionEditorStepId) {
  const { setConditionData, ...restContext } = useContext(FormConditionEditorContext);

  function setConditionGroups(groups: SetStateAction<DeepPartial<FormConditionGroups>>) {
    setConditionData((prev) => {
      return {
        ...prev,
        groups: typeof groups === "function" ? groups(prev.groups ?? []) : groups,
      };
    });
  }

  function setConditionDependantComponents(dependantComponents: SetStateAction<DeepPartial<FormConditionDependantComponents>>) {
    setConditionData((prev) => {
      return {
        ...prev,
        dependantComponents: typeof dependantComponents === "function" ? dependantComponents(prev.dependantComponents ?? []) : dependantComponents,
      };
    });
  }

  const stepIdToSetter = {
    [ConditionEditorStepId.CONDITION_BUILDER]: setConditionGroups,
    [ConditionEditorStepId.DEPENDENCY_PICKER]: setConditionDependantComponents,
  } as const;

  return {
    ...restContext,
    setData:
      (stepId === ConditionEditorStepId.CONDITION_BUILDER || stepId === ConditionEditorStepId.DEPENDENCY_PICKER) ?
        stepIdToSetter[stepId] :
        undefined,
  };
}

export { FormConditionEditorContext, useFormConditionEditorContext };