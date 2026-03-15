import { useState } from "react";
import { getFormFields } from "../../api/customFormFieldsApi";
import { CustomFormField, FORM_ELEMENTS } from "../../utils/interfaces";
import { FORM_ELEMENT_ICONS } from "../../components/FORM_ELEMENT_ICONS";

export interface CustomFieldMeta {
  id: string;
  typeId: number;
  displayName?: string;
  icon?: string;
  name: string;
}

/**
 * Loads custom form-fields once, merges with defaults, and exposes them.
 */
export default function useCustomFormFields() {
  const [customFields, setCustomFields] = useState<Partial<CustomFormField>[]>([]);
  const [fetchedCustomFormFields, setFetchedCustomFormFields] = useState<boolean>(false);

  const initCustomFields = async () => {
    if (fetchedCustomFormFields) {
      return;
    }
    try {
      const customFormFields = await getFormFields();
      const customFormFieldsMetaData = customFormFields.map((formField) => {
        // Find matching default field by typeId

        const defaultField = FORM_ELEMENTS[formField.typeId];
        return {
          ...formField,
          // Use custom displayName if exists, otherwise use default field's name
          name: formField.displayName || defaultField?.name || "",
          // Use custom icon if it exists AND is valid, otherwise use default field's icon
          icon:
            formField.icon && FORM_ELEMENT_ICONS[formField.icon]
              ? formField.icon
              : defaultField?.icon || "menu",
        };
      });
      setCustomFields((prevItems) => [...customFormFieldsMetaData, ...prevItems]);
      setFetchedCustomFormFields(true);
    } catch (error) {
      console.error("failed to fetch custom inputs");
    }
  };

  return { customFields, initCustomFields, fetchedCustomFormFields, setFetchedCustomFormFields };
}
