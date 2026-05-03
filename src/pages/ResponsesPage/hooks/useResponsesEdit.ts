import { useMemo, useRef, useState, useCallback } from "react";
import { GridRowModel } from "@mui/x-data-grid-pro";
import { showSuccessNotification, showErrorNotification, DEFAULT_DATE_FORMAT } from "@utils/utils";
import { useUpdateResponses, useCreateResponse } from "@api/responsesApi";
import { uploadFilesToS3 } from "@api/filesApi";
import { useFormStore } from "../stores/form.store";
import { useAuth } from "@contexts/AuthContext";
import {
  BulkUpdateResponsesDto,
  CreateResponseDto,
  FormDto,
  FormFieldDto,
  ResponseDto,
  ResponseFieldValueDto,
  UpdateOneResponseDto,
  UserPersonalDto,
} from "src/types/shared";
import { fieldType } from "formula-gear";
import {
  CustomError,
  NoUnsavedChangesError,
  NoResponsesFoundError,
  FormNotLoadedError,
  NoValidChangesError,
  SaveFailedError,
} from "../../../errors";
import moment from "moment";

type RowId = string | number;

type Row = GridRowModel & {
  id: RowId;
  created?: string;
  createdByName?: string;
  edited?: string;
  editedByName?: string;
  [key: string]: unknown;
};

type EditorFieldExtra = {
  validationRegex?: string;
  minValue?: number;
  maxValue?: number;
  numberType?: string;
};

const getFieldExtra = (field: FormFieldDto): EditorFieldExtra =>
  (field.extra as EditorFieldExtra | undefined) ?? {};

const isTempRowId = (rowId: RowId): boolean => String(rowId).startsWith("new_");

const getAuthPersonalUser = (user: unknown): UserPersonalDto | undefined => {
  if (!user || typeof user !== "object") {
    return undefined;
  }

  const safeUpn = "upn" in user && typeof user.upn === "string" ? user.upn : "";

  if ("name" in user && typeof user.name === "string") {
    return {
      name: user.name || safeUpn,
      upn: safeUpn,
    };
  }

  const firstName = "firstName" in user && typeof user.firstName === "string" ? user.firstName : "";
  const lastName = "lastName" in user && typeof user.lastName === "string" ? user.lastName : "";
  const displayName =
    "displayName" in user && typeof user.displayName === "string" ? user.displayName : "";

  const fullName = `${firstName} ${lastName}`.trim() || displayName || safeUpn;

  return {
    name: fullName,
    upn: safeUpn,
  };
};

const getAuthDisplayName = (user: unknown): string => {
  const personalUser = getAuthPersonalUser(user);
  return personalUser?.name ?? "";
};

const normalizeUploadedFile = (fileItem: any) => ({
  name: fileItem?.name || fileItem?.fileName || "",
  url: fileItem?.url || fileItem?.fileUrl || fileItem?.downloadUrl || "",
});

const getEditedFileValueParts = (editedValue: unknown) => {
  let newFilesToUpload: File[] = [];
  let attachedFiles: any[] = [];

  if (Array.isArray(editedValue)) {
    attachedFiles = editedValue;
  } else if (editedValue && typeof editedValue === "object") {
    const typedValue = editedValue as {
      files?: any;
      deletedFiles?: any[];
    };

    if (
      typedValue.files &&
      typeof typedValue.files === "object" &&
      !Array.isArray(typedValue.files)
    ) {
      newFilesToUpload = typedValue.files.newFiles || [];
      attachedFiles = typedValue.files.attachedFiles || [];
    } else if (Array.isArray(typedValue.files)) {
      attachedFiles = typedValue.files;
    }
  }

  return { newFilesToUpload, attachedFiles };
};

