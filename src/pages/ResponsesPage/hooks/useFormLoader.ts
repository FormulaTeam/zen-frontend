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
    includePermissions: true,
    config: { enabled: !!formId },
  });

  const queryParams = useMemo(() => ({
    limit: filter?.pageSize ?? 25,
    search: filter?.query ?? "",
    sortBy: filter?.sortBy,
    sortDirection: filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc",
    before: filter?.before,
    after: filter?.after,
  }), [filter]);

  console.log("useFormLoader: Sending queryParams:", queryParams);

  const { data: responsesRowsData, isSuccess: isResponsesSuccess } = useGetResponsesRows(formId, queryParams as any);

  const { setPageInfo } = useInitiateFormStore();

  useEffect(() => {
    if (responsesRowsData && isResponsesSuccess && formData) {
      const data = responsesRowsData as any;
      // Defensive mapping to handle both array and paginated object formats
      const responses: any[] = Array.isArray(responsesRowsData)
        ? responsesRowsData
        : (responsesRowsData as any)?.edges?.map((e: any) => e.node) ||
          (responsesRowsData as any)?.responses ||
          [];

      // Robust PageInfo detection (handle camelCase and snake_case)
      const rawPageInfo = data?.pageInfo || data?.page_info;
      const pageInfoFromData = rawPageInfo ? {
        hasNextPage: !!(rawPageInfo.hasNextPage ?? rawPageInfo.has_next_page),
        hasPreviousPage: !!(rawPageInfo.hasPreviousPage ?? rawPageInfo.has_previous_page),
        startCursor: rawPageInfo.startCursor ?? rawPageInfo.start_cursor ?? null,
        endCursor: rawPageInfo.endCursor ?? rawPageInfo.end_cursor ?? null,
      } : null;

      console.log("useFormLoader: responsesRowsData:", data);
      console.log("useFormLoader: pageInfoFromData:", pageInfoFromData);

      // Map field IDs to displayNames for the grid
      const fieldIdToDisplayName = new Map<string, string>();
      formData.sections.forEach((section) => {
        section.fields.forEach((field) => {
          fieldIdToDisplayName.set(field.id, field.displayName);
        });
      });

      const rows: Row[] = responses.map((node: any) => {
        const row: Row = {
          id: node.id,
          edited: node.updated_at || node.updatedAt,
          editedByName: node.updated_by?.name || node.updatedBy?.name,
          created: node.created_at || node.createdAt,
          createdByName: node.created_by?.name || node.createdBy?.name,
          index: node.index,
          form_id: node.form_id || node.formId,
        };

        const fieldValues = node.fieldValues || node.field_values || node.data || [];
        fieldValues.forEach((fv: any) => {
          const fieldId = fv.field_id || fv.fieldId;
          const displayName = fieldIdToDisplayName.get(fieldId);
          if (displayName) {
            row[displayName] = fv.value;
          }
        });

        return row;
      });

      setRows(rows);
      setResponses(responses as any);

      if (pageInfoFromData) {
        setPageInfo(pageInfoFromData);
      } else {
        // Fallback for unexpected formats, though Rule 4 says trust cursors.
        // If we don't have pageInfo, we can't do stable cursor pagination.
        setPageInfo({
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        });
      }

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
