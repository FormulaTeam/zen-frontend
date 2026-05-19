import { FormStructure } from "../context/FormStructureContext";

const DRAFT_PREFIX = "form-draft-";
const RESPONSE_DRAFT_PREFIX = "response-draft-";

export interface FormDraft {
  data: FormStructure;
  timestamp: number;
}

export interface ResponseDraft {
  values: [string, any][]; // Map serialized as entries
  timestamp: number;
}

export const getDraftKey = (formId: number | string | undefined) => {
  return `${DRAFT_PREFIX}${formId || "new"}`;
};

export const getResponseDraftKey = (formId: number | string | undefined, responseId: number | string | undefined) => {
  return `${RESPONSE_DRAFT_PREFIX}${formId || "unknown"}-${responseId || "new"}`;
};

export const saveFormDraft = (formId: number | string | undefined, data: FormStructure) => {
  const draft: FormDraft = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(getDraftKey(formId), JSON.stringify(draft));
};

export const saveResponseDraft = (formId: number | string | undefined, responseId: number | string | undefined, valuesMap: Map<string, any>) => {
  const draft: ResponseDraft = {
    values: Array.from(valuesMap.entries()),
    timestamp: Date.now(),
  };
  localStorage.setItem(getResponseDraftKey(formId, responseId), JSON.stringify(draft));
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

export const getResponseDraft = (formId: number | string | undefined, responseId: number | string | undefined): ResponseDraft | null => {
  const draftStr = localStorage.getItem(getResponseDraftKey(formId, responseId));
  if (!draftStr) return null;

  try {
    return JSON.parse(draftStr) as ResponseDraft;
  } catch (e) {
    console.error("Failed to parse response draft", e);
    return null;
  }
};

export const clearFormDraft = (formId: number | string | undefined) => {
  localStorage.removeItem(getDraftKey(formId));
};

export const clearResponseDraft = (formId: number | string | undefined, responseId: number | string | undefined) => {
  localStorage.removeItem(getResponseDraftKey(formId, responseId));
};
