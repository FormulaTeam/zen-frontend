import { useEffect } from "react";
import { useGetForm, useGetResponses, useGetResponsesRows, useGetFormFieldsMap } from "../../../api";
import { useInitiateFormStore } from "../stores/form.store";
import { FieldTypeIds } from "../../../utils/interfaces";

export function useFormLoader(formId: string) {
  const { form, setForm, setPermissions, setRows, setFormFieldsMap, filter } = useInitiateFormStore();

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
    filter: { ...filter, form_id: parseInt(formId) },
  });

  const { data: formFieldsMapData } = useGetFormFieldsMap({
    filter: { ...filter, form_id: parseInt(formId) },
  });

  useEffect(() => {
    if (responsesRowsData && isSuccess) {
      setRows(responsesRowsData);
      console.log("Responses loaded:", responsesRowsData);
    }
  }, [responsesRowsData, setRows, isSuccess]);

  useEffect(() => {
    if (formFieldsMapData && isSuccess) {
      setFormFieldsMap(formFieldsMapData);
      console.log("Form fields map loaded:", formFieldsMapData);
    }
  }, [formFieldsMapData, isSuccess, setFormFieldsMap]);

  useEffect(() => {
    if (formData && isSuccess) {
      setForm(formData);
      setPermissions([...(formData?.permissions || [])]);
    }
  }, [formData, setForm, setPermissions, isSuccess]);

  return {
    isLoading: isLoading || (!form && !isError), // Loading if query is loading OR form not in store yet
    isError,
    form,
  };
}
