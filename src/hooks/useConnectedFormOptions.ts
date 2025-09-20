import { useState, useEffect, useRef } from "react";
import { FormField, connectionTypes, ResponseFieldValue } from "../utils/interfaces";
import { getResponses } from "../api";
import { v4 as uuidv4 } from "uuid";

interface UseConnectedFormOptionsProps {
  formFields: FormField[];
}

interface UseConnectedFormOptionsReturn {
  fieldOptions: Record<string, ResponseFieldValue[]>;
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook to load options for form fields that are connected to other forms
 */
export const useConnectedFormOptions = ({
  formFields,
}: UseConnectedFormOptionsProps): UseConnectedFormOptionsReturn => {
  const [fieldOptions, setFieldOptions] = useState<Record<string, ResponseFieldValue[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedFieldsRef = useRef<Set<string>>(new Set());

  /**
   * Filters form fields to get only those connected to other forms
   */
  const getConnectedToFormFields = (fields: FormField[]): FormField[] => {
    return fields.filter(
      (field) =>
        field.connectionType === connectionTypes.form &&
        field.connectedFormId &&
        field.connectedFieldId &&
        !loadedFieldsRef.current.has(field.uniqueId),
    );
  };

  /**
   * Extracts unique form IDs from connected fields
   */
  const getUniqueFormIds = (connectedFields: FormField[]): number[] => {
    return [
      ...new Set<number>(
        connectedFields
          .map((field) => field.connectedFormId)
          .filter((id): id is number => id !== undefined),
      ),
    ];
  };

  /**
   * Formats response options for a field
   */
  const formatFieldOptions = (options: any[]): ResponseFieldValue[] => {
    return options.map((option) => ({
      value: option?.value,
      uniqueId: option?.uniqueId || `generated-${uuidv4()}`,
    }));
  };

  /**
   * Removes duplicate options based on value
   */
  const removeDuplicateOptions = (
    newOptions: ResponseFieldValue[],
    existingOptions: ResponseFieldValue[],
  ): ResponseFieldValue[] => {
    const existingValues = new Set(existingOptions.map((opt) => opt.value));
    return newOptions.filter((option) => !existingValues.has(option.value));
  };

  /**
   * Processes responses and updates field options
   */
  const processResponses = (
    responses: any[],
    connectedFields: FormField[],
  ): Record<string, ResponseFieldValue[]> => {
    const newFieldOptions: Record<string, ResponseFieldValue[]> = {};

    responses.forEach((response) => {
      connectedFields.forEach((field) => {
        loadedFieldsRef.current.add(field.uniqueId);

        const options = response
          .map((res: any) => res.data?.find((res: any) => res.uniqueId === field.connectedFieldId))
          .filter(Boolean);

        if (options && options.length > 0) {
          const formattedOptions = formatFieldOptions(options);
          const existingOptions = newFieldOptions[field.uniqueId] || [];
          const uniqueOptions = removeDuplicateOptions(formattedOptions, existingOptions);

          if (uniqueOptions.length > 0) {
            newFieldOptions[field.uniqueId] = [...existingOptions, ...uniqueOptions];
          }
        }
      });
    });

    return newFieldOptions;
  };

  /**
   * Loads options for connected form fields
   */
  const loadConnectedFormOptions = async (connectedFields: FormField[]): Promise<void> => {
    const formIds = getUniqueFormIds(connectedFields);
    const promises = formIds.map((formId) => getResponses({ form_id: formId }));

    try {
      setIsLoading(true);
      setError(null);

      const responses = await Promise.all(promises);
      const newFieldOptions = processResponses(responses, connectedFields);

      if (Object.keys(newFieldOptions).length > 0) {
        setFieldOptions((prev) => ({
          ...prev,
          ...newFieldOptions,
        }));
      }
    } catch (err) {
      const errorMessage = `Error loading options for connected fields: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!formFields) return;

    const connectedToFormFields = getConnectedToFormFields(formFields);
    if (connectedToFormFields.length === 0) return;

    loadConnectedFormOptions(connectedToFormFields);
  }, [formFields]);

  return {
    fieldOptions,
    isLoading,
    error,
  };
};
