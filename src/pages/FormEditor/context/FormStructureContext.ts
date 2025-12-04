import { createContext, SetStateAction, useContext } from "react";
import { FormFieldTypeId } from "../../../utils/interfaces";
import { getEmptyForm } from "./constants";
import { FormFieldData } from "../schemas/fields";
import { $ZodErrorTree } from "zod/v4/core";
import { FormMetadata } from "../schemas/metadata";
import { typeToFlattenedError } from "zod/v3";

interface Section {
  title: string;
  description?: string;
  expanded: boolean;
  fieldIds: string[];
}

interface FormField {
  id: string;
  parentSectionId: string;

  data: FormFieldData;
  validationErrors?: $ZodErrorTree<FormFieldData>["properties"] | null;
}

interface FormStructure {
  metadata: FormMetadata & { validationErrors?: typeToFlattenedError<FormMetadata>['fieldErrors'] | null };
  sections: Record<string, Section>;
  orderedSectionIds: string[];
  fields: Record<string, FormField>;
}

interface FormStructureContext {
  formStructure: FormStructure;
  setFormStructure: (value: SetStateAction<FormStructure>) => void; //TODO break down into specific functions
  appendSection: () => void;
  deleteSection: (sectionId: string) => void;
  renameSection: (sectionId: string, title: string) => void;
  toggleSectionExpanded: (sectionId: string) => void;
  appendFieldToFirstSection: (elementTypeId: FormFieldTypeId) => void;
  deleteField: (fieldId: string) => void;
  setFieldData: (fieldId: string, data: Partial<FormFieldData>) => void;
  validateForm: () => void;
  setFormMetadata: (metadata: Partial<FormMetadata>) => boolean;
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
  setFieldData: () => null,
  validateForm: () => null,
  setFormMetadata: () => false,
});

function useFormStructureContext() {
  const { ...restContext } = useContext(FormStructureContext);

  return {
    ...restContext,
  };
}

export { FormStructureContext, useFormStructureContext };
export type { FormStructure, Section, FormField, FormMetadata };