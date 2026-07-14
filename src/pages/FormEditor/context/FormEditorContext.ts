import { createContext, useContext } from "react";

export const FORM_EDITOR_MODE = {
  CREATE: "create",
  EDIT: "edit",
} as const;

export type FormEditorMode = typeof FORM_EDITOR_MODE[keyof typeof FORM_EDITOR_MODE];

interface FormEditorContext {
  mode: FormEditorMode;
  originalFieldIds?: Set<string>;
  formDraftKey?: number | string;
  draftEnabled?: boolean;
  duplicateSourceFormId?: number;
  originalSectionIds?: Set<string>;
}

const FormEditorContext = createContext<FormEditorContext>({
  mode: FORM_EDITOR_MODE.CREATE,
  draftEnabled: true,
});

function useFormEditorContext() {
  return useContext(FormEditorContext);
}

export { FormEditorContext, useFormEditorContext };
