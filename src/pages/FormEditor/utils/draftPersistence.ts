import { FormStructure } from "../context/FormStructureContext";

const DRAFT_PREFIX = "form-draft-";

export interface FormDraft {
  data: FormStructure;
  timestamp: number;
}

export const getDraftKey = (formId: number | string | undefined) => {
  return `${DRAFT_PREFIX}${formId || "new"}`;
};

export const saveFormDraft = (formId: number | string | undefined, data: FormStructure) => {
  const draft: FormDraft = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(getDraftKey(formId), JSON.stringify(draft));
};

export const getFormDraft = (formId: number | string | undefined): FormDraft | null => {
  const draftStr = localStorage.getItem(getDraftKey(formId));
  if (!draftStr) return null;

  try {
    return JSON.parse(draftStr) as FormDraft;
  } catch (e) {
    console.error("Failed to parse form draft", e);
    return null;
  }
};

export const clearFormDraft = (formId: number | string | undefined) => {
  localStorage.removeItem(getDraftKey(formId));
};
