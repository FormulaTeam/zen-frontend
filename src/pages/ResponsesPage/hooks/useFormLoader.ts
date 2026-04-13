import { useEffect, useMemo } from "react";
import { useGetForm, useGetResponsesRows } from "../../../api";
import { useInitiateFormStore } from "../stores/form.store";
import { Row } from "../../../utils/interfaces";

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

  const queryParams = useMemo(() => ({
    limit: filter?.pageSize ?? 25,
    search: filter?.query ? JSON.stringify(filter.query) : "",
    sortDirection: filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc",
  }), [filter]);

  const { data: responsesRowsData, isSuccess: isResponsesSuccess } = useGetResponsesRows(formId, queryParams as any);

  useEffect(() => {
    if (responsesRowsData && isResponsesSuccess && formData) {
      // Map field IDs to displayNames for the grid
      const fieldIdToDisplayName = new Map<string, string>();
      formData.sections.forEach(section => {
        section.fields.forEach(field => {
          fieldIdToDisplayName.set(field.id, field.displayName);
        });
      });

      const rows: Row[] = responsesRowsData.edges.map((edge) => {
        const node = edge.node;
        const row: Row = {
          id: node.id,
          edited: node.updatedAt,
          editedByName: node.updatedBy?.name,
          created: node.createdAt,
          createdByName: node.createdBy?.name,
          index: node.index,
          form_id: node.formId,
        };

        node.fieldValues.forEach((fv) => {
          const displayName = fieldIdToDisplayName.get(fv.fieldId);
          if (displayName) {
            row[displayName] = fv.value;
          }
        });

        return row;
      });

      setRows(rows);
      console.log("Responses loaded and mapped:", rows);
    }
  }, [responsesRowsData, setRows, isResponsesSuccess, formData]);

  useEffect(() => {
    if (formData && isSuccess) {
      const flattenedFields = (formData.sections ?? [])
        .flatMap((section) => section.fields ?? [])
        .sort((a, b) => a.index - b.index);

      setForm({
        ...formData,
        fields: flattenedFields,
      } as any);

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
