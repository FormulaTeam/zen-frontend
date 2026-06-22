import { useCreateResponse, useUpdateResponses } from "../api";
import { showErrorNotification, getUserName } from "../utils/utils";
import { NotificationTexts } from "../utils/interfaces";
import { toStoredFile, uploadFile, type ResponseFileDto, type StoredFile } from "../api/filesApi";
import moment from "moment";
import {
  BulkUpdateResponsesDto,
  CreateResponseDto,
  FormDto,
  FormFieldDto,
  ResponseDto,
  ResponseFieldValueDto,
} from "../types/shared";
import { fieldType } from "formula-gear";

const createRequestCache: Map<string, Promise<ResponseDto>> = new Map();

type EditorFieldExtra = {
  timePrecision?: "seconds" | "minutes";
};

type SaveField = FormFieldDto & {
  value?: unknown;
  uniqueId?: string;
  typeId?: number | string;
  timePrecision?: "seconds" | "minutes";
};

export type ParentResponseRef = {
  formId: number;
  responseId: string;
};

type ExistingResponseLike = Partial<ResponseDto> & {
  parentResponse?: ParentResponseRef;
};

type CreateResponsePayload = CreateResponseDto & {
  parentResponse?: ParentResponseRef;
};

type FileValueItem = {
  id?: string;
  responseId?: string;
  name?: string;
  path?: string;
  url?: string;
  fileName?: string;
  relativePath?: string;
  file?: File;
  [key: string]: any;
};

type FileFieldUploadDraft = {
  fieldId: string;
  files: File[];
  attachedFiles: StoredFile[];
};

const parseParentResponse = (parentResponse?: string | ParentResponseRef): ParentResponseRef | undefined => {
  if (!parentResponse) return undefined;
  if (typeof parentResponse === "object") return parentResponse;

  const parts = parentResponse.split(";");
  if (parts.length === 2) {
    const [formIdStr, responseId] = parts;
    const formId = parseInt(formIdStr, 10);
    if (!isNaN(formId)) {
      return { formId, responseId };
    }
  }

  return undefined;
};

const getFieldExtra = (field: SaveField): EditorFieldExtra =>
  (field.extra as EditorFieldExtra | undefined) ?? {};

const getFieldId = (field: SaveField, fallbackKey: string): string =>
  field.id ?? field.uniqueId ?? fallbackKey;

const getFieldTypeValue = (field: SaveField): number | string | undefined =>
  field.fieldType ?? field.typeId;

const isFileField = (field: SaveField): boolean =>
  getFieldTypeValue(field) === fieldType.File || getFieldTypeValue(field) === "file";

const isTimeField = (field: SaveField): boolean => getFieldTypeValue(field) === fieldType.Time;

const isFormField = (field: SaveField): boolean =>
  getFieldTypeValue(field) === fieldType.Form || getFieldTypeValue(field) === "form";

const isBrowserFile = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const normalizeStoredFile = (file: FileValueItem): StoredFile | null => {
  const rawName = file.name ?? file.fileName;
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const rawPath = file.path ?? file.id ?? file.relativePath ?? name;
  const path = typeof rawPath === "string" ? rawPath.trim() : "";

  if (!name || !path || isBrowserFile(file.file)) {
    return null;
  }

  return {
    ...file,
    name,
    path,
  };
};

const getFileUploadDraft = (fieldId: string, value: any): FileFieldUploadDraft => {
  if (!Array.isArray(value?.files)) {
    return { fieldId, files: [], attachedFiles: [] };
  }

  const files: File[] = [];
  const attachedFiles: StoredFile[] = [];

  value.files.forEach((file: FileValueItem) => {
    if (isBrowserFile(file?.file)) {
      files.push(file.file);
      return;
    }

    const storedFile = normalizeStoredFile(file);
    if (storedFile) {
      attachedFiles.push(storedFile);
    }
  });

  return { fieldId, files, attachedFiles };
};

