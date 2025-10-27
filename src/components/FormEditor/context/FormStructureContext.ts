import { FormField, Section } from "../../../utils/interfaces";
import { createContext, useContext } from "react";
import { EMPTY_FORM } from "./constants";

interface FormStructure {
  title: string | null;
  sections: Section[];
  fields: FormField[];

  description?: string;
}

interface FormStructureContext {
  formStructure: FormStructure;
  appendSection: () => void;
}

const FormStructureContext = createContext<FormStructureContext>({
                                                                   formStructure: { ...EMPTY_FORM },
                                                                   appendSection: () => null,
                                                                 });

function useFormStructureContext() {
  return useContext(FormStructureContext);
}

export { FormStructureContext, useFormStructureContext };
export type { FormStructure };