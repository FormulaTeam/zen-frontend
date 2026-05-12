import { useState, useEffect, useRef } from "react";
import { getFieldValues } from "../api";
import { FormFieldDto } from "../types/shared";
import { optionsSource } from "formula-gear";

type ConnectedFieldExtra = {
  source?: number;
  options?: {
    formId?: string | number;
    fieldId?: string;
  };
  multiple?: boolean;
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
  loadMoreOptions: (fieldId: string, search?: string) => Promise<void>;
}

const getFieldExtra = (field: ConnectedFormField): ConnectedFieldExtra =>
  (field.extra as ConnectedFieldExtra | undefined) ?? {};

const isConnectedToForm = (field: ConnectedFormField): boolean => {
  const extra = getFieldExtra(field);
  return (
    extra.source === optionsSource.FormFieldResponses &&
    !!extra.options?.formId &&
    !!extra.options?.fieldId
  );
};

const getLinkedFormId = (field: ConnectedFormField): number | undefined => {
  const extra = getFieldExtra(field);
  const formId = extra.options?.formId;
  return formId !== undefined ? Number(formId) : undefined;
};

const getLinkedFieldId = (field: ConnectedFormField): string | undefined => {
  return getFieldExtra(field).options?.fieldId;
};

export const useConnectedFormOptions = ({
  formFields,
}: UseConnectedFormOptionsProps): UseConnectedFormOptionsReturn => {
  const [fieldOptions, setFieldOptions] = useState<Record<string, FieldOptionValue[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offsetRef = useRef<Record<string, number>>({});
  const loadedFieldsRef = useRef<Set<string>>(new Set());

  const loadOptionsForField = async (
    field: ConnectedFormField,
    search?: string,
    offset = 0,
  ): Promise<void> => {
    const linkedFormId = getLinkedFormId(field);
    const linkedFieldId = getLinkedFieldId(field);

    if (!linkedFormId || !linkedFieldId) return;

    const LIMIT = 50;

    const result = await getFieldValues(linkedFormId, linkedFieldId, {
      limit: LIMIT,
      offset,
      search,
    });

    const formattedOptions: FieldOptionValue[] = result.data.map((item) => ({
      value: item.value,
      fieldId: item.responseId,
    }));

    setFieldOptions((prev) => ({
      ...prev,
      [field.id]: offset === 0
        ? formattedOptions
        : [...(prev[field.id] ?? []), ...formattedOptions],
    }));

    offsetRef.current[field.id] = offset + result.data.length;
  };

  const loadMoreOptions = async (fieldId: string, search?: string): Promise<void> => {
    const field = formFields.find((f) => f.id === fieldId);
    if (!field || !isConnectedToForm(field)) return;

    const currentOffset = search !== undefined ? 0 : (offsetRef.current[fieldId] ?? 0);

    try {
      setIsLoading(true);
      setError(null);
      await loadOptionsForField(field, search, currentOffset);
    } catch (err) {
      const errorMessage = `Error loading options for field ${fieldId}: ${err}`;
      console.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!formFields || formFields.length === 0) return;

    const connectedFields = formFields.filter(
      (field) => isConnectedToForm(field) && !loadedFieldsRef.current.has(field.id),
    );

    if (connectedFields.length === 0) return;

    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError(null);

        await Promise.all(
          connectedFields.map((field) => {
            loadedFieldsRef.current.add(field.id);
            return loadOptionsForField(field, undefined, 0);
          }),
        );
      } catch (err) {
        const errorMessage = `Error loading connected form options: ${err}`;
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAll();
  }, [formFields]);

  return {
    fieldOptions,
    isLoading,
    error,
    loadMoreOptions,
  };
};