const buildFileValue = (files: StoredFile[]): { files: StoredFile[] } => ({
  files,
});

const replaceFieldValue = (
  fieldValues: ResponseFieldValueDto[],
  fieldId: string,
  value: unknown,
): ResponseFieldValueDto[] =>
  fieldValues.map((fieldValue) =>
    fieldValue.fieldId === fieldId ? { ...fieldValue, value } : fieldValue,
  );

const uploadDraftFiles = async (
  formId: number,
  responseId: string,
  drafts: FileFieldUploadDraft[],
): Promise<Map<string, StoredFile[]>> => {
  const uploadedByFieldId = new Map<string, StoredFile[]>();

  for (const draft of drafts) {
    if (draft.files.length === 0) {
      uploadedByFieldId.set(draft.fieldId, draft.attachedFiles);
      continue;
    }

    const uploadedFiles = await Promise.all(
      draft.files.map((file) => uploadFile<ResponseFileDto>(formId, responseId, file)),
    );

    uploadedByFieldId.set(draft.fieldId, [
      ...draft.attachedFiles,
      ...uploadedFiles.map(toStoredFile),
    ]);
  }

  return uploadedByFieldId;
};

const getFileDraftSignature = (drafts: FileFieldUploadDraft[]): string =>
  drafts
    .map((draft) =>
      [
        draft.fieldId,
        ...draft.files.map((file) => `${file.name}:${file.size}:${file.lastModified}`),
      ].join("|"),
    )
    .join("::");

