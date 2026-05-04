import { useEffect, useMemo, useRef } from "react";
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

  const queryParams = useMemo(
    () => ({
      limit: filter?.pageSize ?? 25,
      search: filter?.query ?? "",
      sortBy: filter?.sortBy,
      sortDirection: filter?.orderBy?.toLowerCase() === "asc" ? "asc" : "desc",
      before: filter?.before,
      after: filter?.after,
    }),
    [filter],
  );

  const {
    data: responsesRowsData,
    isSuccess: isResponsesSuccess,
    isFetching: isRowsFetching,
    isPlaceholderData,
    isError: isResponsesError,
    isPending: isRowsPending,
  } = useGetResponsesRows(formId, queryParams as any);

  const { setPageInfo, setIsRowsLoading } = useInitiateFormStore();

  useEffect(() => {
    const activeLoading = isRowsPending || isPlaceholderData || isRowsFetching;

    if (activeLoading) {
      setIsRowsLoading(true);
    }
  }, [isRowsPending, isPlaceholderData, isRowsFetching, setIsRowsLoading]);

  useEffect(() => {
    if (isResponsesError) {
      setIsRowsLoading(false);
    }
  }, [isResponsesError, setIsRowsLoading]);

  useEffect(() => {
    if (isResponsesSuccess && formData) {
      if (isPlaceholderData) return;

      const findResponses = (obj: any): any[] | null => {
        if (!obj || typeof obj !== "object") return null;
        if (Array.isArray(obj)) return obj;
        if (Array.isArray(obj.edges)) return obj.edges.map((e: any) => e.node);
        if (Array.isArray(obj.responses)) return obj.responses;
        if (obj.data) return findResponses(obj.data);
        return null;
      };

      const responses = findResponses(responsesRowsData) || [];

      const findPageInfo = (obj: any): any | null => {
        if (!obj || typeof obj !== "object") return null;
        const pi = obj.pageInfo || obj.page_info;
        if (pi) return pi;
        if (obj.data) return findPageInfo(obj.data);
        return null;
      };

      const rawPageInfo = findPageInfo(responsesRowsData);
      const pageInfoFromData = rawPageInfo
        ? {
            hasNextPage: !!(rawPageInfo.hasNextPage ?? rawPageInfo.has_next_page),
            hasPreviousPage: !!(rawPageInfo.hasPreviousPage ?? rawPageInfo.has_previous_page),
            startCursor: rawPageInfo.startCursor ?? rawPageInfo.start_cursor ?? null,
            endCursor: rawPageInfo.endCursor ?? rawPageInfo.end_cursor ?? null,
          }
        : null;

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
          childResponses: node.childResponses || [],
        };

        const fieldValues = node.fieldValues || node.field_values || node.data || [];

        fieldValues.forEach((fv: any) => {
          const fieldId = fv.field_id || fv.fieldId;

          if (!fieldId) return;

          const displayName = fieldIdToDisplayName.get(fieldId);

          row[fieldId] = fv.value;

          if (displayName && row[displayName] === undefined) {
            row[displayName] = fv.value;
          }
        });

        return row;
      });

      setRows(rows);
      setResponses(responses as any);
      setPageInfo(
        pageInfoFromData || {
          hasNextPage: false,
          hasPreviousPage: false,
          startCursor: null,
          endCursor: null,
        },
      );

      setIsRowsLoading(false);
    }
  }, [
    responsesRowsData,
    isResponsesSuccess,
    isPlaceholderData,
    formData,
    setRows,
    setResponses,
    setPageInfo,
    setIsRowsLoading,
  ]);

  const lastFormIdRef = useRef<string | number | undefined>(undefined);

  useEffect(() => {
    if (formData && isSuccess) {
      const isNewForm = formData.id !== lastFormIdRef.current;

      if (isNewForm) {
        lastFormIdRef.current = formData.id;
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
      } else if (form) {
        // Update metadata if changed
        const anyFormData = formData as any;
        if (
          form.responsesCount !== anyFormData.responsesCount ||
          form.lastInteractionAt !== anyFormData.lastInteractionAt ||
          form.name !== anyFormData.name
        ) {
          setForm({
            ...form,
            responsesCount: anyFormData.responsesCount,
            lastInteractionAt: anyFormData.lastInteractionAt,
            name: anyFormData.name,
          });
        }
      }
    }
  }, [formData, setForm, setPermissions, isSuccess, form]);

  return {
    isLoading: isLoading || (!form && !isError),
    isError,
    form,
  };
}
