import { createContext, SetStateAction, useContext } from "react";
import { FormCondition, FormConditionDependantComponents, FormConditionGroups } from "../../../../schemas/conditions";
import { DeepPartial, ValueOf } from "../../../../../../types/utils";
import { ConditionEditorStepId } from "../constants";

interface FormConditionEditorContext {
  conditionData: DeepPartial<FormCondition> & {
    dependantComponents: FormConditionDependantComponents
  };
  setConditionData: (
    value: SetStateAction<DeepPartial<FormCondition> & {
      dependantComponents: FormConditionDependantComponents
    }>) => void;
}

type SetFunction<T extends ValueOf<typeof ConditionEditorStepId>> =
  T extends typeof ConditionEditorStepId.CONDITION_BUILDER ?
    (groups: SetStateAction<DeepPartial<FormConditionGroups>>) => void : (
      T extends typeof ConditionEditorStepId.DEPENDENCY_PICKER ?
        (dependantComponents: SetStateAction<FormConditionDependantComponents>) => void :
        undefined
      );

const FormConditionEditorContext = createContext<FormConditionEditorContext>({
  conditionData: { dependantComponents: {} },
  setConditionData: () => null,
});

function useFormConditionEditorContext<T extends ValueOf<typeof ConditionEditorStepId>>(stepId: T) {
  const { setConditionData, ...restContext } = useContext(FormConditionEditorContext);

  function setConditionGroups(groups: SetStateAction<DeepPartial<FormConditionGroups>>) {
    setConditionData((prev) => {
      return {
        ...prev,
        groups: typeof groups === "function" ? groups(prev.groups ?? []) : groups,
      };
    });
  }

  function setConditionDependantComponents(dependantComponents: SetStateAction<FormConditionDependantComponents>) {
    setConditionData((prev) => {
      return {
        ...prev,
        dependantComponents: typeof dependantComponents === "function" ?
          dependantComponents(prev.dependantComponents ?? {}) :
          dependantComponents,
      };
    });
  }

  const stepIdToSetter = {
    [ConditionEditorStepId.CONDITION_BUILDER]: setConditionGroups,
    [ConditionEditorStepId.DEPENDENCY_PICKER]: setConditionDependantComponents,
  } as const;

  return {
    ...restContext,
    setData: stepIdToSetter[stepId as keyof typeof stepIdToSetter] as SetFunction<T>,
  };
}

export { FormConditionEditorContext, useFormConditionEditorContext };