import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { GridRowModel } from "@mui/x-data-grid-pro";
import { showSuccessNotification, showErrorNotification } from "@utils/utils";
import { useUpdateResponses, useCreateResponse, useSoftDeleteResponses } from "@api/responsesApi";
import { toStoredFile, uploadFile, type ResponseFileDto, type StoredFile } from "@api/filesApi";
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
import {
  fieldType,
  validateFormFieldValue,
  type FieldValidationMessage,
  type FormFieldLike,
  getFieldValidationMessage,
  selectionMode,
} from "formula-gear";
import {
  CustomError,
  NoUnsavedChangesError,
  NoResponsesFoundError,
  FormNotLoadedError,
  NoValidChangesError,
  SaveFailedError,
} from "../../../errors";
import moment from "moment";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import {
  getOptionResponseSubmitValue,
  OptionResponseValue,
} from "../../../utils/optionResponseValue";
import { saveQuickEditDraft, clearQuickEditDraft } from "../../FormEditor/utils/draftPersistence";

dayjs.extend(utc);
dayjs.extend(timezone);

const ISRAEL_TZ = "Asia/Jerusalem";

const getCurrentDateDefaultValue = (isDateTime?: boolean): string => {
  const israelNow = dayjs().tz(ISRAEL_TZ);
  const value = isDateTime ? israelNow : israelNow.startOf("day");

  return value.utc().format("YYYY-MM-DD[T]HH:mm:ss.000[Z]");
};

const getCurrentTimeDefaultValue = (includeSeconds?: boolean): string => {
  const format = includeSeconds ? "HH:mm:ss" : "HH:mm";

  return dayjs().tz(ISRAEL_TZ).format(format);
};

type RowId = string | number;

type Row = GridRowModel & {
  id: RowId;
  created?: string;
  createdByName?: string;
  edited?: string;
  editedByName?: string;
  parentResponse?: string | null;
  [key: string]: unknown;
};

export type QuickEditValidationError = {
  message: string;
  detail?: string;
};

type FieldValidationError = {
  messages: FieldValidationMessage[];
  pathMessages: Record<string, FieldValidationMessage[]>;
};

type FileFieldValue = {
  files: StoredFile[];
};

type FileDraftValue = {
  files: {
    newFiles: File[];
    attachedFiles: StoredFile[];
  };
  deletedFiles: StoredFile[];
};

type EditorFieldExtra = {
  validationRegex?: string;
  minValue?: number;
  maxValue?: number;
  numberType?: "integer" | "decimal";
  selectionMode?: "multiple" | "single";
  defaultValue?: unknown;
  dateType?: "datetime" | "date";
  timePrecision?: "seconds" | "minutes";
  options?:
    | string[]
    | {
        items?: OptionResponseValue[];
        defaultValue?: string[];
      };
};

const getFieldExtra = (field: FormFieldDto): EditorFieldExtra =>
  (field.extra as EditorFieldExtra | undefined) ?? {};

const FIELD_COLUMN_PREFIX = "field:";

const getFieldColumnKey = (field: FormFieldDto): string => `${FIELD_COLUMN_PREFIX}${field.id}`;

const getFieldIdFromColumnKey = (columnName: string): string => {
  if (columnName.startsWith(FIELD_COLUMN_PREFIX)) {
    return columnName.slice(FIELD_COLUMN_PREFIX.length);
  }

  return columnName;
};

const isStoredFile = (value: unknown): value is StoredFile => {
  return (
    typeof value === "object" &&
    value !== null &&
    ("name" in value || "fileName" in value) &&
    ("path" in value || "id" in value)
  );
};

const isFileFieldValue = (value: unknown): value is any[] => {
  return Array.isArray(value) && value.every(isStoredFile);
};

const isFileDraftValue = (value: unknown): value is FileDraftValue => {
  if (typeof value !== "object" || value === null || !("files" in value)) {
    return false;
  }

  const typedValue = value as FileDraftValue;

  return (
    typeof typedValue.files === "object" &&
    typedValue.files !== null &&
    Array.isArray(typedValue.files.newFiles) &&
    Array.isArray(typedValue.files.attachedFiles) &&
    typedValue.files.attachedFiles.every(isStoredFile) &&
    Array.isArray(typedValue.deletedFiles) &&
    typedValue.deletedFiles.every(isStoredFile)
  );
};

