import { createContext, useContext } from "react";

type FormEditorMode = "create" | "edit";

interface FormEditorContext {
  mode: FormEditorMode;
}

const FormEditorContext = createContext<FormEditorContext>({ mode: "create" });

function useFormEditorContext() {
  return useContext(FormEditorContext);
}

export { FormEditorContext, useFormEditorContext };
export type { FormEditorMode };