import { createContext, SetStateAction, useContext } from "react";
import { FormFieldTypeId } from "../../../utils/interfaces";
import { getEmptyForm } from "./utils";
import { FormFieldData } from "../schemas/fields";
import { $ZodErrorTree } from "zod/v4/core";
import { FormMetadata } from "../schemas/metadata";
import { typeToFlattenedError } from "zod/v3";
import { FormCondition, FormConditions } from "../schemas/conditions";
import { validateCondition } from "../hooks/useFormStructure";

interface Section {
  title: string;
  expanded: boolean;
  fieldIds: string[];
  validationErrors?: string[] | null;
}

interface FormField {
  id: string;
  parentSectionId: string;

  data: FormFieldData;
  validationErrors?: $ZodErrorTree<FormFieldData>["properties"] | null;
}

interface FormStructure {
  metadata: FormMetadata & {
    validationErrors?: typeToFlattenedError<FormMetadata>["fieldErrors"] | null;
  };
  sections: Record<string, Section>;
  orderedSectionIds: string[];
  fields: Record<string, FormField>;
  conditions: FormConditions;
}

export interface FormValidationResult {
  isValid: boolean;
  fieldsValid: boolean;
  fieldErrorsCount: number;
  metadataErrors: typeToFlattenedError<FormMetadata>["fieldErrors"];
  hasFields: boolean;
}

interface FormStructureContext {
  formStructure: FormStructure;
  setFormStructure: (value: SetStateAction<FormStructure>) => void;
  appendSection: () => void;
  deleteSection: (sectionId: string) => void;
  renameSection: (sectionId: string, title: string) => void;
  toggleSectionExpanded: (sectionId: string) => void;
  appendFieldToLastSection: (elementTypeId: FormFieldTypeId) => void;
  deleteField: (fieldId: string) => void;
  setFieldData: (fieldId: string, data: Partial<FormFieldData>) => void;
  appendCondition: (condition: FormCondition) => ReturnType<typeof validateCondition>;
  deleteConditionAt: (index: number) => void;
  setConditionDataAt: (index: number, condition: FormCondition) => void;
  checkHasChanges: () => boolean;
  validateForm: () => FormValidationResult;
  setFormMetadata: (metadata: Partial<FormMetadata>) => boolean;
}

const FormStructureContext = createContext<FormStructureContext>({
  formStructure: { ...getEmptyForm() },
  setFormStructure: () => null,
  appendSection: () => null,
  deleteSection: () => null,
  renameSection: () => null,
  toggleSectionExpanded: () => null,
  appendFieldToLastSection: () => null,
  deleteField: () => null,
  setFieldData: () => null,
  appendCondition: () => null,
  deleteConditionAt: () => null,
  setConditionDataAt: () => null,
  checkHasChanges: () => false,
  validateForm: () => ({
    isValid: false,
    fieldsValid: false,
    fieldErrorsCount: 0,
    metadataErrors: {},
    hasFields: false,
  }),
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