const toStoredFileFromBrowserFile = (file: File): StoredFile => ({
  name: file.name,
  path: file.name,
});

const getFileDraftParts = (
  value: unknown,
): {
  newFiles: File[];
  attachedFiles: StoredFile[];
} => {
  if (isFileFieldValue(value)) {
    return {
      newFiles: [],
      attachedFiles: value.map((file: any) => ({
        id: file.id,
        responseId: file.responseId,
        name: file.fileName || file.name || "",
        path: file.id || file.path || "",
        fileName: file.fileName || file.name || "",
        mimeType: file.mimeType,
        sizeInBytes: file.sizeInBytes,
        uploadedAt: file.uploadedAt,
      })),
    };
  }

  if (isFileDraftValue(value)) {
    return {
      newFiles: value.files.newFiles,
      attachedFiles: value.files.attachedFiles,
    };
  }

  return {
    newFiles: [],
    attachedFiles: [],
  };
};

const buildFileFieldValue = (value: unknown): string[] | null => {
  const { newFiles, attachedFiles } = getFileDraftParts(value);

  const newStoredFiles = newFiles.map(toStoredFileFromBrowserFile);
  const allFiles = [...attachedFiles, ...newStoredFiles];

  return allFiles.length > 0
    ? (allFiles.map((f) => f.id || f.path).filter(Boolean) as string[])
    : null;
};

const buildPersistedFileFieldValue = async (
  formId: number,
  responseId: string,
  value: unknown,
): Promise<string[] | null> => {
  const { newFiles, attachedFiles } = getFileDraftParts(value);

  if (newFiles.length === 0) {
    return attachedFiles.length > 0
      ? (attachedFiles.map((f) => f.id || f.path).filter(Boolean) as string[])
      : null;
  }

  const uploadedFiles = await Promise.all(
    newFiles.map((file) => uploadFile<ResponseFileDto>(formId, responseId, file)),
  );

  const allFiles = [...attachedFiles, ...uploadedFiles.map(toStoredFile)];

  return allFiles.length > 0
    ? (allFiles.map((f) => f.id || f.path).filter(Boolean) as string[])
    : null;
};

const toValidatorField = (field: FormFieldDto): FormFieldLike => ({
  typeId: field.fieldType as FormFieldLike["typeId"],
  required: field.isRequired,
  extra: field.extra,
});

const toFieldValidationError = (
  issues: readonly { path: readonly PropertyKey[]; message: string }[],
): FieldValidationError => {
  const pathMessages: Record<string, FieldValidationMessage[]> = {};
  const messages = issues.map((issue) => getFieldValidationMessage(issue.message));

  issues.forEach((issue, index) => {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "_root";

    if (!pathMessages[key]) {
      pathMessages[key] = [];
    }

    pathMessages[key].push(messages[index]);
  });

  return {
    messages,
    pathMessages,
  };
};

const toQuickEditValidationError = (
  validationMessage: FieldValidationMessage | undefined,
): QuickEditValidationError | undefined => {
  if (!validationMessage) {
    return undefined;
  }

  const possibleDetail =
    "detail" in validationMessage && typeof validationMessage.detail === "string"
      ? validationMessage.detail
      : undefined;

  return {
    message: validationMessage.message,
    detail: possibleDetail,
  };
};

const getSubmitFieldValue = (field: FormFieldDto, value: unknown): unknown => {
  if (field.fieldType === fieldType.Options) {
    return getOptionResponseSubmitValue(value);
  }

  if (field.fieldType === fieldType.File) {
    return buildFileFieldValue(value);
  }

  return value;
};

const getPersistedSubmitFieldValue = async (
  formId: number,
  responseId: string,
  field: FormFieldDto,
  value: unknown,
): Promise<unknown> => {
  if (field.fieldType === fieldType.File) {
    return buildPersistedFileFieldValue(formId, responseId, value);
  }

  return getSubmitFieldValue(field, value);
};

