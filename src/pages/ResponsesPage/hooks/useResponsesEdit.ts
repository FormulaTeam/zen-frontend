import { useState, useRef } from "react";
import { GridRowModel } from "@mui/x-data-grid-pro";
import { showSuccessNotification, showErrorNotification } from "@utils/utils";
import { useBatchUpdateResponses, useGetResponses, getResponseWithFlatFields, useCreateResponse } from "@api/responsesApi";
import { uploadFilesToS3 } from "@api/filesApi";
import { useFormStore } from "../stores/form.store";
import { useAuth } from "@contexts/AuthContext";
import { FieldTypeIds, NewResponse, ResponseFieldValue, Row } from "@utils/interfaces";
import {
  CustomError,
  NoUnsavedChangesError,
  NoResponsesFoundError,
  FormNotLoadedError,
  NoValidChangesError,
  SaveFailedError,
} from "../../../errors";
import moment from "moment";
import { DEFAULT_DATE_FORMAT } from "@utils/utils";

export const useResponsesEdit = () => {
  const { form, rows, setRows, filter } = useFormStore();
  const { user } = useAuth();

  const [isInEditMode, setIsInEditMode] = useState(false);

  const [editedRows, setEditedRows] = useState<Map<number | string, Row>>(new Map());
  const [localRows, setLocalRows] = useState<Row[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<number | string, Record<string, string>>>({});

  const newRowCounterRef = useRef(0);
  const { data: fullResponses } = useGetResponses({
    filter: { ...filter, form_id: form?.id },
  });

  const { mutateAsync: batchUpdateResponses, isPending: isUpdating } = useBatchUpdateResponses({
    formId: form?.id || 0,
  });

  const { mutateAsync: createResponse } = useCreateResponse();

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
        newRowCounterRef.current = 0;
      }
    }
  };

  const confirmCancel = (): void => {
    setEditedRows(new Map());
    setLocalRows(responseRows);
    setIsInEditMode(false);
    setShowCancelDialog(false);
    setValidationErrors({});
    newRowCounterRef.current = 0;
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

  const handleCellLiveChange = <T,>(rowId: number | string, columnName: string, value: T, isValid?: boolean): void => {
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

      setEditedRows((prev) => {
        const next = new Map(prev);
        const existing = next.get(rowId) || ({} as Row);
        next.set(rowId, { ...existing, [field.displayName]: value } as Row);
        return next;
      });
    } catch (e) {
      // ignore
    }
  };

  const processRowUpdate = (newRow: GridRowModel, oldRow: GridRowModel): GridRowModel => {
    const newRowId: number | string = newRow.id;
    const numericId = Number(newRowId);

    if (typeof newRowId === "number" && Number.isNaN(numericId)) {
      return newRow;
    }

    setLocalRows((prevRows: Row[]) =>
      prevRows.map((row: Row) => String(row?.id) === String(newRowId) ? ({ ...row, ...newRow }) : row)
    );

    setEditedRows((prevEditedRows: Map<number | string, Row>) => new Map(prevEditedRows).set(newRowId, newRow as Row));

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


  const buildResponseUpdatePayload = async (rowId: number, editedRow: Partial<Row>) => {
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

    const updatedData: ResponseFieldValue[] = await Promise.all(
      (form?.fields || []).map(async (formField) => {
        const existingFieldData = (original as any).data?.find((d: any) => d.uniqueId === formField.uniqueId);

        const columnField = Array.from(columnToUniqueId.entries()).find(
          ([_, uid]) => uid === formField.uniqueId
        )?.[0];

        if (columnField && editedRow.hasOwnProperty(columnField)) {
          const baseData = existingFieldData || {
            uniqueId: formField.uniqueId,
            name: formField.name,
            typeId: formField.typeId,
            value: null,
          };

          // Handle file fields: upload new files and normalize attached files
          if (formField.fieldType === 'file' || formField.typeId === FieldTypeIds.file) {
            try {
              // Try to locate edited value using multiple possible keys (column field, displayName, name, uniqueId)
              const editedValue = ((): any => {
                if (columnField && editedRow.hasOwnProperty(columnField)) {
                  return editedRow[columnField];
                }

                return undefined;
              })();
              let newFilesToUpload: File[] = [];
              let attachedFilesFromValue: any[] = [];
              let deletedFilesFromValue: any[] = [];

              if (Array.isArray(editedValue)) {
                attachedFilesFromValue = editedValue;
              } else if (editedValue && typeof editedValue === 'object') {
                if (editedValue.files) {
                  newFilesToUpload = editedValue.files.newFiles || [];
                  attachedFilesFromValue = editedValue.files.attachedFiles || [];
                } else if (Array.isArray(editedValue.files)) {
                  attachedFilesFromValue = editedValue.files;
                }
                deletedFilesFromValue = editedValue.deletedFiles || [];
              }

              const uploadResponse = newFilesToUpload.length > 0 ? await uploadFilesToS3({ newFiles: newFilesToUpload }, form.id) : [];

              const normalizeAttached = (fileItem: any) => {
                const name = fileItem.name || fileItem.fileName || "";
                const url = fileItem.url || fileItem.fileUrl || fileItem.downloadUrl || "";
                return { name, url };
              };

              const normalizedAttachedFiles = attachedFilesFromValue.map(normalizeAttached);
              const combinedFiles = [...uploadResponse, ...normalizedAttachedFiles];

              return { uniqueId: formField.uniqueId, value: { files: combinedFiles } };
            } catch (error) {
              return { ...baseData, value: editedRow[columnField] };
            }
          }

          return { uniqueId: formField.uniqueId, value: editedRow[columnField] };
        }

        return existingFieldData || {
          uniqueId: formField.uniqueId,
          value: null,
        };
      }),
    );

    const fieldsNameValueObj = getResponseWithFlatFields(updatedData, form.fields, []);

    return {
      id: rowId,
      responseData: {
        ...original,
        data: updatedData,
        edited_by: user?.upn?.toLowerCase() || original.edited_by,
        edited_by_name: user?.displayName || original.edited_by_name,
        ...fieldsNameValueObj,
      },
    };
  };

  const addNewResponse = (): void => {
    if (!isInEditMode || !form?.fields) return;

    newRowCounterRef.current += 1;
    const tempId = `new_${newRowCounterRef.current}`;

    const now = moment().format(DEFAULT_DATE_FORMAT);
    const newRow: Row = {
      id: tempId as unknown as number,
      created: now,
      createdByName: user?.displayName || "",
      edited: now,
      editedByName: user?.displayName || "",
    };

    form.fields.forEach((field) => {
      newRow[field.displayName] = "";
    });

    setLocalRows((prev) => [newRow, ...prev]);
    setEditedRows((prev) => new Map(prev).set(tempId, newRow));
  };


  const saveChanges = async (): Promise<void> => {
    try {
      // Validate edited rows before attempting to save
      const newValidationErrors: Record<number | string, Record<string, string>> = {};
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
      if (!form) {
        throw new FormNotLoadedError();
      }

      const newRowEntries = Array.from(editedRows.entries()).filter(([rowId]) => typeof rowId === "string");
      const existingRowEntries = Array.from(editedRows.entries()).filter(([rowId]) => typeof rowId === "number");

      if (existingRowEntries.length > 0 && !fullResponses?.length) {
        throw new NoResponsesFoundError();
      }

      const updatesToSendPromises = existingRowEntries.map(async ([rowId, editedRow]) =>
        await buildResponseUpdatePayload(rowId as number, editedRow),
      );

      const updatesToSendResults = await Promise.all(updatesToSendPromises);
      const updatesToSend = updatesToSendResults.filter((updatedRow) => updatedRow !== null);

      // Sort new rows in ascending insertion order so the first added (top of list) is saved first
      const sortedNewRowEntries = [...newRowEntries].sort(([idA], [idB]) => {
        const numA = parseInt(String(idA).replace("new_", ""), 10);
        const numB = parseInt(String(idB).replace("new_", ""), 10);
        return numA - numB;
      });

      if (updatesToSend.length === 0 && sortedNewRowEntries.length === 0) {
        throw new NoValidChangesError();
      }

      if (updatesToSend.length > 0) {
        try {
          await batchUpdateResponses(updatesToSend as any);
        } catch (batchError) {
          console.error('batchUpdateResponses failed:', batchError);
          throw batchError;
        }
      }

      for (const [, editedRow] of sortedNewRowEntries) {
        const newResponsePayload = {
          form_id: form.id,
          created_by: user?.upn?.toLowerCase() as string,
          created_by_name: user?.displayName || "",
          updated_by: user?.upn?.toLowerCase(),
          edited_by: user?.upn?.toLowerCase(),
          edited_by_name: user?.displayName || "",
          data: form.fields.map((field) => ({
            uniqueId: field.uniqueId,
            value: (editedRow as any)[field.displayName] ?? "",
          })),
        };
        await createResponse(newResponsePayload as NewResponse);
      }

      newRowCounterRef.current = 0;
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
    handleAddNewResponse: addNewResponse,
  };
};
