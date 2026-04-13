import { useCreateResponse, useUpdateResponse } from "../api";
import { getUserName, showErrorNotification } from "../utils/utils";
import { uploadFilesToS3 } from "../api/filesApi";
import { NotificationTexts } from "../utils/interfaces";
import moment from "moment";
import {
  CreateResponseDto,
  FormDto,
  FormFieldDto,
  ResponseDto,
  ResponseFieldValueDto,
} from "../types/shared";
import { fieldType } from "formula-gear";

// Cache to deduplicate create requests during a save operation
const createRequestCache: Map<string, Promise<any>> = new Map();

type EditorFieldExtra = {
  showSeconds?: boolean;
};

type SaveField = FormFieldDto & {
  value?: unknown;
  uniqueId?: string;
  typeId?: number | string;
  showSeconds?: boolean;
};

type ExistingResponseLike = Partial<ResponseDto> & {
  parentResponse?: string;
};

type CreateResponsePayload = CreateResponseDto & {
  parentResponse?: { formId: number; responseId: string };
};

type UpdateResponsePayload = Partial<ResponseDto> & {
  parentResponse?: { formId: number; responseId: string };
};

const parseParentResponse = (parentResponse?: string) => {
  if (!parentResponse) return undefined;

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

export const useResponseSave = (
  form: FormDto | null,
  response: ExistingResponseLike | null | undefined,
  user: any,
  parentResponse?: string,
  copyMode?: boolean,
) => {
  const formId = form?.id;

  const { mutateAsync: mutateCreateResponseAsync, isPending: isCreateResponsePending } =
    useCreateResponse();
  const { mutateAsync: mutateUpdateResponseAsync, isPending: isUpdateResponsePending } =
    useUpdateResponse(formId, response?.id);

  const saveResponse = async (
    formFieldsByIdMap: Map<string, SaveField>,
    formFieldsValuesMap: Map<string, any>,
  ) => {
    if (!formId) {
      throw new Error("Form is not loaded");
    }

    const fieldValues: ResponseFieldValueDto[] = [];

    for (const [key, field] of formFieldsByIdMap) {
      const fieldId = getFieldId(field, key);
      let value = formFieldsValuesMap.get(key) ?? field.value;

      if (isFileField(field)) {
        try {
          const filesValue = value ?? {};
          const newFiles = filesValue?.files?.newFiles ?? [];
          const attachedFiles = filesValue?.files?.attachedFiles ?? [];

          const uploadResponse =
            newFiles.length > 0 ? await uploadFilesToS3({ newFiles }, formId) : [];

          value = {
            files: [...uploadResponse, ...attachedFiles],
          };
        } catch (error) {
          console.log(error);
        }

        fieldValues.push({
          fieldId,
          value,
        });
        continue;
      }

      if (isTimeField(field) && value) {
        const fieldExtra = getFieldExtra(field);
        const showSeconds = fieldExtra.showSeconds ?? field.showSeconds ?? false;

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

    const userName = getUserName(user?.firstName, user?.lastName) || user?.name || "";
    const normalizedUpn = user?.upn?.toLowerCase?.() ?? user?.upn ?? "unknown";

    const parsedParentResponse = parseParentResponse(parentResponse);

    try {
      if (response && response.id && !copyMode) {
        const { parentResponse: _, ...restResponse } = response;
        const updatedResponse: UpdateResponsePayload = {
          ...restResponse,
          updatedBy: response.updatedBy,
          fieldValues,
          ...(parsedParentResponse ? { parentResponse: parsedParentResponse } : {}),
        };

        const updated = await mutateUpdateResponseAsync(updatedResponse as any);
        return updated;
      }

      const newResponse: CreateResponsePayload = {
        fieldValues,
        ...(parsedParentResponse ? { parentResponse: parsedParentResponse } : {}),
      };

      const createKey = `${formId}::${parentResponse ?? ""}::${JSON.stringify(fieldValues)}`;

      if (!createRequestCache.has(createKey)) {
        const p = mutateCreateResponseAsync(newResponse)
          .then((res) => {
            createRequestCache.delete(createKey);
            return res;
          })
          .catch((err) => {
            createRequestCache.delete(createKey);
            throw err;
          });

        createRequestCache.set(createKey, p);
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
