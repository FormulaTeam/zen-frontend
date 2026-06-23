import { useState, useEffect, useRef, useCallback } from "react";
import { getFieldValues, OPTIONS_PAGINATION_LIMIT } from "../api/responsesApi";
import { useFindOwnerFormId } from "./useFindOwnerFormId";
import { FormFieldDto } from "../types/shared";

type ConnectedFieldExtra = {
  linkedOptionsFieldId?: string | null;
  selectionMode?: "multiple" | "single";
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

const getLinkedOptionsFieldId = (field: ConnectedFormField): string | undefined => {
  const linkedOptionsFieldId = getFieldExtra(field).linkedOptionsFieldId;

  return typeof linkedOptionsFieldId === "string" && linkedOptionsFieldId.trim() !== ""
    ? linkedOptionsFieldId
    : undefined;
};

const isConnectedToForm = (field: ConnectedFormField, formFields?: ConnectedFormField[]): boolean => {
  const linkedOptionsFieldId = getLinkedOptionsFieldId(field);
  if (!linkedOptionsFieldId) return false;

  if (formFields && formFields.some((f) => String(f.id) === String(linkedOptionsFieldId))) {
    return false;
  }

  return true;
};

export const useConnectedFormOptions = ({
  formFields,
}: UseConnectedFormOptionsProps): UseConnectedFormOptionsReturn => {
  const [fieldOptions, setFieldOptions] = useState<Record<string, FieldOptionValue[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offsetRef = useRef<Record<string, number>>({});
  const loadedFieldsRef = useRef<Set<string>>(new Set());

  const { findOwnerFormIdByFieldId, isLoadingForms } = useFindOwnerFormId();

  const loadOptionsForField = useCallback(
    async (field: ConnectedFormField, search?: string, offset = 0): Promise<void> => {
      const linkedOptionsFieldId = getLinkedOptionsFieldId(field);
      if (!linkedOptionsFieldId) return;

      const ownerFormId = await findOwnerFormIdByFieldId(linkedOptionsFieldId);
      if (!ownerFormId) return;

      const result = await getFieldValues(ownerFormId, linkedOptionsFieldId, {
        limit: OPTIONS_PAGINATION_LIMIT,
        offset,
        search,
      });

      const formattedOptions: FieldOptionValue[] = result.data.map((item) => ({
        value: item.value,
        fieldId: item.responseId,
      }));

      setFieldOptions((prev) => ({
        ...prev,
        [field.id]: offset === 0 ? formattedOptions : [...(prev[field.id] ?? []), ...formattedOptions],
      }));

      offsetRef.current[field.id] = offset + result.data.length;
    },
    [findOwnerFormIdByFieldId],
  );

  const loadMoreOptions = async (fieldId: string, search?: string): Promise<void> => {
    const field = formFields.find((formField) => String(formField.id) === String(fieldId));

    if (!field || !isConnectedToForm(field, formFields)) {
      return;
    }

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
      (field) => isConnectedToForm(field, formFields) && !loadedFieldsRef.current.has(String(field.id)),
    );
    if (connectedFields.length === 0) return;

    const loadAll = async () => {
      try {
        setIsLoading(true);
        setError(null);
        await Promise.all(
          connectedFields.map((field) => {
            loadedFieldsRef.current.add(String(field.id));
            return loadOptionsForField(field, undefined, 0);
          }),
        );
      } catch (err) {
        setError(`Error loading connected form options: ${err}`);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAll();
  }, [formFields, loadOptionsForField]);

  return { fieldOptions, isLoading: isLoading || isLoadingForms, error, loadMoreOptions };
};