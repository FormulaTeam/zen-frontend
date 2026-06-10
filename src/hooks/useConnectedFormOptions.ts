import { useState, useEffect, useRef, useCallback } from "react";
import { getFieldValues, OPTIONS_PAGINATION_LIMIT } from "../api/responsesApi";
import apiClient from "../api/config";
import { FormDto, FormFieldDto, FormSectionDto } from "../types/shared";
import { useGetFormsData } from "./useGetFormsData";
import { formsScopeOption } from "../types/enums/filtersAndSorts.enum";

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

const isConnectedToForm = (field: ConnectedFormField): boolean => {
  return Boolean(getLinkedOptionsFieldId(field));
};

const getFieldsFromForm = (form: FormDto): FormFieldDto[] => {
  return (form.sections ?? []).flatMap((section: FormSectionDto) => section.fields ?? []);
};

export const useConnectedFormOptions = ({
  formFields,
}: UseConnectedFormOptionsProps): UseConnectedFormOptionsReturn => {
  const [fieldOptions, setFieldOptions] = useState<Record<string, FieldOptionValue[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const offsetRef = useRef<Record<string, number>>({});
  const loadedFieldsRef = useRef<Set<string>>(new Set());
  const linkedFieldOwnerFormIdRef = useRef<Record<string, number | null>>({});

  const { formsData: allForms, isLoading: isLoadingForms } = useGetFormsData({
    searchQuery: undefined,
    scope: formsScopeOption.LinkableForms,
    enabled: true,
  });

  const findOwnerFormIdByFieldId = useCallback(
    async (linkedOptionsFieldId: string): Promise<number | undefined> => {
      const cachedOwnerFormId = linkedFieldOwnerFormIdRef.current[linkedOptionsFieldId];

      if (cachedOwnerFormId !== undefined) {
        return cachedOwnerFormId ?? undefined;
      }

      for (const formOverview of allForms) {
        const formId = Number(formOverview.id);

        if (!formId) {
          continue;
        }

        const response = await apiClient.get<FormDto>(`/forms/${formId}`, {
          params: {
            includePermissions: true,
          },
        });

        const form = response.data;
        const fields = getFieldsFromForm(form);
        const hasLinkedField = fields.some(
          (field) => String(field.id) === String(linkedOptionsFieldId),
        );

        if (hasLinkedField) {
          linkedFieldOwnerFormIdRef.current[linkedOptionsFieldId] = formId;
          return formId;
        }
      }

      linkedFieldOwnerFormIdRef.current[linkedOptionsFieldId] = null;
      return undefined;
    },
    [allForms],
  );

  const loadOptionsForField = useCallback(
    async (field: ConnectedFormField, search?: string, offset = 0): Promise<void> => {
      const linkedOptionsFieldId = getLinkedOptionsFieldId(field);

      if (!linkedOptionsFieldId) {
        return;
      }

      const ownerFormId = await findOwnerFormIdByFieldId(linkedOptionsFieldId);

      if (!ownerFormId) {
        return;
      }

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
        [field.id]:
          offset === 0 ? formattedOptions : [...(prev[field.id] ?? []), ...formattedOptions],
      }));

      offsetRef.current[field.id] = offset + result.data.length;
    },
    [findOwnerFormIdByFieldId],
  );

  const loadMoreOptions = async (fieldId: string, search?: string): Promise<void> => {
    const field = formFields.find((formField) => String(formField.id) === String(fieldId));

    if (!field || !isConnectedToForm(field)) {
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
    if (!formFields || formFields.length === 0 || isLoadingForms || allForms.length === 0) {
      return;
    }

    const connectedFields = formFields.filter(
      (field) => isConnectedToForm(field) && !loadedFieldsRef.current.has(String(field.id)),
    );

    if (connectedFields.length === 0) {
      return;
    }

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
        const errorMessage = `Error loading connected form options: ${err}`;
        console.error(errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    void loadAll();
  }, [formFields, allForms, isLoadingForms, loadOptionsForField]);

  return {
    fieldOptions,
    isLoading: isLoading || isLoadingForms,
    error,
    loadMoreOptions,
  };
};
