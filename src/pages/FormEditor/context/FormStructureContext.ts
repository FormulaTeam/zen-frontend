import { createContext, SetStateAction, useContext } from "react";
import { FormElementTypeId } from "../../../utils/interfaces";
import { getEmptyForm } from "./constants";
import { FormFieldData } from "../schemas";

interface Section {
  title: string;
  description?: string;
  expanded: boolean;
  fieldIds: string[];
}

interface FormField {
  id: string;
  parentSectionId: string; // ID of the section this field belongs to

  data: FormFieldData;
}

interface FormStructure {
  title: string | null;
  sections: Record<string, Section>;
  orderedSectionIds: string[];
  fields: Record<string, FormField>;

  description?: string;
}

interface FormStructureContext {
  formStructure: FormStructure;
  setFormStructure: (value: SetStateAction<FormStructure>) => void; //TODO break down into specific functions
  appendSection: () => void;
  deleteSection: (sectionId: string) => void;
  renameSection: (sectionId: string, title: string) => void;
  toggleSectionExpanded: (sectionId: string) => void;
  appendFieldToFirstSection: (elementTypeId: FormElementTypeId) => void;
  deleteField: (field: string) => void;
}

const FormStructureContext = createContext<FormStructureContext>({
  formStructure: { ...getEmptyForm() },
  setFormStructure: () => null,
  appendSection: () => null,
  deleteSection: () => null,
  renameSection: () => null,
  toggleSectionExpanded: () => null,
  appendFieldToFirstSection: () => null,
  deleteField: () => null,
});

function useFormStructureContext() {
  return useContext(FormStructureContext);
}

export { FormStructureContext, useFormStructureContext };
export type { FormStructure, Section, FormField };