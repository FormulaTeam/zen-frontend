// hooks/useAvailableOptions.ts
import { useMemo } from "react";
import { FormField } from "../utils/interfaces";

export const useAvailableOptions = ({
  formField,
  formFieldsValuesMap,
  fieldOptions,
  formFields,
}: {
  formField: FormField;
  formFieldsValuesMap: Map<string, any>;
  fieldOptions: Record<string, any[]>;
  formFields: FormField[];
}) => {
  return useMemo(() => {
    let availableOptions: any[] = [];

    // Apply logic from your original case
    // e.g., is connected to form, parent dependencies, remove duplicates, etc.
    // Then return the array

    // Simplified for brevity
    const extra = (formField as any).extra ?? {};
    const items = (extra.options?.items as any[]) ?? (formField as any).options ?? [];

    if (formField.connectionType === "form") {
      availableOptions = fieldOptions[formField.uniqueId]?.map((x) => x.value) || [];
    } else {
      availableOptions = items.map((item: any) => typeof item === "object" ? item.id : item) || [];
    }

    return availableOptions;
  }, [formField, formFieldsValuesMap, fieldOptions, formFields]);
};
