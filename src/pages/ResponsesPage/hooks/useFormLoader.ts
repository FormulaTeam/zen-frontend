import { useEffect, useMemo } from "react";
import { useGetForm, useGetResponsesRows } from "../../../api";
import { useInitiateFormStore } from "../stores/form.store";
import { Row } from "../../../utils/interfaces";

export function useFormLoader(formId: string) {
  const { form, setForm, setPermissions, setRows, filter, setResponses } = useInitiateFormStore();

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
    before: filter?.before,
    after: filter?.after,
  }), [filter]);

  const { data: responsesRowsData, isSuccess: isResponsesSuccess } = useGetResponsesRows(formId, queryParams as any);

  const { setPageInfo } = useInitiateFormStore();

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
      setResponses(responsesRowsData.edges.map((edge) => edge.node as any));
      setPageInfo(responsesRowsData.pageInfo);
      console.log("Responses loaded and mapped:", rows);
    }
  }, [responsesRowsData, setRows, setPageInfo, isResponsesSuccess, formData, setResponses]);

  useEffect(() => {
    if (formData && isSuccess) {
      const flattenedFields = (formData.sections ?? [])
        .flatMap((section) => section.fields ?? [])
        .sort((a, b) => a.index - b.index);

      const columns = flattenedFields.map((field) => ({
        field: field.displayName,
        headerName: field.displayName,
        editable: true,
      }));

      setForm({
        ...formData,
        fields: flattenedFields,
        columns,
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
