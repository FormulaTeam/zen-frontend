import { createContext, SetStateAction, useContext } from "react";
import { FormElementTypeId } from "../../../utils/interfaces";
import { getEmptyForm } from "./constants";

interface Section {
  title: string;
  description?: string;
  expanded: boolean;
  fieldIds: string[];
}

interface FormField {
  id: string;
  name: string; // Internal name
  typeId: FormElementTypeId;
  parentSectionId: string; // ID of the section this field belongs to
  required: boolean;
  displayName?: string;

  // options?: string[];
  // parentFieldId?: string;
  // parentFieldName?: string;
  // parentDependencies?: ParentDependencies[];
  // connectionType?: (typeof connectionTypes)[keyof typeof connectionTypes];
  // connectedFormId?: number;
  // connectedFieldId?: string;
  // childFieldId?: string;
  // childFieldName?: string;
  // validationRegex?: string;
  // initialValType?: string;
  // multiSelect?: boolean;
  // showSeconds?: boolean;
  // dateAndTime?: boolean;
  // numberType?: string;
  // coordinateType?: string;
  // maxValue?: number;
  // minValue?: number;
  // initialNumberValue?: number;
  // fieldName?: string;
  // fieldIcon?: string;
  // shouldSyncToMetro?: boolean;
  // defaultValue?: string | null;
  // sectionName?: string; // Name of the section this field belongs to
  // sectionDescription?: string; // Description of the section this field belongs to
  // sectionOrder: number; // Order of the section this field belongs to
  // conditions?: ConditionGroup[]; // Conditional display rules for this field
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
}

const FormStructureContext = createContext<FormStructureContext>({
  formStructure: { ...getEmptyForm() },
  setFormStructure: () => null,
  appendSection: () => null,
  deleteSection: () => null,
  renameSection: () => null,
  toggleSectionExpanded: () => null,
  appendFieldToFirstSection: () => null,
});

function useFormStructureContext() {
  return useContext(FormStructureContext);
}

export { FormStructureContext, useFormStructureContext };
export type { FormStructure, Section, FormField };