import { useState } from "react";
import { getResponseWithFlatFields, useCreateResponse, useUpdateResponse } from "../api";
import { getUserName, showErrorNotification } from "../utils/utils";
import { uploadFilesToS3 } from "../api/filesApi";
import { FieldTypeIds, NotificationTexts, ResponseFieldValue } from "../utils/interfaces";
import moment from "moment";

// Cache to deduplicate create requests during a save operation
const createRequestCache: Map<string, Promise<any>> = new Map();


export const useResponseSave = (form: any, response: any, user: any, parentResponse?: string, copyMode?: boolean) => {
  const { mutateAsync: mutateCreateResponseAsync, isPending: isCreateResponsePending } =
    useCreateResponse();
  const { mutateAsync: mutateUpdateResponseAsync, isPending: isUpdateResponsePending } =
    useUpdateResponse(form?.id, response?.id);

  const saveResponse = async (
    formFieldsByIdMap: Map<string, any>,
    formFieldsValuesMap: Map<string, any>,
  ) => {
    const dataArr: ResponseFieldValue[] = [];
    const deletedFiles: ResponseFieldValue[] = [];

    for (const [key, field] of formFieldsByIdMap) {
      let value = formFieldsValuesMap.get(key) ?? field.value;
      if (field.fieldType === "file") {
        try {
          const uploadResponse = await uploadFilesToS3(value.files, form.id);
          const responsesToCombinedSave = {
            files: [...uploadResponse, ...value.files?.attachedFiles],
          };

          const fieldToSave: ResponseFieldValue = {
            uniqueId: field.uniqueId,
            value: responsesToCombinedSave,
          };
          if (response) {
            // if response exists, it means files can be deleted
            const currentDeletedFiles = response[field.name]?.deletedFiles || [];
            const newDeletedFiles = value?.deletedFiles || [];
            const deletedFilesToSave: ResponseFieldValue = {
              uniqueId: field.uniqueId,
              value: currentDeletedFiles.concat(newDeletedFiles),
            };
            deletedFiles.push(deletedFilesToSave);
          }

          dataArr.push(fieldToSave);
        } catch (error) {
          console.log(error);
        }
        continue; // Skip the rest of the loop for file fields
      }

      // Check if the value is a valid time string for hour fields
      if (field.typeId === FieldTypeIds.time && value) {
        const isValidTimeValue =
          /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/.test(value) ||
          (value instanceof Date && moment(value).isValid());

        if (isValidTimeValue && value instanceof Date) {
          const time = moment(value);
          value = field.showSeconds ? time.format("HH:mm:ss") : time.format("HH:mm");
        }
        // If it's already a string, it's already in the correct format
      }
      const fieldToSave: ResponseFieldValue = {
        uniqueId: field.uniqueId,
        value,
      };
      dataArr.push(fieldToSave);
    }

    const userName = getUserName(user?.firstName, user?.lastName);
    const fieldsNameValueObj = getResponseWithFlatFields(dataArr, form.fields, deletedFiles);

    try {
      // If updating an existing response (and not in copy mode)
      if (response && response.id && !copyMode) {
        // Update existing response (only if not in copy mode)
        const updatedResponse = {
          edited_by: user.upn?.toLowerCase(),
          edited_by_name: userName,
          data: dataArr,
          parentResponse: parentResponse,
          ...fieldsNameValueObj,
        };

        const updated = await mutateUpdateResponseAsync(updatedResponse);
        return updated;
      } else {
        // Create new response
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


        // Deduplicate identical create requests within the same client session/save cycle.
        // Key is based on form id + parentResponse + stable payload (fieldsNameValueObj)
        const createKey = `${form.id}::${parentResponse ?? ""}::${JSON.stringify(fieldsNameValueObj)}`;

        // Use a module-scoped cache to avoid duplicate create calls
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
        } else {

        }

        return await createRequestCache.get(createKey)!;
      }
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