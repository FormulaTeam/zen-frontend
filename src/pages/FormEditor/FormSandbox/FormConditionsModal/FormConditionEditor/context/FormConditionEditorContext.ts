import { createContext, SetStateAction, useCallback, useContext, useState } from "react";
import { FormCondition, FormConditionDependantComponents, FormConditionGroups } from "../../../../schemas/conditions";
import { DeepPartial, ValueOf } from "../../../../../../types/utils";
import { ConditionEditorStepId } from "../constants";
import { useEffectAfterMount } from "../../../../../../hooks/utilsHooks/useEffectAfterMount";
import { EMPTY_VALIDATION_ERRORS, useFormConditionEditorData } from "./useFormConditionEditorData";

interface FormConditionEditorContext {
  conditionData: DeepPartial<FormCondition> & {
    dependantComponents: FormConditionDependantComponents
  };
  setConditionData: (
    value: SetStateAction<DeepPartial<FormCondition> & {
      dependantComponents: FormConditionDependantComponents
    }>) => void;
  validationErrors: ReturnType<typeof useFormConditionEditorData>["validationErrors"],
  setStepValidationErrors: ReturnType<typeof useFormConditionEditorData>["setStepValidationErrors"],
}

type SetFunction<T extends ValueOf<typeof ConditionEditorStepId>> =
  T extends typeof ConditionEditorStepId.CONDITION_BUILDER ?
    (groups: SetStateAction<DeepPartial<FormConditionGroups>>) => void : (
      T extends typeof ConditionEditorStepId.DEPENDENCY_PICKER ?
        (dependantComponents: SetStateAction<FormConditionDependantComponents>) => void :
        (name: string | undefined) => void
      );

const FormConditionEditorContext = createContext<FormConditionEditorContext>({
  conditionData: { dependantComponents: {} },
  setConditionData: () => null,
  validationErrors: { ...EMPTY_VALIDATION_ERRORS },
  setStepValidationErrors: () => null,
});

function useFormConditionEditorContext<T extends ValueOf<typeof ConditionEditorStepId>>(stepId: T) {
  const { setConditionData, setStepValidationErrors, ...restContext } = useContext(FormConditionEditorContext);
  const [isDataChanged, setIsDataChanged] = useState(false);

  useEffectAfterMount(() => {
    setIsDataChanged(true);
  }, [isDataChanged]);

  const setConditionGroups: SetFunction<typeof ConditionEditorStepId.CONDITION_BUILDER> = useCallback((groups) => {
    // setStepValidationErrors(ConditionEditorStepId.CONDITION_BUILDER, null);

    setConditionData((prev) => {
      return {
        ...prev,
        groups: typeof groups === "function" ? groups(prev.groups ?? []) : groups,
      };
    });
  }, []);

  const setConditionDependantComponents: SetFunction<typeof ConditionEditorStepId.DEPENDENCY_PICKER> = useCallback((dependantComponents) => {
    // setStepValidationErrors(ConditionEditorStepId.DEPENDENCY_PICKER, null);

    setConditionData((prev) => {
      return {
        ...prev,
        dependantComponents: typeof dependantComponents === "function" ?
          dependantComponents(prev.dependantComponents ?? {}) :
          dependantComponents,
      };
    });
  }, []);

  const setConditionName: SetFunction<typeof ConditionEditorStepId.SUMMARY> = useCallback((name) => {
    // setStepValidationErrors(ConditionEditorStepId.SUMMARY, null);

    setConditionData((prev) => {
      return {
        ...prev,
        name,
      };
    });
  }, []);

  const stepIdToSetter = {
    [ConditionEditorStepId.CONDITION_BUILDER]: setConditionGroups,
    [ConditionEditorStepId.DEPENDENCY_PICKER]: setConditionDependantComponents,
    [ConditionEditorStepId.SUMMARY]: setConditionName,
  } as const;

  return {
    ...restContext,
    setData: stepIdToSetter[stepId as keyof typeof stepIdToSetter] as SetFunction<T>,
    isDataChanged,
  };
}

export { FormConditionEditorContext, useFormConditionEditorContext };
export type { SetFunction as ConditionEditorSetDataFunction };