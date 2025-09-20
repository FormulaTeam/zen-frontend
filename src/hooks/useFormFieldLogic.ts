import { useEffect, useState } from "react";
import { normalizeFieldValue } from "../utils/formFieldsResponses";
import { texts } from "../utils/texts";

interface UseFormFieldLogicProps {
  formField: any;
  formFieldsValuesMap: Map<string, any>;
  formFieldsValidMap: Map<string, any>;
  formFields: any[];
  fieldOptions: Record<string, any[]>;
  onChangeHandler: (value: any, uniqueId: string, valid: any) => void;
}

/**
 * Custom hook to manage the logic for a form field, including value and validity state,
 * as well as available options based on dependencies.
 *
 * @param {UseFormFieldLogicProps} props - The properties for the form field logic.
 * @returns {Object} - An object containing the uniqueId, value, valid state, and available options.
 */
export const useFormFieldLogic = ({
  formField,
  formFieldsValuesMap,
  formFieldsValidMap,
  formFields,
  fieldOptions,
  onChangeHandler,
}: UseFormFieldLogicProps) => {
  const uniqueId = formField?.uniqueId || formField?.uniqId;
  const field = formField;
  const [value, setValue] = useState<any>(formFieldsValuesMap.get(uniqueId));
  const [availableOptions, setAvailableOptions] = useState<any[]>([]);

  useEffect(() => {
    const newValue = normalizeFieldValue(field, formFieldsValuesMap.get(uniqueId));
    setValue(newValue);
  }, [formFieldsValuesMap, uniqueId, field]);

  useEffect(() => {
    if (field.typeId !== "options") return;

    let options = field.options || [];

    const parentFieldId = field.parentFieldId;
    const parentDependencies = field.parentDependencies;
    const connectedToForm = field.connectionType === "form";

    if (connectedToForm && fieldOptions[uniqueId]) {
      options = fieldOptions[uniqueId].map((f) => f.value);
    }

    if (parentFieldId && parentDependencies) {
      const parentValue = formFieldsValuesMap.get(parentFieldId);
      const parentField = formFields.find((f) => f.uniqueId === parentFieldId);
      const allowedOptions = new Set();

      if (parentField) {
        const parentValues = Array.isArray(parentValue) ? parentValue : [parentValue];

        parentValues.forEach((val) => {
          const parentIndex = parentField.options.indexOf(val);
          const dep = parentDependencies.find((d) => d.parentOptionIndex === parentIndex);

          if (dep) {
            dep.childOptionIndices.forEach((childIndex: number) => {
              if (field.options[childIndex]) {
                allowedOptions.add(field.options[childIndex]);
              }
            });
          }
        });

        options = field.options.filter((opt: any) => allowedOptions.has(opt));

        // Clean invalid selection
        if (value && !allowedOptions.has(value)) {
          const newVal = field.multiSelect ? [] : "";
          setValue(newVal);
          setTimeout(() => {
            onChangeHandler(newVal, uniqueId, !field.required);
          }, 0);
        }
      }
    }

    if (!field.required && !field.multiSelect) {
      options = [texts.heb.emptyValue, ...options];
      if (value === texts.heb.emptyValue) setValue("");
    }

    setAvailableOptions(options);
  }, [field, formFields, formFieldsValuesMap, fieldOptions, onChangeHandler, value, uniqueId]);

  return {
    uniqueId,
    value,
    valid: formFieldsValidMap.get(uniqueId),
    availableOptions,
  };
};
