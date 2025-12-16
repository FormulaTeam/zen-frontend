import { useState } from "react";
import { GridRowModel } from "@mui/x-data-grid-pro";
import { showSuccessNotification, showErrorNotification } from "../../../utils/utils";
import { useBatchUpdateResponses, useGetResponses } from "../../../api/responsesApi";
import { useInitiateFormStore } from "../stores/form.store";
import { useAuth } from "../../../contexts/AuthContext";

export const useResponsesEdit = () => {
  const store = useInitiateFormStore();
  const { user } = useAuth();

  const [isInEditMode, setIsInEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState<Map<string, any>>(new Map());
  const [localRows, setLocalRows] = useState<any[]>([]);

  const { form, rows, setRows, filter } = store;

  const { data: fullResponses } = useGetResponses({
    filter: { ...filter, form_id: form?.id },
  });

  const { mutateAsync: batchUpdateResponses, isPending: isUpdating } = useBatchUpdateResponses({
    formId: form?.id || 0,
  });

  // If form hasn't loaded yet, return default no-op handlers
  if (!store.form) {
    return {
      isInEditMode: false,
      setIsInEditMode: () => { },
      editedRows: new Map(),
      setEditedRows: () => { },
      localRows: [],
      setLocalRows: () => { },
      isUpdating: false,
      handleToggleEditMode: () => { },
      handleProcessRowUpdate: (newRow: GridRowModel) => newRow,
      handleSaveChanges: async () => { },
    };
  }

  const responsesRows = Array.isArray(rows)
    ? rows.reduce((rows, currRow: any) => {
      const id =
        currRow?.id ??
        currRow?._id ??
        currRow?.responseId ??
        `${currRow?.formId ?? ""}-${currRow?.responseId ?? currRow?._id ?? currRow?.id}`;
      if (!rows._seen.has(id)) {
        rows._seen.add(id);
        rows.list.push(currRow);
      }
      return rows;
    }, { _seen: new Set<string>(), list: [] as any[] }).list
    : [];

  const handleToggleEditMode = (): void => {
    if (isInEditMode) {
      setEditedRows(new Map());
      setLocalRows(responsesRows);
    } else {
      setLocalRows([...responsesRows]);
    }
    setIsInEditMode(!isInEditMode);
  };

  const handleProcessRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel) => {
    setLocalRows((prevRows) =>
      prevRows.map((row) => {
        const rowId = row.id ?? row._id ?? row.responseId;
        const newRowId = newRow.id ?? newRow._id ?? newRow.responseId;
        return String(rowId) === String(newRowId) ? { ...row, ...newRow } : row;
      })
    );

    const rowId = newRow.id ?? newRow._id ?? newRow.responseId;
    setEditedRows((prev) => {
      const updated = new Map(prev);
      updated.set(String(rowId), newRow);
      return updated;
    });

    return newRow;
  };

  const handleSaveChanges = async () => {
    if (editedRows.size === 0) {
      showSuccessNotification("אין שינויים לשמירה");
      return;
    }

    if (!fullResponses || fullResponses.length === 0) {
      showErrorNotification("לא נמצאו תגובות לעדכון");
      return;
    }

    if (!form) {
      showErrorNotification("טופס לא נטען");
      return;
    }

    try {
      const updatesToSend = Array.from(editedRows.entries()).map(([rowId, editedRowData]) => {
        const originalResponse = fullResponses?.find((r) => String(r.id) === String(rowId));

        if (!originalResponse || !form) {
          return null;
        }

        const uniqueIdToColumnField = new Map();
        form.columns?.forEach((col: any) => {
          const field = form.fields?.find(f =>
            f.displayName === col.field || f.name === col.field
          );
          if (field && field.uniqueId) {
            uniqueIdToColumnField.set(field.uniqueId, col.field);
          }
        });

        const updatedData: any = {
          ...originalResponse,
          edited_by: user?.upn?.toLowerCase() || originalResponse.edited_by,
          edited_by_name: user?.displayName || originalResponse.edited_by_name,
          data: originalResponse.data.map((field) => {
            const columnFieldName = uniqueIdToColumnField.get(field.uniqueId);
            if (columnFieldName && editedRowData.hasOwnProperty(columnFieldName)) {
              return {
                ...field,
                value: editedRowData[columnFieldName],
              };
            }
            return field;
          }),
        };

        Object.entries(editedRowData).forEach(([fieldName, newValue]) => {
          if (fieldName !== 'id' && fieldName !== '_id' && fieldName !== 'responseId' &&
            fieldName !== 'editedByName' && fieldName !== 'edited' &&
            fieldName !== 'sync' && fieldName !== 'expand' && fieldName !== 'parentResponse') {
            updatedData[fieldName] = typeof newValue === "object" ? JSON.stringify(newValue) : newValue;
          }
        });

        return {
          id: Number(originalResponse.id),
          responseData: updatedData,
        };
      }).filter((item): item is { id: number; responseData: any } => item !== null && !isNaN(item.id));

      if (updatesToSend.length === 0) {
        showErrorNotification("לא נמצאו שינויים תקינים לשמירה");
        return;
      }

      await batchUpdateResponses(updatesToSend);
      setRows(localRows);
      setEditedRows(new Map());
      setIsInEditMode(false);

      showSuccessNotification(`נשמרו ${editedRows.size} שינויים בהצלחה!`);
    } catch (error) {
      console.error("Error saving changes:", error);
      showErrorNotification("שגיאה בשמירת השינויים");
    }
  };

  return {
    isInEditMode,
    setIsInEditMode,
    editedRows,
    setEditedRows,
    localRows,
    setLocalRows,
    isUpdating,
    handleToggleEditMode,
    handleProcessRowUpdate,
    handleSaveChanges,
  };
};