const getFieldValidationError = (
  field: FormFieldDto,
  value: unknown,
): QuickEditValidationError | undefined => {
  const valueForValidation = getSubmitFieldValue(field, value);
  const result = validateFormFieldValue(toValidatorField(field), valueForValidation);

  if (result.success) {
    return undefined;
  }

  const validationError = toFieldValidationError(result.error.issues);

  const selectedMessage =
    validationError.pathMessages.link?.[0] ??
    validationError.pathMessages.linkTxt?.[0] ??
    validationError.pathMessages.x?.[0] ??
    validationError.pathMessages.y?.[0] ??
    validationError.pathMessages.files?.[0] ??
    validationError.pathMessages._root?.[0] ??
    validationError.messages[0];

  return toQuickEditValidationError(selectedMessage);
};

const isTempRowId = (rowId: RowId): boolean => String(rowId).startsWith("new_");

const isMultipleOptionsField = (field: FormFieldDto): boolean => {
  if (field.fieldType !== fieldType.Options) {
    return false;
  }

  return getFieldExtra(field).selectionMode === selectionMode.Multiple;
};

const getEmptyFieldValue = (field: FormFieldDto): unknown => {
  if (field.fieldType === fieldType.File) {
    return {
      files: [],
    };
  }

  if (
    field.fieldType === fieldType.Link ||
    field.fieldType === fieldType.Date ||
    field.fieldType === fieldType.Time
  ) {
    return null;
  }

  if (field.fieldType === fieldType.Options && isMultipleOptionsField(field)) {
    return [];
  }

  return "";
};

const getDefaultFieldValue = (field: FormFieldDto): unknown => {
  const extra = getFieldExtra(field);

  if (field.fieldType === fieldType.Options) {
    const defaultValue =
      extra.options && typeof extra.options === "object" && !Array.isArray(extra.options)
        ? extra.options.defaultValue
        : undefined;

    if (defaultValue && Array.isArray(defaultValue)) {
      return extra.selectionMode === selectionMode.Multiple ? defaultValue : (defaultValue[0] ?? "");
    }

    return getEmptyFieldValue(field);
  }

  if (field.fieldType === fieldType.Date) {
    if (extra.defaultValue === "currentDate" || extra.defaultValue === "currentDateTime") {
      return getCurrentDateDefaultValue(extra.dateType === "datetime");
    }

    return getEmptyFieldValue(field);
  }

  if (field.fieldType === fieldType.Time) {
    if (extra.defaultValue === "currentTime") {
      return getCurrentTimeDefaultValue(extra.timePrecision === "seconds");
    }

    return getEmptyFieldValue(field);
  }

  if (extra.defaultValue !== undefined) {
    return extra.defaultValue;
  }

  return getEmptyFieldValue(field);
};

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

