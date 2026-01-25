import { useEffect, useState } from "react";
import { ResponseForm } from "../utils/interfaces";
import { saveResponse } from "../interfaces/responses";

// Global queue to manage sequential saving across all child forms
let saveQueue: Array<{
  index: number;
  saveFunction: () => Promise<void>;
}> = [];
let isProcessingQueue = false;

const saveFunction = async (
  index: number,
  saveResponse: saveResponse,
  formFieldsByIdMap: any,
  formFieldsValuesMap: any,
  setSaved: (v: boolean) => void,
  setError: (v: boolean) => void,
) => {
  try {
    console.log(`[CHILD FORM SAVE] Starting save for child form index ${index}`);
    await saveResponse(formFieldsByIdMap, formFieldsValuesMap);
    console.log(`[CHILD FORM SAVE] Successfully saved child form index ${index}`);
    setSaved(true);
  } catch (error) {
    console.error(`[CHILD FORM SAVE] Error saving child form index ${index}:`, error);
    setError(true);
    setSaved(false);
    throw error;
  }
};

const processSaveQueue = async () => {
  if (isProcessingQueue || saveQueue.length === 0) return;

  isProcessingQueue = true;

  saveQueue.sort((a, b) => a.index - b.index);

  while (saveQueue.length > 0) {
    const item = saveQueue.shift()!;
    console.log(`[CHILD FORM SAVE] Processing queue item for index ${item.index}`);

    try {
      await item.saveFunction();
    } catch (error) {
      console.error(`[CHILD FORM SAVE] Error in queue processing for index ${item.index}:`, error);
    }
  }

  isProcessingQueue = false;
};

export const saveChildForm = async (
  index: number,
  saveResponse: saveResponse,
  formFieldsByIdMap: any,
  formFieldsValuesMap: any,
  setSaved: (v: boolean) => void,
  setError: (v: boolean) => void,
) => {
  saveQueue.push({
    index,
    saveFunction: () =>
      saveFunction(index, saveResponse, formFieldsByIdMap, formFieldsValuesMap, setSaved, setError),
  });

  await processSaveQueue();
};

const clearSaveQueue = () => {
  saveQueue = [];
  isProcessingQueue = false;
};

interface useFormInFormResponseSaveProps {
  shouldSave: boolean;
  shouldValidate: boolean;
  validateVisibleFields: () => Promise<boolean>;
  form: any;
  saveResponse: saveResponse;
  formFieldsByIdMap: any;
  formFieldsValuesMap: any;
  childSaved: (saved: boolean) => void;
  childValid: (valid: boolean) => void;
  index?: number; // Index for ordering child form saves
}

export function useFormInFormResponseSave({
  shouldSave,
  shouldValidate,
  validateVisibleFields,
  form,
  saveResponse,
  formFieldsByIdMap,
  formFieldsValuesMap,
  childSaved,
  childValid,
  index = 0,
}: useFormInFormResponseSaveProps) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(false);
  const [valid, setValid] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (shouldSave && form) {
        const isValid = await validateVisibleFields();

        if (isValid) {
          saveChildForm(
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
        } else {
          setError(false);
          childSaved(false);
        }
      } else {
        setError(false);
      }
    };

    run();
  }, [shouldSave]);

  useEffect(() => {
    const run = async () => {
      if (form && shouldValidate) {
        const isValid = await validateVisibleFields();

        if (isValid) {
          childValid(true);
          setValid(true);
        } else {
          childValid(false);
          setValid(false);
        }
      }
    };

    run();
  }, [shouldValidate]);

  return { saved, error, valid, setSaved, setError };
}

// Export the clearSaveQueue function for cleanup if needed
export { clearSaveQueue };
