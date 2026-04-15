import { useEffect, useRef, useState } from "react";
import type { ResponseDto } from "../types/shared";

type SaveResponseFn = (
  formFieldsByIdMap: Map<string, any>,
  formFieldsValuesMap: Map<string, any>,
) => Promise<ResponseDto>;

let saveQueue: Array<{
  index: number;
  saveFunction: () => Promise<void>;
}> = [];

let isProcessingQueue = false;

const runQueuedSave = async (
  index: number,
  saveResponse: SaveResponseFn,
  formFieldsByIdMap: Map<string, any>,
  formFieldsValuesMap: Map<string, any>,
  setSaved: (value: boolean) => void,
  setError: (value: boolean) => void,
) => {
  try {
    await saveResponse(formFieldsByIdMap, formFieldsValuesMap);
    setSaved(true);
    setError(false);
  } catch (error) {
    setSaved(false);
    setError(true);
    throw error;
  }
};

const processSaveQueue = async () => {
  if (isProcessingQueue || saveQueue.length === 0) {
    return;
  }

  isProcessingQueue = true;
  saveQueue.sort((a, b) => a.index - b.index);

  while (saveQueue.length > 0) {
    const item = saveQueue.shift()!;

    try {
      await item.saveFunction();
    } catch {
      // failure is already handled by the queued save function
    }
  }

  isProcessingQueue = false;
};

export const saveChildForm = async (
  index: number,
  saveResponse: SaveResponseFn,
  formFieldsByIdMap: Map<string, any>,
  formFieldsValuesMap: Map<string, any>,
  setSaved: (value: boolean) => void,
  setError: (value: boolean) => void,
) => {
  saveQueue.push({
    index,
    saveFunction: () =>
      runQueuedSave(
        index,
        saveResponse,
        formFieldsByIdMap,
        formFieldsValuesMap,
        setSaved,
        setError,
      ),
  });

  await processSaveQueue();
};

export const clearSaveQueue = () => {
  saveQueue = [];
  isProcessingQueue = false;
};

interface UseFormInFormResponseSaveProps {
  shouldSave: boolean;
  shouldValidate: boolean;
  validateRequiredFields: () => boolean;
  form: any;
  saveResponse: SaveResponseFn;
  formFieldsByIdMap: Map<string, any>;
  formFieldsValuesMap: Map<string, any>;
  childSaved: (saved: boolean) => void;
  childValid: (valid: boolean) => void;
  index?: number;
}

export function useFormInFormResponseSave({
  shouldSave,
  shouldValidate,
  validateRequiredFields,
  form,
  saveResponse,
  formFieldsByIdMap,
  formFieldsValuesMap,
  childSaved,
  childValid,
  index = 0,
}: UseFormInFormResponseSaveProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [valid, setValid] = useState(true);

  const hasTriggeredSaveRef = useRef(false);

  useEffect(() => {
    if (!shouldSave) {
      hasTriggeredSaveRef.current = false;
      setSaved(false);
      setError(false);
      return;
    }

    if (hasTriggeredSaveRef.current || !form) {
      return;
    }

    if (!validateRequiredFields()) {
      setValid(false);
      setError(true);
      childSaved(false);
      return;
    }

    hasTriggeredSaveRef.current = true;

    void saveChildForm(
      index,
      saveResponse,
      formFieldsByIdMap,
      formFieldsValuesMap,
      setSaved,
      setError,
    )
      .then(() => {
        childSaved(true);
      })
      .catch(() => {
        childSaved(false);
      });
  }, [
    shouldSave,
    form,
    saveResponse,
    formFieldsByIdMap,
    formFieldsValuesMap,
    validateRequiredFields,
    childSaved,
    index,
  ]);

  useEffect(() => {
    if (!shouldValidate || !form) {
      return;
    }

    const isValid = validateRequiredFields();
    setValid(isValid);
    childValid(isValid);
  }, [shouldValidate, form, validateRequiredFields, childValid]);

  return { saved, error, valid };
}
