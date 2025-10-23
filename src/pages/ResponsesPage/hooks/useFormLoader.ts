import { useEffect } from "react";
import { useGetForm } from "../../../api";
import { useInitiateFormStore } from "../stores/form.store";

export function useFormLoader(formId: string) {
  const { form, setForm, setPermissions } = useInitiateFormStore();

  const {
    data: formData,
    isLoading,
    isError,
  } = useGetForm({
    formId,
    config: { enabled: !!formId },
  });

  useEffect(() => {
    if (formData) {
      setForm(formData);
      setPermissions([...(formData?.permissions || [])]);
    }
  }, [formData, setForm, setPermissions]);

  // Return the store's form state, not the query result
  return {
    isLoading: isLoading || (!form && !isError), // Loading if query is loading OR form not in store yet
    isError,
    form,
  };
}
