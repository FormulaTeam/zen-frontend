import { useState } from "react";
import { showErrorNotification, showSuccessNotification, createExcelMold } from "../utils/utils";
import { useCreateResponsesFromFile } from "../api";

const MAX_PAYLOAD_SIZE_MB = (window as any).RUNTIME_ENV?.REACT_MAX_PAYLOAD_SIZE_MB || 1;

export const useExcel = ({
  form,
  setShouldRefreshPage,
}: {
  form: any;
  setShouldRefreshPage: (val: boolean) => void;
}) => {
  const [showImportFromExcelPopup, setShowImportFromExcelPopup] = useState(false);
  const [showErrorsFromExcelPopup, setShowErrorsFromExcelPopup] = useState(false);
  const [showErrorFileTooBig, setShowErrorFileTooBig] = useState(false);
  const [excelErrorPopupLoading, setExcelErrorPopupLoading] = useState(false);
  const [errorFromExcel, setErrorsFromExcel] = useState<string[]>([]);

  const resetFileInput = () => {
    const fileInput = document.getElementById("fileInput") as HTMLInputElement | null;
    if (fileInput) fileInput.value = "";
  };

  const { mutateAsync: mutateCreateResponsesFromFile } = useCreateResponsesFromFile(form?.id);

  const onChangeFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setShowErrorFileTooBig(false);
    const file = event.target.files?.[0];

    if (file) {
      const maxSize = MAX_PAYLOAD_SIZE_MB * 1024 * 1024;
      if (file.size > maxSize) {
        setShowErrorFileTooBig(true);
        return;
      }

      setShowErrorsFromExcelPopup(true);
      setExcelErrorPopupLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await mutateCreateResponsesFromFile(formData);

        showSuccessNotification(
          Array.isArray(res) ? `${res.length} תגובות נוצרו בהצלחה` : "תגובה נוצרה בהצלחה",
        );
        setShowErrorsFromExcelPopup(false);
        setShowImportFromExcelPopup(false);
        setShouldRefreshPage(true);
        resetFileInput();
      } catch (err: any) {
        const validationErrors = err?.response?.data?.validation_errors;

        if (validationErrors) {
          showErrorNotification("היו שגיאות בייבוא הנתונים");

          const formattedErrors = validationErrors.map(
            (e: any) => `שדה ${e.field_name} שורה ${e.row_number}: ${e.error_message}`,
          );

          setErrorsFromExcel(formattedErrors);
          setShowErrorsFromExcelPopup(true);
        } else {
          showErrorNotification("יצירת התגובה נכשלה");
        }
      } finally {
        setExcelErrorPopupLoading(false);
        resetFileInput();
      }
    }
  };

  const downloadExcelTemplate = () => {
    if (form?.fields?.length > 0) {
      createExcelMold(form);
    }
  };

  return {
    showImportFromExcelPopup,
    setShowImportFromExcelPopup,
    showErrorsFromExcelPopup,
    setShowErrorsFromExcelPopup,
    showErrorFileTooBig,
    setShowErrorFileTooBig,
    excelErrorPopupLoading,
    setExcelErrorPopupLoading,
    errorFromExcel,
    setErrorsFromExcel,
    onChangeFile,
    downloadExcelTemplate,
    createExcelMold,
  };
};
