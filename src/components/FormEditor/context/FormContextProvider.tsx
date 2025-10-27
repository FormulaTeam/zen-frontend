import { ReactNode } from "react";
import { FormEditorContext } from "./FormEditorContext";
import { FormStructure, FormStructureContext } from "./FormStructureContext";
import { FormSandboxContext } from "./FormSandboxContext";

interface Props {
  editorContext: FormEditorContext;
  structureContext: FormStructure;
  sandboxContext: FormSandboxContext;

  children?: ReactNode;
}

function FormContextProvider({ editorContext, structureContext, sandboxContext, children }: Props) {
  return (
    <FormEditorContext.Provider value={editorContext}>
      <FormStructureContext.Provider value={structureContext}>
        <FormSandboxContext.Provider value={sandboxContext}>
          {children}
        </FormSandboxContext.Provider>
      </FormStructureContext.Provider>
    </FormEditorContext.Provider>
  );
}

export { FormContextProvider };