import { useState, useEffect, useRef } from "react";
import { connectionTypes } from "../utils/interfaces";
import { getResponses } from "../api";
import { v4 as uuidv4 } from "uuid";
import { FormFieldDto, ResponseDto } from "../types/shared";

type ConnectedFieldExtra = {
  connectionType?: string | number;
  linkedFormId?: number;
  connectedFieldId?: string;
};

type ConnectedFormField = FormFieldDto & {
  extra?: ConnectedFieldExtra;
};

type FieldOptionValue = {
  value?: unknown;
  fieldId: string;
};

interface UseConnectedFormOptionsProps {
  formFields: ConnectedFormField[];
}

interface UseConnectedFormOptionsReturn {
  fieldOptions: Record<string, FieldOptionValue[]>;
  isLoading: boolean;
  error: string | null;
}

const getFieldExtra = (field: ConnectedFormField): ConnectedFieldExtra =>
  (field.extra as ConnectedFieldExtra | undefined) ?? {};

/**
 * Custom hook to load options for form fields that are connected to other forms
 */
export const useConnectedFormOptions = ({
  formFields,
}: UseConnectedFormOptionsProps): UseConnectedFormOptionsReturn => {
  const [fieldOptions, setFieldOptions] = useState<Record<string, FieldOptionValue[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadedFieldsRef = useRef<Set<string>>(new Set());

  /**
   * Filters form fields to get only those connected to other forms
   */
  const getConnectedToFormFields = (fields: ConnectedFormField[]): ConnectedFormField[] => {
    return fields.filter((field) => {
      const extra = getFieldExtra(field);

      return (
        extra.connectionType === connectionTypes.form &&
        !!extra.linkedFormId &&
        !!extra.connectedFieldId &&
        !loadedFieldsRef.current.has(field.id)
      );
    });
  };

  /**
   * Extracts unique form IDs from connected fields
   */
  const getUniqueFormIds = (connectedFields: ConnectedFormField[]): number[] => {
    return [
      ...new Set<number>(
        connectedFields
          .map((field) => getFieldExtra(field).linkedFormId)
          .filter((id): id is number => id !== undefined),
      ),
    ];
  };

  /**
   * Formats response options for a field
   */
  const formatFieldOptions = (
    options: Array<{ value?: unknown; fieldId?: string }>,
  ): FieldOptionValue[] => {
    return options.map((option) => ({
      value: option?.value,
      fieldId: option?.fieldId || `generated-${uuidv4()}`,
    }));
  };

  /**
   * Removes duplicate options based on value
   */
  const removeDuplicateOptions = (
    newOptions: FieldOptionValue[],
    existingOptions: FieldOptionValue[],
  ): FieldOptionValue[] => {
    const existingValues = new Set(existingOptions.map((opt) => opt.value));
    return newOptions.filter((option) => !existingValues.has(option.value));
  };

  /**
   * Processes responses and updates field options
   */
  const processResponses = (
    responses: ResponseDto[][],
    connectedFields: ConnectedFormField[],
  ): Record<string, FieldOptionValue[]> => {
    const newFieldOptions: Record<string, FieldOptionValue[]> = {};

    responses.forEach((responseList) => {
      connectedFields.forEach((field) => {
        const extra = getFieldExtra(field);
        loadedFieldsRef.current.add(field.id);

        const options = responseList
          .map((response) =>
            response.fieldValues.find((value) => value.fieldId === extra.connectedFieldId),
          )
          .filter((value): value is NonNullable<typeof value> => Boolean(value));

        if (options.length > 0) {
          const formattedOptions = formatFieldOptions(options);
          const existingOptions = newFieldOptions[field.id] || [];
          const uniqueOptions = removeDuplicateOptions(formattedOptions, existingOptions);

          if (uniqueOptions.length > 0) {
            newFieldOptions[field.id] = [...existingOptions, ...uniqueOptions];
          }
        }
      });
    });

    return newFieldOptions;
  };

  /**
   * Loads options for connected form fields
   */
  const loadConnectedFormOptions = async (connectedFields: ConnectedFormField[]): Promise<void> => {
    const formIds = getUniqueFormIds(connectedFields);
    const promises = formIds.map((formId) => getResponses({ form_id: formId }));

    try {
      setIsLoading(true);
      setError(null);

      const responses = (await Promise.all(promises)) as ResponseDto[][];
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
