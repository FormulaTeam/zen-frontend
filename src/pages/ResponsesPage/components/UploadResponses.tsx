import { useRef, useState } from "react";
import { useParams } from "react-router-dom";

import { useImportResponsesFromFile } from "../../../api";
import ImportFromExcelPopup, {
  ExcelImportPopupError,
} from "../../../components/ResponseToolbar/Popups/ImportFromExcelPopup";
import {
  createExcelMold,
  showErrorNotification,
  showSuccessNotification,
} from "../../../utils/utils";
import { useFormStore } from "../stores/form.store";

const MAX_PAYLOAD_SIZE_MB = (window as any).RUNTIME_ENV?.REACT_MAX_PAYLOAD_SIZE_MB ?? 10;

type ExcelImportRowError = {
  rowNumber?: number;
  fieldName?: string;
  messages: string[];
};

type ExcelImportResult = {
  totalRows: number;
  successfulImports: number;
  errorCount: number;
  createdResponseIds: string[];
  errors: ExcelImportRowError[];
};

type FormulaErrorResponse = {
  code: string;
  message: string;
  meta?: {
    formId?: number;
    errors?: ExcelImportRowError[];
    reason?: string;
  };
};

const formatImportErrors = (errors: ExcelImportRowError[]): ExcelImportPopupError[] => {
  return errors.flatMap((error) =>
    error.messages.map((message) => ({
      rowNumber: error.rowNumber,
      fieldName: error.fieldName,
      message,
    })),
  );
};

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
  const [validationErrors, setValidationErrors] = useState<ExcelImportPopupError[]>([]);

  const { mutateAsync: importResponses } = useImportResponsesFromFile({
    formId: formId ?? "",
  });

  if (!form) return null;

  const resetFileInput = () => {
    if (uploadRef.current) {
      uploadRef.current.value = "";
    }
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
      const res = (await importResponses(formData)) as ExcelImportResult;

      showSuccessNotification(`${res.successfulImports} תגובות נוצרו בהצלחה`);
      setShowImportFromExcelPopup(false);
    } catch (err: unknown) {
      const responseData = (
        err as {
          response?: {
            data?: FormulaErrorResponse;
          };
        }
      ).response?.data;

      const importErrors = responseData?.meta?.errors;

      showErrorNotification("יצירת התגובות נכשלה");

      if (Array.isArray(importErrors)) {
        setValidationErrors(formatImportErrors(importErrors));
      } else if (responseData?.meta?.reason) {
        setValidationErrors([{ message: responseData.meta.reason }]);
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
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
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
