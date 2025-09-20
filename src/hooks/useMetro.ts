import { useEffect, useState } from "react";
import {
  editSourceToMetro,
  sendToMetroFormResponses,
  updateMetroLbsInForm,
  upsertSourceToMetro,
} from "../api";
import { showErrorNotification, showSuccessNotification } from "../utils/utils";
import { FieldTypeIds } from "../utils/interfaces";

export const useMetro = ({
  form,
  getResponsesForCurrentPage,
}: {
  form: any;
  getResponsesForCurrentPage: (form: any, arg: any, action: string) => void;
}) => {
  const [showMetroPopup, setShowMetroPopup] = useState(false);
  const [showMetroInputsPopup, setShowMetroInputsPopup] = useState(false);
  const [metroInputsPopupLoading, setMetroInputsPopupLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [sourceKey, setSourceKey] = useState("");
  const [appKey, setAppKey] = useState("");
  const [clusterURL, setClusterURL] = useState("");
  const [theForm, setTheForm] = useState(form);

  useEffect(() => {
    setTheForm(form);
    setAppKey(form?.metro_access_key || "");
    setClusterURL(form?.metro_access_url || "");
    setSourceKey(form?.metro_access_token || "");
  }, [form]);

  const pushToMetro = async () => {
    setShowMetroPopup(true);
    try {
      const ans = await sendToMetroFormResponses(theForm?.id);
      if (Array.isArray(ans?.failedResponsesIds) && ans.failedResponsesIds.length > 0) {
        showErrorNotification(`${ans.failedResponsesIds.length} מהתגובות לא סונכרנו כשורה`);
      }
      if (ans?.responseIds?.length > 0) {
        showSuccessNotification(`${ans.responseIds.length} סונכרנו בהצלחה`);
      }
      getResponsesForCurrentPage(theForm, null, "pushToMetro");
    } catch (error) {
      showErrorNotification("הסנכרון למטרו נכשל");
    } finally {
      setShowMetroPopup(false);
    }
  };

  const syncSourceToMetro = async () => {
    setShowMetroPopup(true);
    try {
      await upsertSourceToMetro(theForm?.id);
      showSuccessNotification("יצירת מקור בוצעה בהצלחה");
    } catch (error) {
      showErrorNotification("סנכרון המקור למטרו נכשל");
    } finally {
      setShowMetroPopup(false);
    }
  };

  const editSource = async () => {
    setShowMetroPopup(true);
    try {
      await editSourceToMetro(theForm?.id);
      showSuccessNotification("עריכת מקור בוצעה בהצלחה");
    } catch (error) {
      showErrorNotification("שגיאה בעת עריכת מקור. אנא פנו לתמיכה.");
    } finally {
      setShowMetroPopup(false);
    }
  };

  const saveMetroData = async () => {
    try {
      setMetroInputsPopupLoading(true);
      const res = await updateMetroLbsInForm(form.id, {
        metro_access_key: appKey,
        metro_access_url: clusterURL,
        metro_access_token: sourceKey,
      });
      setTheForm((prev) => ({
        ...prev,
        metro_access_key: appKey,
        metro_access_url: clusterURL,
        metro_access_token: sourceKey,
      }));
      return res;
    } catch (error) {
      showErrorNotification("עדכון הטופס נכשל");
      return null;
    } finally {
      setMetroInputsPopupLoading(false);
      setShowMetroInputsPopup(false);
    }
  };

  const copySchemaToClipboard = async () => {
    let fieldsStr = "";
    if (theForm.fields && theForm.fields.length > 0) {
      fieldsStr = theForm.fields
        .map(
          (field) => `{
          "name": "${field.name}",
        "type": ${
          field.typeId === FieldTypeIds.number // if field is a number field
            ? '["null", "double", "int"]'
            : '["null", "string"]'
        },
          "path": "${field.name}"
        }`,
        )
        .join(", ");
      fieldsStr = fieldsStr + ",";
    }

    let schemaToCopy = `{
        "type": "record",
        "originalName": "zenform${theForm.id}",
        "name": "zenform${theForm.id}",
        "fields": [
          {
            "name": "form_id",
            "type": "int",
            "path": "form_id"
          },
          {
            "name": "id",
            "type": "int",
            "path": "id"
          },${fieldsStr}
          {
            "name": "created_by",
            "type": ["null", "string"],
            "path": "created_by"
          },
          {
            "name": "edited_by",
            "type": ["null", "string"],
            "path": "edited_by"
          },
          {
            "name": "created",
            "type": ["null", "string"],
            "path": "created"
          },
          {
            "name": "edited",
            "type": ["null", "string"],
            "path": "edited"
          },
          {
            "name": "deleted",
            "type": ["null", "string"],
            "path": "deleted"
          },
          {
            "name": "parentResponse",
            "type": ["null", "string"],
            "path": "parentResponse"
          }
        ]
      }`;
    try {
      await navigator.clipboard.writeText(schemaToCopy);
      setCopied(true);
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  };

  return {
    showMetroPopup,
    setShowMetroPopup,
    showMetroInputsPopup,
    setShowMetroInputsPopup,
    metroInputsPopupLoading,
    sourceKey,
    setSourceKey,
    appKey,
    setAppKey,
    clusterURL,
    setClusterURL,
    theForm,
    pushToMetro,
    syncSourceToMetro,
    editSource,
    saveMetroData,
    copied,
    copySchemaToClipboard,
    setCopied,
  };
};
