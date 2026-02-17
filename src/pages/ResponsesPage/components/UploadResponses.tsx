import { useEffect, useRef, useState } from "react";
import { useImportResponsesFromFile } from "../../../api";
import ImportFromExcelPopup from "../../../components/ResponseToolbar/Popups/ImportFromExcelPopup";
import { showErrorNotification, showSuccessNotification } from "../../../utils/utils";
import { useParams } from "react-router-dom";
import { useFormStore } from "../stores/form.store";

const MAX_PAYLOAD_SIZE_MB = (window as any).RUNTIME_ENV?.REACT_MAX_PAYLOAD_SIZE_MB ?? 1;

export const UploadResponses = ({
  showImportFromExcelPopup,
  setShowImportFromExcelPopup,
}: {
  showImportFromExcelPopup: boolean;
  setShowImportFromExcelPopup: (value: boolean) => void;
}) => {
  const { id: formId } = useParams();
  const { form } = useFormStore();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [showErrorFileTooBig, setShowErrorFileTooBig] = useState(false);

  const {
    mutate: importResponses,
    error: importError,
    isPending: importPending,
  } = useImportResponsesFromFile({
    formId: formId ?? "",
  });

  useEffect(() => {
    if (importError) {
      showErrorNotification("יצירת התגובה נכשלה");
    }
  }, [importError]);

  const resetFileInput = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  return (
    <>
      <input
        type="file"
        id="fileInput"
        ref={uploadRef}
        onChange={(event) => {
          event.preventDefault();
          const file = event.target.files?.[0];
          if (file) {
            const maxSize = MAX_PAYLOAD_SIZE_MB * 1024 * 1024;
            if (file.size > maxSize) {
              setShowErrorFileTooBig(true);
              return;
            }
            const formData = new FormData();
            formData.append("file", file);
            importResponses(formData, {
              onSuccess: (res) => {
                showSuccessNotification(
                  Array.isArray(res) ? `${res.length} תגובות נוצרו בהצלחה` : "תגובה נוצרה בהצלחה",
                );
                setShowImportFromExcelPopup(false);
                resetFileInput();
              },
              onError: (error) => {
                showErrorNotification(`יצירת התגובה נכשלה: ${error.message}`);
              },
            });
          }
        }}
        hidden
        multiple={false}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />

      <ImportFromExcelPopup
        form={form}
        isOpen={showImportFromExcelPopup}
        onClose={() => {
          setShowImportFromExcelPopup(false);
          resetFileInput();
        }}
        uploadRef={uploadRef}
        isLoading={importPending}
        showFileTooBig={showErrorFileTooBig}
        onImport={() => {
          if (uploadRef && uploadRef.current) {
            uploadRef.current.click();
          }
        }}
      />
    </>
  );
};
