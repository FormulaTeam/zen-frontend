import { FormField, Section } from "../../../utils/interfaces";
import { createContext, Dispatch, SetStateAction, useCallback, useContext, useEffect } from "react";
import { EMPTY_FORM } from "./constants";
import { texts } from "../../../utils/texts";

interface FormStructure {
  title: string | null;
  sections: Section[];
  fields: FormField[];

  description?: string;
}

interface FormStructureContext {
  formStructure: FormStructure;
  setFormStructure: Dispatch<SetStateAction<FormStructure>>;
}

const FormStructureContext = createContext<FormStructureContext>({
  formStructure: { ...EMPTY_FORM },
  setFormStructure: () => null,
});

function useFormStructureContext() {
  const { formStructure, setFormStructure } = useContext(FormStructureContext);

  useEffect(() => {
    console.log(formStructure.sections);
  }, [formStructure]);

  const appendSection = useCallback(() => {

    setFormStructure((prev) => {
      const previousLastInOrder = Math.max(...prev.sections.map((s) => s.order), -1);

      return {
        ...prev,
        sections: [
          ...prev.sections,
          {
            id: `section_${Date.now()}`,
            name: texts.heb.undefinedSection,
            order: previousLastInOrder + 1,
            collapsed: false,
          },
        ],
      };
    });
  }, []);

  return {
    formStructure,
    appendSection,
  };
}

export { FormStructureContext, useFormStructureContext };
export type { FormStructure };