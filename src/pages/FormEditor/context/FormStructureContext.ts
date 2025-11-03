import { createContext, SetStateAction, useContext } from "react";
import { EMPTY_FORM } from "./constants";
import { FormElementTypeId } from "../../../utils/interfaces";

interface Section {
  title: string;
  description?: string;
  collapsed: boolean;
  index: number;
  expanded?: boolean;
  fieldIds: string[];
}

type PlaceholderElementTypeId = -1

interface FormField {
  id: string;
  name: string; // Internal name
  typeId: FormElementTypeId | PlaceholderElementTypeId;
  parentSectionId: string; // ID of the section this field belongs to
  required: boolean;
  // fieldType: FormFieldDataType;
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
  fields: Record<string, FormField>;

  description?: string;
}

interface FormStructureContext {
  formStructure: FormStructure;
  setFormStructure: (value: SetStateAction<FormStructure>) => void; //TODO break down into specific functions
  appendSection: () => void;
  deleteSection: (sectionId: string) => void;
  renameSection: (sectionId: string, title: string) => void;
}

const FormStructureContext = createContext<FormStructureContext>({
                                                                   formStructure: { ...EMPTY_FORM },
                                                                   setFormStructure: () => null,
                                                                   appendSection: () => null,
                                                                   deleteSection: () => null,
                                                                   renameSection: () => null,
                                                                 });

function useFormStructureContext() {
  return useContext(FormStructureContext);
}

export { FormStructureContext, useFormStructureContext };
export type { FormStructure, Section, FormField };