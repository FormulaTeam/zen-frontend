import { getResponseWithFlatFields, useCreateResponse, useUpdateResponse } from "../api";
import { getUserName, showErrorNotification } from "../utils/utils";
import { deleteFilesFromS3 } from "../api/filesApi";
import { FieldTypeIds, NotificationTexts, ResponseFieldValue } from "../utils/interfaces";
import moment from "moment";

type FileMeta = { name: string; url: string };

const safeFiles = (v: any): FileMeta[] => {
  const arr = v?.files;
  if (!Array.isArray(arr)) return [];
  return arr
    .filter((f: any) => f && typeof f.name === "string" && typeof f.url === "string")
    .map((f: any) => ({ name: f.name, url: f.url }));
};

const diffDeleted = (prev: FileMeta[], next: FileMeta[]) => {
  const nextByUrl = new Set(next.map((f) => f.url));
  return prev.filter((f) => !nextByUrl.has(f.url));
};

export const useResponseSave = (form: any, response: any, user: any, parentResponse?: string) => {
  const { mutateAsync: mutateCreateResponseAsync, isPending: isCreateResponsePending } =
    useCreateResponse();
  const { mutateAsync: mutateUpdateResponseAsync, isPending: isUpdateResponsePending } =
    useUpdateResponse(form?.id, response?.id);

  const saveResponse = async (
    formFieldsByIdMap: Map<string, any>,
    formFieldsValuesMap: Map<string, any>,
  ) => {
    const dataArr: ResponseFieldValue[] = [];
    const deletedFilesFlat: ResponseFieldValue[] = [];

    const s3Deletes: string[] = [];

    for (const [key, field] of formFieldsByIdMap) {
      let value = formFieldsValuesMap.get(key) ?? field.value;

      // FILE FIELD
      if (field.typeId === FieldTypeIds.file || field.fieldType === "file") {
        const nextFiles = safeFiles(value);

        const fieldToSave: ResponseFieldValue = {
          uniqueId: field.uniqueId,
          value: { files: nextFiles },
        };
        dataArr.push(fieldToSave);

        if (response && response.id) {
          const prevValue =
            response?.[field.name] ??
            response?.data?.find((rf: any) => String(rf.uniqueId) === String(field.uniqueId))
              ?.value;

          const prevFiles = safeFiles(prevValue);
          const deleted = diffDeleted(prevFiles, nextFiles);

          deleted.forEach((f) => {
            if (f?.name) s3Deletes.push(f.name);
          });

          const currentDeletedFiles = response?.[field.name]?.deletedFiles || [];
          const mergedDeleted = currentDeletedFiles.concat(deleted);

          deletedFilesFlat.push({
            uniqueId: field.uniqueId,
            value: mergedDeleted,
          });
        }

        continue;
      }

      // TIME FIELD normalization
      if (field.typeId === FieldTypeIds.hour && value) {
        const isValidTimeValue =
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value) ||
          (value instanceof Date && moment(value).isValid());

        if (isValidTimeValue && value instanceof Date) {
          const time = moment(value);
          value = field.showSeconds ? time.format("HH:mm:ss") : time.format("HH:mm");
        }
      }

      // DEFAULT
      dataArr.push({
        uniqueId: field.uniqueId,
        value,
      });
    }

    const userName = getUserName(user?.firstName, user?.lastName);
    const fieldsNameValueObj = getResponseWithFlatFields(dataArr, form.fields, deletedFilesFlat);

    try {
      let saved: any;

      if (response && response.id) {
        const editedResponse = {
          id: response.id,
          uniqueId: response.id,
          form_id: response.form_id,
          edited_by: user.upn?.toLowerCase(),
          edited_by_name: userName,
          data: dataArr,
          parentResponse: parentResponse,
          ...fieldsNameValueObj,
        };
        saved = await mutateUpdateResponseAsync(editedResponse);
      } else {
        const newResponse = {
          form_id: form.id,
          created_by_name: userName,
          created_by: user.upn?.toLowerCase(),
          edited_by: user.upn?.toLowerCase(),
          edited_by_name: userName,
          data: dataArr,
          parentResponse: parentResponse,
          ...fieldsNameValueObj,
        };
        saved = await mutateCreateResponseAsync(newResponse);
      }

      if (s3Deletes.length > 0) {
        try {
          await deleteFilesFromS3(s3Deletes);
        } catch (e) {
          console.error("Failed deleting files from S3:", e);
        }
      }

      return saved;
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
