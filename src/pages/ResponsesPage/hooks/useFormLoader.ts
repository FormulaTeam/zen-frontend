import { useEffect } from "react";
import { useGetForm, useGetResponsesRows } from "../../../api";
import { useInitiateFormStore } from "../stores/form.store";

export function useFormLoader(formId: string) {
  const { form, setForm, setPermissions, setRows, filter } = useInitiateFormStore();

  const {
    data: formData,
    isLoading,
    isError,
    isSuccess,
  } = useGetForm({
    formId,
    config: { enabled: !!formId },
  });

  const { data: responsesRowsData } = useGetResponsesRows({
    filter: { ...filter, form_id: Number(formId) },
  });

  useEffect(() => {
    if (responsesRowsData && isSuccess) {
      setRows(responsesRowsData);
      console.log("Responses loaded:", responsesRowsData);
    }
  }, [responsesRowsData, setRows, isSuccess]);

  useEffect(() => {
    if (formData && isSuccess) {
      setForm(formData);

      const permissions =
        "permissions" in formData && Array.isArray(formData.permissions)
          ? formData.permissions
          : [];

      setPermissions(permissions as Parameters<typeof setPermissions>[0]);
    }
  }, [formData, setForm, setPermissions, isSuccess]);

  return {
    isLoading: isLoading || (!form && !isError),
    isError,
    form,
  };
}
