import { useCreateResponse, useUpdateResponses } from "../api";
import { showErrorNotification } from "../utils/utils";
import { NotificationTexts } from "../utils/interfaces";
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
  showSeconds?: boolean;
  includeSeconds?: boolean;
};

type SaveField = FormFieldDto & {
  value?: unknown;
  uniqueId?: string;
  typeId?: number | string;
  showSeconds?: boolean;
  includeSeconds?: boolean;
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
  name?: string;
  path?: string;
  url?: string;
  fileName?: string;
  relativePath?: string;
  [key: string]: any;
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

const normalizeFileValue = (value: any): { files: FileValueItem[] } => {
  if (!Array.isArray(value?.files)) {
    return { files: [] };
  }

  return {
    files: value.files.filter(
      (file: FileValueItem) =>
        file &&
        typeof file.name === "string" &&
        file.name.trim().length > 0 &&
        typeof file.path === "string" &&
        file.path.trim().length > 0,
    ),
  };
};

export const useResponseSave = (
  form: FormDto | null,
  response: ExistingResponseLike | null | undefined,
  user: any,
  parentResponse?: ParentResponseRef,
  copyMode?: boolean,
) => {
  const formId = form?.id;

  const { mutateAsync: mutateCreateResponseAsync, isPending: isCreateResponsePending } =
    useCreateResponse(formId!);
  const { mutateAsync: mutateUpdateResponsesAsync, isPending: isUpdateResponsePending } =
    useUpdateResponses(formId);

  const saveResponse = async (
    formFieldsByIdMap: Map<string, SaveField>,
    formFieldsValuesMap: Map<string, any>,
  ): Promise<ResponseDto> => {
    if (!formId) {
      throw new Error("Form is not loaded");
    }

    const fieldValues: ResponseFieldValueDto[] = [];

    for (const [key, field] of formFieldsByIdMap) {
      if (isFormField(field)) {
        continue;
      }

      const fieldId = getFieldId(field, key);
      let value = formFieldsValuesMap.get(key) ?? field.value;

      if (isFileField(field)) {
        fieldValues.push({
          fieldId,
          value: normalizeFileValue(value),
        });
        continue;
      }

      if (isTimeField(field) && value) {
        const fieldExtra = getFieldExtra(field);
        const showSeconds =
          fieldExtra.includeSeconds ??
          field.includeSeconds ??
          fieldExtra.showSeconds ??
          field.showSeconds ??
          false;

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

    try {
      if (response && response.id && !copyMode) {
        const updatedResponsesPayload: BulkUpdateResponsesDto = {
          responses: [
            {
              responseId: response.id,
              fieldValues,
            },
          ],
        };

        const updatedResponses = (await mutateUpdateResponsesAsync(
          updatedResponsesPayload,
        )) as ResponseDto[];

        return updatedResponses[0];
      }

      const newResponse: CreateResponsePayload = {
        fieldValues,
        ...(parentResponse ? { parentResponse } : {}),      };

      if (parentResponse) {
        return (await mutateCreateResponseAsync(newResponse)) as ResponseDto;
      }

      const createKey = `${formId}::${JSON.stringify(fieldValues)}`;

      if (!createRequestCache.has(createKey)) {
        const requestPromise = (mutateCreateResponseAsync(newResponse) as Promise<ResponseDto>)
          .then((res) => {
            createRequestCache.delete(createKey);
            return res;
          })
          .catch((err) => {
            createRequestCache.delete(createKey);
            throw err;
          });

        createRequestCache.set(createKey, requestPromise);
      }

      return await createRequestCache.get(createKey)!;
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
