import { useRef, useState } from "react";
import { useImportResponsesFromFile } from "../../../api";
import ImportFromExcelPopup from "../../../components/ResponseToolbar/Popups/ImportFromExcelPopup";
import { createExcelMold, showErrorNotification, showSuccessNotification } from "../../../utils/utils";
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
  const [isImporting, setIsImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { mutateAsync: importResponses } = useImportResponsesFromFile({
    formId: formId ?? "",
  });

  const resetFileInput = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  const handleClose = () => {
    setShowImportFromExcelPopup(false);
    setValidationErrors([]);
    setShowErrorFileTooBig(false);
    resetFileInput();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setShowErrorFileTooBig(false);
    setValidationErrors([]);

    const file = event.target.files?.[0];
    if (!file) return;

    const maxSize = MAX_PAYLOAD_SIZE_MB * 1024 * 1024;
    if (file.size > maxSize) {
      setShowErrorFileTooBig(true);
      resetFileInput();
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await importResponses(formData);
      showSuccessNotification(
        Array.isArray(res) ? `${res.length} תגובות נוצרו בהצלחה` : "תגובה נוצרה בהצלחה",
      );
      setShowImportFromExcelPopup(false);
    } catch (err: any) {
      const apiValidationErrors = err?.response?.data?.validation_errors;
      if (apiValidationErrors) {
        showErrorNotification("היו שגיאות בייבוא הנתונים");
        const formattedErrors = apiValidationErrors.map(
          (e: any) => `שדה ${e.field_name} שורה ${e.row_number}: ${e.error_message}`,
        );
        setValidationErrors(formattedErrors);
      } else {
        showErrorNotification("יצירת התגובה נכשלה");
      }
    } finally {
      setIsImporting(false);
      resetFileInput();
    }
  };

  return (
    <>
      <input
        type="file"
        id="fileInput"
        ref={uploadRef}
        onChange={handleFileChange}
        hidden
        multiple={false}
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
      />
      <ImportFromExcelPopup
        form={form}
        isOpen={showImportFromExcelPopup}
        onClose={handleClose}
        uploadRef={uploadRef}
        isLoading={isImporting}
        showFileTooBig={showErrorFileTooBig}
        errors={validationErrors}
        onImport={() => uploadRef.current?.click()}
        onDownloadTemplate={createExcelMold}
      />
    </>
  );
};