export const useResponsesEdit = () => {
  const { form, rows, setRows, responses, setForm } = useFormStore();
  const { user } = useAuth();

  const [isInEditMode, setIsInEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editedRows, setEditedRows] = useState<Map<RowId, Row>>(new Map());
  const [localRows, setLocalRows] = useState<Row[]>([]);
  const [deletedRowIds, setDeletedRowIds] = useState<RowId[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<RowId[] | null>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<RowId, Record<string, QuickEditValidationError>>
  >({});

  const newRowCounterRef = useRef(0);

  const dtoForm = form as FormDto | null | undefined;

  const hasUnsavedChanges = useMemo(() => {
    return editedRows.size > 0 || deletedRowIds.length > 0;
  }, [editedRows, deletedRowIds]);

  const formFields = useMemo<FormFieldDto[]>(() => {
    const sectionsFields = (dtoForm?.sections ?? [])
      .flatMap((section) => section.fields ?? [])
      .sort((a, b) => (a.index ?? 0) - (b.index ?? 0));

    if (sectionsFields.length > 0) return sectionsFields;
    return ((dtoForm as any)?.fields ?? []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
  }, [dtoForm]);

  const fullResponses = useMemo(
    () => (responses as unknown as ResponseDto[]) || undefined,
    [responses],
  );

  const { mutateAsync: updateResponses, isPending: isUpdating } = useUpdateResponses(dtoForm?.id);
  const { mutateAsync: createResponse, isPending: isCreating } = useCreateResponse(dtoForm?.id);
  const { mutateAsync: softDeleteResponses } = useSoftDeleteResponses(Number(dtoForm?.id ?? 0));

  const responseRows: Row[] = useMemo(
    () => (rows?.filter((row) => row != null) as Row[]) || [],
    [rows],
  );

  const getMergedRow = useCallback(
    (rowId: RowId, editedRow: Partial<Row>): Row => {
      const baseRow =
        localRows.find((row) => String(row.id) === String(rowId)) ??
        responseRows.find((row) => String(row.id) === String(rowId)) ??
        ({} as Row);

      return {
        ...baseRow,
        ...editedRow,
        id: rowId,
      } as Row;
    },
    [localRows, responseRows],
  );

  const getRowValidationErrors = useCallback(
    (row: Partial<Row>): Record<string, QuickEditValidationError> => {
      const rowErrors: Record<string, QuickEditValidationError> = {};

      formFields.forEach((field) => {
        const fieldKey = getFieldColumnKey(field);
        const value = row[fieldKey];
        const validationError = getFieldValidationError(field, value);

        if (validationError) {
          rowErrors[fieldKey] = validationError;
        }
      });

      return rowErrors;
    },
    [formFields],
  );

  const toggleEditMode = useCallback((): void => {
    if (isInEditMode && hasUnsavedChanges) {
      setShowCancelDialog(true);
      return;
    }

    const nextEditMode = !isInEditMode;

    setIsInEditMode(nextEditMode);
    setEditedRows(new Map());
    setDeletedRowIds([]);
    setLocalRows(nextEditMode ? [...responseRows] : responseRows);

    if (!nextEditMode) {
      setValidationErrors({});
    }
  }, [isInEditMode, hasUnsavedChanges, responseRows]);

  const confirmCancel = useCallback((): void => {
    setEditedRows(new Map());
    setLocalRows(responseRows);
    setDeletedRowIds([]);
    setIsInEditMode(false);
    setShowCancelDialog(false);
    clearQuickEditDraft(dtoForm?.id);
    setValidationErrors({});
  }, [responseRows, dtoForm?.id]);

  const closeCancelDialog = useCallback((): void => {
    setShowCancelDialog(false);
  }, []);

  const startCellEdit = useCallback((): void => {
    if (!isInEditMode) {
      setIsInEditMode(true);
      setLocalRows([...responseRows]);
    }
  }, [isInEditMode, responseRows]);

  const confirmDelete = useCallback(async (): Promise<void> => {
    if (!pendingDeleteIds) return;
    
    const stringIds = pendingDeleteIds.map((id) => String(id));

    if (isInEditMode) {
      const localOnlyIds = stringIds.filter((id) => id.startsWith("new_"));
      const serverIds = stringIds.filter((id) => !id.startsWith("new_"));

      if (localOnlyIds.length > 0) {
        setLocalRows((prev) => prev.filter((row) => !localOnlyIds.includes(String(row.id))));
        setEditedRows((prev) => {
          const next = new Map(prev);
          localOnlyIds.forEach((id) => next.delete(id));
          return next;
        });
      }

      if (serverIds.length > 0) {
        setDeletedRowIds((prev) => [...new Set([...prev, ...serverIds])]);
        setEditedRows((prev) => {
          const next = new Map(prev);
          serverIds.forEach((id) => next.delete(id));
          return next;
        });
      }
      
      setPendingDeleteIds(null);
      return;
    }

    try {
      setForm({
        ...dtoForm,
        responsesCount: Math.max(0, (dtoForm?.responsesCount ?? 0) - stringIds.length),
      } as any);

      await softDeleteResponses({ responsesIds: stringIds });
      showSuccessNotification("מחיקת התגובות בוצעה בהצלחה");
    } catch {
      setForm(dtoForm as any);
      showErrorNotification("מחיקת התגובות נכשלה");
    } finally {
      setPendingDeleteIds(null);
    }
  }, [pendingDeleteIds, isInEditMode, dtoForm, setForm, softDeleteResponses]);

  const cancelDelete = useCallback(() => {
    setPendingDeleteIds(null);
  }, []);

  const handleDeleteResponses = useCallback(
    (ids: RowId[]): void => {
      setPendingDeleteIds(ids);
    },
    [],
  );

  const handleCellLiveChange = useCallback(
    <T>(rowId: RowId, columnName: string, value: T): void => {
      const fieldId = getFieldIdFromColumnKey(columnName);
      const field = formFields.find((candidateField) => String(candidateField.id) === fieldId);

      if (!field) return;

      const fieldKey = getFieldColumnKey(field);

      setLocalRows((prevRows) =>
        prevRows.map((row) =>
          String(row.id) === String(rowId)
            ? ({
                ...row,
                [fieldKey]: value,
              } as Row)
            : row,
        ),
      );

      setEditedRows((prev) => {
        const next = new Map(prev);
        const existing = next.get(rowId) || ({} as Row);

        next.set(rowId, {
          ...existing,
          [fieldKey]: value,
        } as Row);

        return next;
      });
    },
    [formFields],
  );

  const processRowUpdate = useCallback(
    (newRow: GridRowModel): GridRowModel => {
      const rowId = newRow.id as RowId;
      const typedNewRow = newRow as Row;

      const previousRow =
        localRows.find((row) => String(row.id) === String(rowId)) ??
        responseRows.find((row) => String(row.id) === String(rowId));

      const changedFieldKeys = formFields
        .map((field) => getFieldColumnKey(field))
        .filter((fieldKey) => previousRow?.[fieldKey] !== typedNewRow[fieldKey]);

      setLocalRows((prevRows) =>
        prevRows.map((row) =>
          String(row.id) === String(rowId)
            ? ({
                ...row,
                ...typedNewRow,
              } as Row)
            : row,
        ),
      );

      setEditedRows((prev) => {
        const next = new Map(prev);
        const existing = next.get(rowId) || ({} as Row);

        next.set(rowId, {
          ...existing,
          ...typedNewRow,
        } as Row);

        return next;
      });

      setValidationErrors((prev) => {
        const next = { ...prev };
        const rowErrors = { ...(next[rowId] || {}) };

        changedFieldKeys.forEach((fieldKey) => {
          const fieldId = getFieldIdFromColumnKey(fieldKey);
          const field = formFields.find((candidateField) => String(candidateField.id) === fieldId);

          if (!field) return;

          delete rowErrors[fieldKey];

          const validationError = getFieldValidationError(field, typedNewRow[fieldKey]);

          if (validationError) {
            rowErrors[fieldKey] = validationError;
          }
        });

        if (Object.keys(rowErrors).length === 0) {
          delete next[rowId];
        } else {
          next[rowId] = rowErrors;
        }

        return next;
      });

      return newRow;
    },
    [formFields, localRows, responseRows],
  );

  const buildResponseUpdatePayload = useCallback(
    async (rowId: string, editedRow: Partial<Row>): Promise<UpdateOneResponseDto | null> => {
      const original = fullResponses?.find((response) => String(response?.id) === String(rowId));

      if (!original || !dtoForm) {
        return null;
      }

      const rowForSubmit = getMergedRow(rowId, editedRow);

      const updatedFieldValues = await Promise.all(formFields.map(async (formField) => {
        const rawValue = rowForSubmit[getFieldColumnKey(formField)];

        return {
          fieldId: formField.id,
          value: await getPersistedSubmitFieldValue(
            dtoForm.id,
            rowId,
            formField,
            rawValue ?? null,
          ),
        };
      }));

      return {
        responseId: String(rowId),
        fieldValues: updatedFieldValues,
      };
    },
    [fullResponses, formFields, dtoForm, getMergedRow],
  );

  const addNewResponse = useCallback((): void => {
    if (!isInEditMode || !dtoForm || formFields.length === 0) return;

    newRowCounterRef.current += 1;

    const tempId = `new_${newRowCounterRef.current}`;
    const now = moment().toISOString();
    const displayName = getAuthDisplayName(user);

    const newRow: Row = {
      id: tempId,
      index: undefined,
      created: now,
      createdByName: displayName,
      edited: now,
      editedByName: displayName,
    };

    formFields.forEach((field) => {
      newRow[getFieldColumnKey(field)] = getDefaultFieldValue(field);
    });

    setLocalRows((prev) => [newRow, ...prev]);
    setEditedRows((prev) => new Map(prev).set(tempId, newRow));
  }, [isInEditMode, dtoForm, formFields, user]);

  const duplicateResponse = useCallback(
    (rowId: RowId): void => {
      if (!isInEditMode || !dtoForm || formFields.length === 0) return;

      const sourceRow =
        localRows.find((row) => String(row.id) === String(rowId)) ??
        responseRows.find((row) => String(row.id) === String(rowId));

      if (!sourceRow) return;

      newRowCounterRef.current += 1;

      const tempId = `new_${newRowCounterRef.current}`;
      const now = moment().toISOString();
      const displayName = getAuthDisplayName(user);

      const newRow: Row = {
        ...sourceRow,
        id: tempId,
        index: undefined,
        created: now,
        createdByName: displayName,
        edited: now,
        editedByName: displayName,
      };

      setLocalRows((prev) => [newRow, ...prev]);
      setEditedRows((prev) => new Map(prev).set(tempId, newRow));
    },
    [isInEditMode, dtoForm, formFields, user, localRows, responseRows],
  );

  const saveChanges = useCallback(async (): Promise<boolean> => {
    if (isSaving) {
      return false;
    }

    setIsSaving(true);

    try {
      if (!hasUnsavedChanges) {
        throw new NoUnsavedChangesError();
      }

      if (!dtoForm) {
        throw new FormNotLoadedError();
      }

      const editedEntries = Array.from(editedRows.entries());
      const newValidationErrors: Record<RowId, Record<string, QuickEditValidationError>> = {};

      editedEntries.forEach(([rowId, editedRow]) => {
        const rowForValidation = getMergedRow(rowId, editedRow);
        const rowErrors = getRowValidationErrors(rowForValidation);

        if (Object.keys(rowErrors).length > 0) {
          newValidationErrors[rowId] = rowErrors;
        }
      });

      if (Object.keys(newValidationErrors).length > 0) {
        setValidationErrors(newValidationErrors);
        showErrorNotification("יש לתקן את השגיאות לפני השמירה");
        setIsSaving(false);
        return false;
      }

      const newRowEntries = editedEntries.filter(([rowId]) => isTempRowId(rowId));
      const existingRowEntries = editedEntries.filter(([rowId]) => !isTempRowId(rowId));

      if (existingRowEntries.length > 0 && !fullResponses?.length) {
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

      if (
        updatesToSend.length === 0 &&
        sortedNewRowEntries.length === 0 &&
        deletedRowIds.length === 0
      ) {
        throw new NoValidChangesError();
      }

      if (deletedRowIds.length > 0) {
        await softDeleteResponses({ responsesIds: deletedRowIds.map(String) });
      }

      if (updatesToSend.length > 0) {
        const bulkUpdatePayload: BulkUpdateResponsesDto = {
          responses: updatesToSend,
        };

        await updateResponses(bulkUpdatePayload);
      }

      const newResponsesPayloads: CreateResponseDto[] = sortedNewRowEntries.map(
        ([rowId, editedRow]) => {
          const rowForCreate = getMergedRow(rowId, editedRow);

          const fieldValues: ResponseFieldValueDto[] = formFields.map((field) => {
            const rawValue = rowForCreate[getFieldColumnKey(field)];

            return {
              fieldId: field.id,
              value: getSubmitFieldValue(field, rawValue ?? getDefaultFieldValue(field)),
            };
          });

          return {
            fieldValues,
          };
        },
      );

      if (newResponsesPayloads.length > 0) {
        const createdResponses = (await createResponse(newResponsesPayloads)) as ResponseDto[];

        const fileUpdates: Array<UpdateOneResponseDto | null> = await Promise.all(
          sortedNewRowEntries.map(async ([rowId, editedRow], index) => {
            const createdResponse = createdResponses[index];

            if (!createdResponse?.id) {
              return null;
            }

            const rowForCreate = getMergedRow(rowId, editedRow);
            const fieldValues = await Promise.all(
              formFields.map(async (field) => {
                const rawValue = rowForCreate[getFieldColumnKey(field)];

                return {
                  fieldId: field.id,
                  value: await getPersistedSubmitFieldValue(
                    dtoForm.id,
                    createdResponse.id,
                    field,
                    rawValue ?? getDefaultFieldValue(field),
                  ),
                };
              }),
            );

            const hasUploadedFiles = fieldValues.some((fieldValue) => {
              const field = formFields.find((f) => f.id === fieldValue.fieldId);
              return (
                field?.fieldType === fieldType.File &&
                Array.isArray(fieldValue.value) &&
                fieldValue.value.length > 0
              );
            });

            if (!hasUploadedFiles) {
              return null;
            }

            return {
              responseId: createdResponse.id,
              fieldValues,
            };
          }),
        );

        const fileUpdatesToSend = fileUpdates.filter(
          (update): update is UpdateOneResponseDto => update !== null,
        );

        if (fileUpdatesToSend.length > 0) {
          await updateResponses({ responses: fileUpdatesToSend });
        }
      }

      const netCountChange = newResponsesPayloads.length - deletedRowIds.length;

      if (netCountChange !== 0) {
        setForm({
          ...dtoForm,
          responsesCount: Math.max(0, (dtoForm.responsesCount ?? 0) + netCountChange),
          lastInteractionAt: moment().toISOString(),
        } as any);
      }

      const persistedLocalRows = localRows.filter((row) => !isTempRowId(row.id));

      setRows(persistedLocalRows as unknown as Parameters<typeof setRows>[0]);
      setEditedRows(new Map());
      setDeletedRowIds([]);
      setIsInEditMode(false);
      setShowCancelDialog(false);
      clearQuickEditDraft(dtoForm?.id);
      setValidationErrors({});

      showSuccessNotification("כל השינויים נשמרו בהצלחה!");

      setIsSaving(false);
      return true;
    } catch (error) {
      setIsSaving(false);
      if (error instanceof CustomError) {
        if (error instanceof NoUnsavedChangesError) {
          setShowCancelDialog(false);
          showSuccessNotification(error.message);
          return true;
        }

        showErrorNotification(error.message);
        return false;
      }

      console.error("Error saving changes:", error);
      showErrorNotification(new SaveFailedError().message);
      return false;
    }
  }, [
    isSaving,
    editedRows,
    deletedRowIds,
    hasUnsavedChanges,
    dtoForm,
    fullResponses,
    buildResponseUpdatePayload,
    updateResponses,
    createResponse,
    softDeleteResponses,
    localRows,
    setRows,
    setForm,
    getMergedRow,
    getRowValidationErrors,
    formFields,
  ]);

  useEffect(() => {
    if (isInEditMode && hasUnsavedChanges) {
      const timer = setTimeout(() => {
        saveQuickEditDraft(dtoForm?.id, editedRows, localRows, deletedRowIds);
      }, 500);

      return () => clearTimeout(timer);
    } else if (isInEditMode && !hasUnsavedChanges) {
      clearQuickEditDraft(dtoForm?.id);
    }
  }, [isInEditMode, hasUnsavedChanges, editedRows, localRows, deletedRowIds, dtoForm?.id]);

  return {
    isInEditMode,
    setIsInEditMode,
    hasUnsavedChanges,
    editedRowsCount: editedRows.size,
    deletedRowsCount: deletedRowIds.length,
    localRows,
    setLocalRows,
    editedRows,
    setEditedRows,
    deletedRowIds,
    setDeletedRowIds,
    validationErrors,
    handleCellLiveChange,
    handleDeleteResponses,
    isUpdating: isUpdating || isCreating || isSaving,
    showCancelDialog,
    handleToggleEditMode: toggleEditMode,
    handleCellEditStart: startCellEdit,
    handleProcessRowUpdate: processRowUpdate,
    handleSaveChanges: saveChanges,
    handleConfirmCancel: confirmCancel,
    handleCancelDialogClose: closeCancelDialog,
    handleAddNewResponse: addNewResponse,
    handleDuplicateResponse: duplicateResponse,
    pendingDeleteIds,
    confirmDelete,
    cancelDelete,
  };
};
