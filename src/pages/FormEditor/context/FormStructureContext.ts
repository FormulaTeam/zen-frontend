import { createContext, useContext } from "react";
import { EMPTY_FORM } from "./constants";

interface Section {
  title: string;
  description?: string;
  collapsed: boolean;
  order: number;
  expanded?: boolean;
  fieldIds: string[];
}

interface FormField {
  id: string;
  name: string; // Internal name
  displayName: string;
  required: boolean;
  // typeId: FormElementTypeId | typeof DRAGGED_ITEM_ID;
  // fieldType: FormFieldDataType;

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
  // sectionId: string; // ID of the section this field belongs to
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
export type { FormStructure, Section, FormField };