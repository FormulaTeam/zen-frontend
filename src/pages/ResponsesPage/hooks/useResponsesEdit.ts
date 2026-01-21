import { useState } from "react";
import { GridRowModel } from "@mui/x-data-grid-pro";
import { showSuccessNotification, showErrorNotification } from "@utils/utils";
import { useBatchUpdateResponses, useGetResponses } from "@api/responsesApi";
import { useFormStore } from "../stores/form.store";
import { useAuth } from "@contexts/AuthContext";
import { FieldTypeIds, ResponseFieldValue, Row } from "@utils/interfaces";
import {
  CustomError,
  NoUnsavedChangesError,
  NoResponsesFoundError,
  FormNotLoadedError,
  NoValidChangesError,
  SaveFailedError,
} from "../../../errors";

export const useResponsesEdit = () => {
  const { form, rows, setRows, filter } = useFormStore();
  const { user } = useAuth();

  const [isInEditMode, setIsInEditMode] = useState(false);

  const [editedRows, setEditedRows] = useState<Map<number, Row>>(new Map());
  const [localRows, setLocalRows] = useState<Row[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number, Record<string, string>>>({});


  const { data: fullResponses } = useGetResponses({
    filter: { ...filter, form_id: form?.id },
  });

  const { mutateAsync: batchUpdateResponses, isPending: isUpdating } = useBatchUpdateResponses({
    formId: form?.id || 0,
  });

  const responseRows: Row[] = rows?.filter((row) => row != null) || [];
  const hasUnsavedChanges: boolean = editedRows.size > 0;

  const toggleEditMode = (): void => {
    if (isInEditMode && hasUnsavedChanges) {
      setShowCancelDialog(true);

    } else {
      const nextEditMode: boolean = !isInEditMode;

      setIsInEditMode(nextEditMode);
      setEditedRows(new Map());
      setLocalRows(nextEditMode ? [...responseRows] : responseRows);
      if (!nextEditMode) {
        setValidationErrors({});
      }
    }
  };

  const confirmCancel = (): void => {
    setEditedRows(new Map());
    setLocalRows(responseRows);
    setIsInEditMode(false);
    setShowCancelDialog(false);
    setValidationErrors({});
  };

  const closeCancelDialog = (): void => {
    setShowCancelDialog(false);
  };

  const startCellEdit = (): void => {
    if (!isInEditMode) {
      setIsInEditMode(true);
      setLocalRows([...responseRows]);
    }
  };

  const handleCellLiveChange = <T,>(rowId: number, columnName: string, value: T, isValid?: boolean): void => {
    try {
      const field = form?.fields?.find((f) => f.displayName === columnName || f.name === columnName || f.uniqueId === columnName);
      if (!field) return;

      const keyName = field.uniqueId ?? field.name ?? field.displayName;
      const isString = (v: unknown): v is string => typeof v === "string";

      setValidationErrors((prev) => {
        const next = { ...prev };
        const rowErrors = { ...(next[rowId] || {}) };


        if (rowErrors[keyName]) {
          delete rowErrors[keyName];
        }


        if (field.required) {
          const isEmpty =
            value === undefined ||
            value === null ||
            (isString(value) && value.trim() === "") ||
            (Array.isArray(value) && (value as unknown[]).length === 0);
          if (isEmpty) {
            rowErrors[keyName] = `שדה זה הינו חובה`;
          }
        }

        if (field.validationRegex && value != null && isString(value) && value !== "") {
          const reg = new RegExp(field.validationRegex);
          if (!reg.test(value)) {
            rowErrors[keyName] = `${field.displayName} - ערך לא תקין`;
          }
        }

        // Number validations (min/max/type)
        if (field.typeId === FieldTypeIds.number) {
          const valStr = (typeof value === "number" || isString(value)) ? String(value) : "";
          if (valStr !== "") {
            const parsed = field.numberType === "integer" ? parseInt(valStr, 10) : parseFloat(valStr);
            if (Number.isNaN(parsed)) {
              rowErrors[keyName] = field.numberType === "integer" ? "חובה להזין מספר שלם" : "חובה להזין מספר עשרוני";
            } else {
              if (field.minValue !== undefined && parsed < field.minValue) {
                rowErrors[keyName] = `המספר חייב להיות גדול מ- ${field.minValue}`;
              }
              if (field.maxValue !== undefined && parsed > field.maxValue) {
                rowErrors[keyName] = `המספר חייב להיות קטן מ- ${field.maxValue}`;
              }
            }
          }
        }

        if (Object.keys(rowErrors).length === 0) {
          delete next[rowId];
        } else {
          next[rowId] = rowErrors;
        }

        return next;
      });

      // mark row as edited so save button becomes active - use keyName as the edited column key
      setEditedRows((prev) => {
        const next = new Map(prev);
        const existing = next.get(rowId) || ({} as Row);
        next.set(rowId, { ...existing, [keyName]: value } as Row);
        return next;
      });
    } catch (e) {
      // ignore
    }
  };

  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel): GridRowModel => {
    const newRowId: number = newRow.id

    if (Number.isNaN(newRowId)) {
      return newRow;
    }

    setLocalRows((prevRows: Row[]) =>
      prevRows.map((row: Row) => row?.id === newRowId ? ({ ...row, ...newRow }) : row)
    );

    setEditedRows((prevEditedRows: Map<number, Row>) => new Map(prevEditedRows).set(newRowId, newRow as Row));

    // Validate the updated row and set validation errors per cell if needed
    try {
      const rowErrors: Record<string, string> = {};
      form?.fields?.forEach((field: any) => {
        const keyName = field.uniqueId ?? field.name ?? field.displayName;
        const value = (newRow as any)[keyName] ?? (newRow as any)[field.name] ?? (newRow as any)[field.displayName];

        if (field.required) {
          const isEmpty =
            value === undefined ||
            value === null ||
            (typeof value === "string" && value.trim() === "") ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) {
            rowErrors[keyName] = `שדה זה הינו חובה`;
            return;
          }
        }

        if (field.validationRegex && value) {
          const reg = new RegExp(field.validationRegex);
          if (!reg.test(String(value))) {
            rowErrors[keyName] = `${field.displayName} - ערך לא תקין`;
          }
        }

        if (field.typeId === FieldTypeIds.number) {
          const valStr = value === undefined || value === null ? "" : String(value);
          if (valStr !== "") {
            const parsed = field.numberType === "integer" ? parseInt(valStr, 10) : parseFloat(valStr);
            if (Number.isNaN(parsed)) {
              rowErrors[keyName] = field.numberType === "integer" ? "חובה להזין מספר שלם" : "חובה להזין מספר עשרוני";
            } else {
              if (field.minValue !== undefined && parsed < field.minValue) {
                rowErrors[keyName] = `המספר חייב להיות גדול מ- ${field.minValue}`;
              }
              if (field.maxValue !== undefined && parsed > field.maxValue) {
                rowErrors[keyName] = `המספר חייב להיות קטן מ- ${field.maxValue}`;
              }
            }
          }
        }
      });

      setValidationErrors((prev) => {
        const next = { ...prev };
        if (Object.keys(rowErrors).length === 0) {
          delete next[newRowId];
        } else {
          next[newRowId] = rowErrors;
        }
        return next;
      });
    } catch (e) {
      // ignore validation errors
    }

    return newRow;
  };


  const buildResponseUpdatePayload = (rowId: number, editedRow: Partial<Row>) => {
    const original = fullResponses?.find((r) => Number(r?.id) === rowId);
    if (!original) {
      return null;
    }

    const columnToUniqueId = new Map<string, string>();
    form?.columns?.forEach((col: any) => {
      const matchingField = form.fields?.find(
        (field) => field.displayName === col.field || field.name === col.field
      );
      if (matchingField?.uniqueId) {
        columnToUniqueId.set(col.field, matchingField.uniqueId);
      }
    });

    const updatedData: ResponseFieldValue[] = original.data.map((field) => {
      const columnField = Array.from(columnToUniqueId.entries())?.find(
        ([_, uid]) => uid === field.uniqueId
      )?.[0];

      if (columnField && editedRow.hasOwnProperty(columnField)) {
        return { ...field, value: editedRow[columnField] };
      }
      return field;
    });

    return {
      id: rowId,
      responseData: {
        ...original,
        data: updatedData,
        edited_by: user?.upn?.toLowerCase() || original.edited_by,
        edited_by_name: user?.displayName || original.edited_by_name,
      },
    };
  };


  const saveChanges = async (): Promise<void> => {
    try {
      // Validate edited rows before attempting to save
      const newValidationErrors: Record<number, Record<string, string>> = {};
      editedRows.forEach((editedRow, rowId) => {
        try {
          const rowErrs: Record<string, string> = {};
          form?.fields?.forEach((field: any) => {
            const keyName = field.uniqueId ?? field.name ?? field.displayName;
            const value = (editedRow as any)[keyName] ?? (editedRow as any)[field.name] ?? (editedRow as any)[field.displayName];

            if (field.required) {
              const isEmpty =
                value === undefined ||
                value === null ||
                (typeof value === "string" && value.trim() === "") ||
                (Array.isArray(value) && value.length === 0);

              if (isEmpty) {
                rowErrs[keyName] = `שדה זה הינו חובה`;
                return;
              }
            }

            if (field.validationRegex && value) {
              const reg = new RegExp(field.validationRegex);
              if (!reg.test(String(value))) {
                rowErrs[keyName] = `${field.displayName} - ערך לא תקין`;
              }
            }


            if (field.typeId === FieldTypeIds.number) {
              const valStr = value === undefined || value === null ? "" : String(value);
              if (valStr !== "") {
                const parsed = field.numberType === "integer" ? parseInt(valStr, 10) : parseFloat(valStr);
                if (Number.isNaN(parsed)) {
                  rowErrs[keyName] = field.numberType === "integer" ? "חובה להזין מספר שלם" : "חובה להזין מספר עשרוני";
                } else {
                  if (field.minValue !== undefined && parsed < field.minValue) {
                    rowErrs[keyName] = `המספר חייב להיות גדול מ- ${field.minValue}`;
                  }
                  if (field.maxValue !== undefined && parsed > field.maxValue) {
                    rowErrs[keyName] = `המספר חייב להיות קטן מ- ${field.maxValue}`;
                  }
                }
              }
            }
          });
          if (Object.keys(rowErrs).length > 0) {
            newValidationErrors[rowId] = rowErrs;
          }
        } catch (e) {
          // ignore
        }
      });

      if (Object.keys(newValidationErrors).length > 0) {
        setValidationErrors((prev) => ({ ...prev, ...newValidationErrors }));
        showErrorNotification("יש לתקן את השגיאות לפני השמירה");
        return;
      }
      if (!hasUnsavedChanges) {
        throw new NoUnsavedChangesError();
      }
      if (!fullResponses?.length) {
        throw new NoResponsesFoundError();
      }
      if (!form) {
        throw new FormNotLoadedError();
      }

      const updatesToSend = Array.from(editedRows.entries())
        .map(([rowId, editedRow]) => buildResponseUpdatePayload(rowId, editedRow))
        .filter((updatedRow) => updatedRow !== null);

      if (updatesToSend.length === 0) {
        throw new NoValidChangesError();
      }

      await batchUpdateResponses(updatesToSend as any);

      setRows(localRows);
      setEditedRows(new Map());
      setIsInEditMode(false);
      setValidationErrors({});

      showSuccessNotification(`נשמרו ${editedRows.size} שינויים בהצלחה!`);
    } catch (error) {
      if (error instanceof CustomError) {
        if (error instanceof NoUnsavedChangesError) {
          showSuccessNotification(error.message);
        } else {
          showErrorNotification(error.message);
        }
      } else {
        console.error("Error saving changes:", error);
        showErrorNotification(new SaveFailedError().message);
      }
    }
  };

  return {
    isInEditMode,
    editedRowsCount: editedRows.size,
    localRows,
    validationErrors,
    handleCellLiveChange,
    isUpdating,
    showCancelDialog,
    handleToggleEditMode: toggleEditMode,
    handleCellEditStart: startCellEdit,
    handleProcessRowUpdate: processRowUpdate,
    handleSaveChanges: saveChanges,
    handleConfirmCancel: confirmCancel,
    handleCancelDialogClose: closeCancelDialog,
  };
};
