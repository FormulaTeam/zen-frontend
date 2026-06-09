import { useEffect, useState } from "react";
import { normalizeFieldValue } from "../utils/formFieldsResponses";
import { texts } from "../utils/texts";
import { FieldTypeIds } from "../utils/interfaces";
import { selectionMode } from "formula-gear";

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
    if (field.typeId !== FieldTypeIds.options) return;

    const extra = field.extra ?? {};
    const isMultiSelect = extra.selectionMode === selectionMode.Multiple;
    let options = extra.options || [];

    const parentFieldId = extra.parentFieldId;
    const parentDependencies = extra.parentDependencies;
    const connectedToForm = extra.connectionType === "form";

    if (connectedToForm && fieldOptions[uniqueId]) {
      options = fieldOptions[uniqueId].map((f) => f.value);
    }

    if (parentFieldId && parentDependencies) {
      const parentValue = formFieldsValuesMap.get(parentFieldId);
      const parentField = formFields.find((f) => String(f.id) === String(parentFieldId) || f.uniqueId === parentFieldId);
      const allowedOptions = new Set();

      if (parentField) {
        const parentExtra = parentField.extra ?? {};
        const parentOptions = parentExtra.options || [];
        const parentValues = Array.isArray(parentValue) ? parentValue : [parentValue];

        parentValues.forEach((val) => {
          const parentIndex = parentOptions.indexOf(val);
          const dep = parentDependencies.find((d: any) => d.parentOptionIndex === parentIndex);

          if (dep) {
            dep.childOptionIndices.forEach((childIndex: number) => {
              if (options[childIndex]) {
                allowedOptions.add(options[childIndex]);
              }
            });
          }
        });

        options = options.filter((opt: any) => allowedOptions.has(opt));

        // Clean invalid selection
        if (value) {
          if (isMultiSelect) {
            const currentValues = Array.isArray(value) ? value : [value];
            const validValues = currentValues.filter(v => allowedOptions.has(v));
            if (validValues.length !== currentValues.length) {
              setValue(validValues);
              setTimeout(() => {
                onChangeHandler(validValues, uniqueId, !field.required);
              }, 0);
            }
          } else if (!allowedOptions.has(value)) {
            const newVal = "";
            setValue(newVal);
            setTimeout(() => {
              onChangeHandler(newVal, uniqueId, !field.required);
            }, 0);
          }
        }
      }
    }

    if (!field.required && !isMultiSelect) {
      if (!options.includes(texts.heb.emptyValue)) {
        options = [texts.heb.emptyValue, ...options];
      }
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