export const useResponseSave = (
  form: FormDto | null,
  response: ExistingResponseLike | null | undefined,
  parentResponse?: ParentResponseRef,
  copyMode?: boolean,
  hiddenFieldIds?: string[],
) => {
  const formId = form?.id;

  const { mutateAsync: mutateCreateResponseAsync, isPending: isCreateResponsePending } =
    useCreateResponse(formId!, hiddenFieldIds);
  const { mutateAsync: mutateUpdateResponsesAsync, isPending: isUpdateResponsePending } =
    useUpdateResponses(formId, hiddenFieldIds);

  const saveResponse = async (
    formFieldsByIdMap: Map<string, SaveField>,
    formFieldsValuesMap: Map<string, any>,
    rawFormFieldsValuesMap?: Map<string, any>,
  ): Promise<ResponseDto> => {
    if (!formId) {
      throw new Error("Form is not loaded");
    }

    const fieldValues: ResponseFieldValueDto[] = [];
    const fileUploadDrafts: FileFieldUploadDraft[] = [];

    for (const [key, field] of formFieldsByIdMap) {
      if (isFormField(field)) {
        continue;
      }

      const fieldId = getFieldId(field, key);
      let value = formFieldsValuesMap.get(key) ?? field.value;

      if (isFileField(field)) {
        value = rawFormFieldsValuesMap?.get(key) ?? value;
        const draft = getFileUploadDraft(fieldId, value);
        fileUploadDrafts.push(draft);

        fieldValues.push({
          fieldId,
          value: buildFileValue(draft.attachedFiles),
        });
        continue;
      }

      if (isTimeField(field) && value) {
        const fieldExtra = getFieldExtra(field);
        const showSeconds = fieldExtra.timePrecision === "seconds";

        const isValidTimeValue =
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(String(value)) ||
          (value instanceof Date && moment(value).isValid());

        if (isValidTimeValue && value instanceof Date) {
          const time = moment(value);
          value = showSeconds ? time.format("HH:mm:ss") : time.format("HH:mm");
        }
      }

      fieldValues.push({
        fieldId,
        value,
      });
    }

    const parsedParentResponse = parseParentResponse(parentResponse);
    try {
      if (response && response.id && !copyMode) {
        let nextFieldValues = fieldValues;

        if (fileUploadDrafts.some((draft) => draft.files.length > 0)) {
          const uploadedByFieldId = await uploadDraftFiles(
            Number(formId),
            response.id,
            fileUploadDrafts,
          );

          uploadedByFieldId.forEach((files, fieldId) => {
            nextFieldValues = replaceFieldValue(nextFieldValues, fieldId, buildFileValue(files));
          });
        }

        const updatedResponsesPayload: BulkUpdateResponsesDto = {
          responses: [
            {
              responseId: response.id,
              fieldValues: nextFieldValues,
            },
          ],
        };

        const updatedResponses = (await mutateUpdateResponsesAsync(
          updatedResponsesPayload,
        )) as ResponseDto[];

        if (!Array.isArray(updatedResponses) || updatedResponses.length === 0) {
          throw new Error("Update response returned no updated responses");
        }

        return updatedResponses[0];
      }

      const newResponse: CreateResponseDto = {
        fieldValues,
        ...(parsedParentResponse ? { parentResponse: parsedParentResponse } : {}),
      };

      if (parentResponse) {
        const results = (await mutateCreateResponseAsync(newResponse)) as ResponseDto[];
        const createdResponse = results[0];

        if (createdResponse?.id && fileUploadDrafts.some((draft) => draft.files.length > 0)) {
          const uploadedByFieldId = await uploadDraftFiles(
            Number(formId),
            createdResponse.id,
            fileUploadDrafts,
          );
          let nextFieldValues = fieldValues;

          uploadedByFieldId.forEach((files, fieldId) => {
            nextFieldValues = replaceFieldValue(nextFieldValues, fieldId, buildFileValue(files));
          });

          const updatedResponses = (await mutateUpdateResponsesAsync({
            responses: [{ responseId: createdResponse.id, fieldValues: nextFieldValues }],
          })) as ResponseDto[];

          return updatedResponses[0] ?? createdResponse;
        }

        return createdResponse;
      }

      const createKey = `${formId}::${JSON.stringify(fieldValues)}::${getFileDraftSignature(fileUploadDrafts)}`;

      if (!createRequestCache.has(createKey)) {
        const requestPromise = (mutateCreateResponseAsync(newResponse) as Promise<ResponseDto[]>)
          .then((res) => {
            createRequestCache.delete(createKey);
            return res[0];
          })
          .catch((err) => {
            createRequestCache.delete(createKey);
            throw err;
          });

        createRequestCache.set(createKey, requestPromise);
      }

      const createdResponse = await createRequestCache.get(createKey)!;

      if (createdResponse?.id && fileUploadDrafts.some((draft) => draft.files.length > 0)) {
        try {
          const uploadedByFieldId = await uploadDraftFiles(
            Number(formId),
            createdResponse.id,
            fileUploadDrafts,
          );
          let nextFieldValues = fieldValues;

          uploadedByFieldId.forEach((files, fieldId) => {
            nextFieldValues = replaceFieldValue(nextFieldValues, fieldId, buildFileValue(files));
          });

          const updatedResponses = (await mutateUpdateResponsesAsync({
            responses: [{ responseId: createdResponse.id, fieldValues: nextFieldValues }],
          })) as ResponseDto[];

          return updatedResponses[0] ?? createdResponse;
        } catch (uploadError) {
          console.error("File upload failed after response creation:", uploadError);
          showErrorNotification("התגובה נוצרה בהצלחה, אך העלאת הקבצים נכשלה. ניתן לנסות להעלותם שוב בעריכת התגובה.");
          return createdResponse;
        }
      }

      return createdResponse;
    } catch (error: any) {
      if (error?.response?.data?.error?.includes("Metro")) {
        showErrorNotification(
          response ? NotificationTexts.UpdateButSyncFaild : NotificationTexts.CreatedButSyncFaild,
        );
      } else {
        showErrorNotification(
          response
            ? NotificationTexts.UpdateResponseFailed
            : NotificationTexts.CreateResponseFailed,
        );
      }

      throw error;
    }
  };

  return {
    saveResponse,
    isSaving: isCreateResponsePending || isUpdateResponsePending,
  };
};