export const useResponsesEdit = () => {
  const { form, rows, setRows, filter, responses, setForm } = useFormStore();
  const { user } = useAuth();

  const [isInEditMode, setIsInEditMode] = useState(false);
  const [editedRows, setEditedRows] = useState<Map<RowId, Row>>(new Map());
  const [localRows, setLocalRows] = useState<Row[]>([]);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<RowId, Record<string, string>>>(
    {},
  );

  const newRowCounterRef = useRef(0);

  const dtoForm = form as FormDto | null | undefined;

  const formFields = useMemo<FormFieldDto[]>(() => {
    return (dtoForm?.sections ?? [])
      .flatMap((section) => section.fields ?? [])
      .sort((a, b) => a.index - b.index);
  }, [dtoForm]);

  const fullResponses = useMemo(() => (responses as unknown as ResponseDto[]) || undefined, [responses]);

  const { mutateAsync: updateResponses, isPending: isUpdating } = useUpdateResponses(dtoForm?.id);

  const { mutateAsync: createResponse } = useCreateResponse(dtoForm?.id);

  const responseRows: Row[] = useMemo(() => (rows?.filter((row) => row != null) as Row[]) || [], [rows]);
  const hasUnsavedChanges = useMemo(() => editedRows.size > 0, [editedRows]);

  const toggleEditMode = useCallback((): void => {
    if (isInEditMode && hasUnsavedChanges) {
      setShowCancelDialog(true);
    } else {
      const nextEditMode = !isInEditMode;

      setIsInEditMode(nextEditMode);
      setEditedRows(new Map());
      setLocalRows(nextEditMode ? [...responseRows] : responseRows);

      if (!nextEditMode) {
        setValidationErrors({});
        newRowCounterRef.current = 0;
      }
    }
  }, [isInEditMode, hasUnsavedChanges, responseRows]);

  const confirmCancel = useCallback((): void => {
    setEditedRows(new Map());
    setLocalRows(responseRows);
    setIsInEditMode(false);
    setShowCancelDialog(false);
    setValidationErrors({});
    newRowCounterRef.current = 0;
  }, [responseRows]);

  const closeCancelDialog = useCallback((): void => {
    setShowCancelDialog(false);
  }, []);

  const startCellEdit = useCallback((): void => {
    if (!isInEditMode) {
      setIsInEditMode(true);
      setLocalRows([...responseRows]);
    }
  }, [isInEditMode, responseRows]);

  const handleCellLiveChange = useCallback(<T>(
    rowId: RowId,
    columnName: string,
    value: T,
    isValid?: boolean,
  ): void => {
    try {
      const field = formFields.find(
        (f) => f.displayName === columnName || f.name === columnName || f.id === columnName,
      );
      if (!field) return;

      const fieldExtra = getFieldExtra(field);
      const errorKey = field.displayName;
      const isString = (v: unknown): v is string => typeof v === "string";

      setValidationErrors((prev) => {
        const next = { ...prev };
        const rowErrors = { ...(next[rowId] || {}) };

        delete rowErrors[errorKey];

        if (fieldExtra.validationRegex && value != null && isString(value) && value !== "") {
          const reg = new RegExp(fieldExtra.validationRegex);
          if (!reg.test(value)) {
            rowErrors[errorKey] = `${field.displayName} - ערך לא תקין`;
          }
        }

        if (field.fieldType === fieldType.Number) {
          const valStr = typeof value === "number" || isString(value) ? String(value) : "";

          if (valStr !== "") {
            const parsed =
              fieldExtra.numberType === "integer" ? parseInt(valStr, 10) : parseFloat(valStr);

            if (Number.isNaN(parsed)) {
              rowErrors[errorKey] =
                fieldExtra.numberType === "integer"
                  ? "חובה להזין מספר שלם"
                  : "חובה להזין מספר עשרוני";
            } else {
              if (fieldExtra.minValue !== undefined && parsed < fieldExtra.minValue) {
                rowErrors[errorKey] = `המספר חייב להיות גדול מ- ${fieldExtra.minValue}`;
              }
              if (fieldExtra.maxValue !== undefined && parsed > fieldExtra.maxValue) {
                rowErrors[errorKey] = `המספר חייב להיות קטן מ- ${fieldExtra.maxValue}`;
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
    } catch {
      // ignore
    }
  }, [formFields]);

  const processRowUpdate = useCallback((newRow: GridRowModel, oldRow: GridRowModel): GridRowModel => {
    const newRowId = newRow.id as RowId;

    setLocalRows((prevRows) =>
      prevRows.map((row) =>
        String(row?.id) === String(newRowId) ? ({ ...row, ...newRow } as Row) : row,
      ),
    );

    setEditedRows((prevEditedRows) => new Map(prevEditedRows).set(newRowId, newRow as Row));

    try {
      const rowErrors: Record<string, string> = {};

      formFields.forEach((field) => {
        const fieldExtra = getFieldExtra(field);
        const errorKey = field.displayName;
        const value = (newRow as Record<string, unknown>)[field.displayName];

        if (fieldExtra.validationRegex && value) {
          const reg = new RegExp(fieldExtra.validationRegex);
          if (!reg.test(String(value))) {
            rowErrors[errorKey] = `${field.displayName} - ערך לא תקין`;
          }
        }

        if (field.fieldType === fieldType.Number) {
          const valStr = value === undefined || value === null ? "" : String(value);
          if (valStr !== "") {
            const parsed =
              fieldExtra.numberType === "integer" ? parseInt(valStr, 10) : parseFloat(valStr);

            if (Number.isNaN(parsed)) {
              rowErrors[errorKey] =
                fieldExtra.numberType === "integer"
                  ? "חובה להזין מספר שלם"
                  : "חובה להזין מספר עשרוני";
            } else {
              if (fieldExtra.minValue !== undefined && parsed < fieldExtra.minValue) {
                rowErrors[errorKey] = `המספר חייב להיות גדול מ- ${fieldExtra.minValue}`;
              }
              if (fieldExtra.maxValue !== undefined && parsed > fieldExtra.maxValue) {
                rowErrors[errorKey] = `המספר חייב להיות קטן מ- ${fieldExtra.maxValue}`;
              }
            }
          }
        }
      });

      setValidationErrors((prev) => {
        const next = { ...prev };
        const existingRowErrors = prev[newRowId] || {};
        const merged = { ...existingRowErrors, ...rowErrors };

        if (Object.keys(merged).length === 0) {
          delete next[newRowId];
        } else {
          next[newRowId] = merged;
        }

        return next;
      });
    } catch {
      // ignore validation errors
    }

    return newRow;
  }, [formFields]);

  const buildResponseUpdatePayload = useCallback(async (
    rowId: string,
    editedRow: Partial<Row>,
  ): Promise<UpdateOneResponseDto | null> => {
    const original = (fullResponses as ResponseDto[] | undefined)?.find(
      (response) => String(response?.id) === String(rowId),
    );

    if (!original) {
      return null;
    }

    const updatedFieldValues: ResponseFieldValueDto[] = await Promise.all(
      formFields.map(async (formField) => {
        const existingFieldValue = original.fieldValues?.find(
          (fieldValue) => fieldValue.fieldId === formField.id,
        );

        const hasEditedValue = Object.prototype.hasOwnProperty.call(
          editedRow,
          formField.displayName,
        );

        if (!hasEditedValue) {
          return (
            existingFieldValue || {
              fieldId: formField.id,
              value: null,
            }
          );
        }

        const rawValue = editedRow[formField.displayName];

        if (formField.fieldType === fieldType.File) {
          try {
            const { newFilesToUpload, attachedFiles } = getEditedFileValueParts(rawValue);

            const uploadedFiles =
              newFilesToUpload.length > 0
                ? await uploadFilesToS3({ newFiles: newFilesToUpload }, dtoForm?.id || 0)
                : [];

            const normalizedAttachedFiles = attachedFiles.map(normalizeUploadedFile);
            const combinedFiles = [...uploadedFiles, ...normalizedAttachedFiles];

            return {
              fieldId: formField.id,
              value: combinedFiles.length > 0 ? { files: combinedFiles } : null,
            };
          } catch {
            return {
              fieldId: formField.id,
              value: rawValue ?? existingFieldValue?.value ?? null,
            };
          }
        }

        return {
          fieldId: formField.id,
          value: rawValue ?? null,
        };
      }),
    );

    return {
      responseId: String(rowId),
      fieldValues: updatedFieldValues,
    };
  }, [fullResponses, formFields, dtoForm?.id]);

  const addNewResponse = useCallback((): void => {
    if (!isInEditMode || !dtoForm || formFields.length === 0) return;

    newRowCounterRef.current += 1;
    const tempId = `new_${newRowCounterRef.current}`;

    const now = moment().toISOString();
    const displayName = getAuthDisplayName(user);

    const newRow: Row = {
      id: tempId,
      created: now,
      createdByName: displayName,
      edited: now,
      editedByName: displayName,
    };

    formFields.forEach((field) => {
      if (field.fieldType === fieldType.Link || field.fieldType === fieldType.File) {
        newRow[field.displayName] = null;
      } else {
        newRow[field.displayName] = "";
      }
    });

    setLocalRows((prev) => [newRow, ...prev]);
    setEditedRows((prev) => new Map(prev).set(tempId, newRow));
  }, [isInEditMode, dtoForm, formFields, user]);

  const saveChanges = useCallback(async (): Promise<void> => {
    try {
      const newValidationErrors: Record<RowId, Record<string, string>> = {};

      editedRows.forEach((editedRow, rowId) => {
        try {
          const rowErrs: Record<string, string> = {};

          formFields.forEach((field) => {
            const fieldExtra = getFieldExtra(field);
            const errorKey = field.displayName;
            const value = editedRow[field.displayName];

            if (field.isRequired) {
              const isEmpty =
                value === undefined ||
                value === null ||
                (typeof value === "string" && value.trim() === "") ||
                (Array.isArray(value) && value.length === 0);

              if (isEmpty) {
                rowErrs[errorKey] = "שדה זה הינו חובה";
                return;
              }
            }

            if (fieldExtra.validationRegex && value) {
              const reg = new RegExp(fieldExtra.validationRegex);
              if (!reg.test(String(value))) {
                rowErrs[errorKey] = `${field.displayName} - ערך לא תקין`;
              }
            }

            if (field.fieldType === fieldType.Number) {
              const valStr = value === undefined || value === null ? "" : String(value);
              if (valStr !== "") {
                const parsed =
                  fieldExtra.numberType === "integer" ? parseInt(valStr, 10) : parseFloat(valStr);

                if (Number.isNaN(parsed)) {
                  rowErrs[errorKey] =
                    fieldExtra.numberType === "integer"
                      ? "חובה להזין מספר שלם"
                      : "חובה להזין מספר עשרוני";
                } else {
                  if (fieldExtra.minValue !== undefined && parsed < fieldExtra.minValue) {
                    rowErrs[errorKey] = `המספר חייב להיות גדול מ- ${fieldExtra.minValue}`;
                  }
                  if (fieldExtra.maxValue !== undefined && parsed > fieldExtra.maxValue) {
                    rowErrs[errorKey] = `המספר חייב להיות קטן מ- ${fieldExtra.maxValue}`;
                  }
                }
              }
            }
          });

          if (Object.keys(rowErrs).length > 0) {
            newValidationErrors[rowId] = rowErrs;
          }
        } catch {
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

      if (!dtoForm) {
        throw new FormNotLoadedError();
      }

      const editedEntries = Array.from(editedRows.entries());
      const newRowEntries = editedEntries.filter(([rowId]) => isTempRowId(rowId));
      const existingRowEntries = editedEntries.filter(([rowId]) => !isTempRowId(rowId));

      if (existingRowEntries.length > 0 && !(fullResponses as ResponseDto[] | undefined)?.length) {
        throw new NoResponsesFoundError();
      }

      const updatesToSendResults = await Promise.all(
        existingRowEntries.map(async ([rowId, editedRow]) =>
          buildResponseUpdatePayload(String(rowId), editedRow),
        ),
      );

      const updatesToSend = updatesToSendResults.filter(
        (updatedRow): updatedRow is UpdateOneResponseDto => updatedRow !== null,
      );

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
          const bulkUpdatePayload: BulkUpdateResponsesDto = {
            responses: updatesToSend,
          };
          await updateResponses(bulkUpdatePayload);
        } catch (updateError) {
          console.error("updateResponses failed:", updateError);
          throw updateError;
        }
      }

      const newResponsesPayloads: CreateResponseDto[] = [];

      for (const [, editedRow] of sortedNewRowEntries) {
        const fieldValues: ResponseFieldValueDto[] = await Promise.all(
          formFields.map(async (field) => {
            const rawValue = editedRow[field.displayName];

            if (field.fieldType === fieldType.File) {
              try {
                const { newFilesToUpload, attachedFiles } = getEditedFileValueParts(rawValue);

                const uploadedFiles =
                  newFilesToUpload.length > 0
                    ? await uploadFilesToS3({ newFiles: newFilesToUpload }, dtoForm.id)
                    : [];

                const normalizedAttached = attachedFiles.map(normalizeUploadedFile);
                const allFiles = [...uploadedFiles, ...normalizedAttached];

                return {
                  fieldId: field.id,
                  value: allFiles.length > 0 ? { files: allFiles } : null,
                };
              } catch {
                return {
                  fieldId: field.id,
                  value: null,
                };
              }
            }

            return {
              fieldId: field.id,
              value: rawValue !== undefined && rawValue !== null ? rawValue : "",
            };
          }),
        );

        newResponsesPayloads.push({
          fieldValues,
        });
      }

      if (newResponsesPayloads.length > 0) {
        // Optimistic UI for responsesCount
        if (dtoForm) {
          setForm({
            ...dtoForm,
            responsesCount: (dtoForm.responsesCount ?? 0) + newResponsesPayloads.length,
            lastInteractionAt: moment().toISOString(),
          } as any);
        }

        await createResponse(newResponsesPayloads);
      }

      newRowCounterRef.current = 0;

      const persistedLocalRows = localRows.filter((row) => !isTempRowId(row.id));
      setRows(persistedLocalRows as unknown as Parameters<typeof setRows>[0]);

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
  }, [
    editedRows,
    formFields,
    hasUnsavedChanges,
    dtoForm,
    fullResponses,
    buildResponseUpdatePayload,
    updateResponses,
    createResponse,
    localRows,
    setRows,
    setForm,
  ]);

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
