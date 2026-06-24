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
import confetti from "canvas-confetti";

const MAX_PAYLOAD_SIZE_MB = (window as any).RUNTIME_ENV?.REACT_MAX_PAYLOAD_SIZE_MB ?? 10;

const LUCKY_IMPORT_FILE_NAME = "שיהיהלנומהזהאחלהיום.xlsx";

const LUCKY_IMPORT_MIN_LOADING_MS = 6500;

const waitForLuckyLoading = async (isLuckyFile: boolean, startedAt: number): Promise<void> => {
  if (!isLuckyFile) return;

  const elapsed = Date.now() - startedAt;
  const remaining = LUCKY_IMPORT_MIN_LOADING_MS - elapsed;

  if (remaining > 0) {
    await new Promise((resolve) => window.setTimeout(resolve, remaining));
  }
};

const fireLuckyConfetti = () => {
  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 34,
    origin: { x: 0.5, y: 0.55 },
    zIndex: 9999,
  });

  confetti({
    particleCount: 35,
    angle: 60,
    spread: 55,
    startVelocity: 28,
    origin: { x: 0, y: 0.72 },
    zIndex: 9999,
  });

  confetti({
    particleCount: 35,
    angle: 120,
    spread: 55,
    startVelocity: 28,
    origin: { x: 1, y: 0.72 },
    zIndex: 9999,
  });
};

const playLuckyTing = () => {
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;

  if (!AudioContextClass) return;

  const audioContext = new AudioContextClass();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = "sine";
  oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
  oscillator.frequency.exponentialRampToValueAtTime(1320, audioContext.currentTime + 0.08);

  gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.18, audioContext.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.32);

  oscillator.connect(gain);
  gain.connect(audioContext.destination);

  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.34);

  window.setTimeout(() => {
    audioContext.close().catch(() => undefined);
  }, 500);
};

const celebrateLuckyImport = () => {
  fireLuckyConfetti();
  playLuckyTing();
};

const normalizeFileName = (fileName: string): string =>
  fileName.trim().normalize("NFC").toLowerCase();

const isLuckyImportFile = (file: File): boolean =>
  normalizeFileName(file.name) === normalizeFileName(LUCKY_IMPORT_FILE_NAME);

type FieldValidationMessage = {
  code: string;
  message: string;
  detail: string;
};

type ExcelImportRowError = {
  rowNumber?: number;
  fieldName?: string;
  messages: FieldValidationMessage[];
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
      message: message.message,
      detail: message.detail,
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
  const { formId } = useParams();
  const { form } = useFormStore();
  const uploadRef = useRef<HTMLInputElement>(null);
  const [showErrorFileTooBig, setShowErrorFileTooBig] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ExcelImportPopupError[]>([]);
  const [isLuckyImport, setIsLuckyImport] = useState(false);

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
    setIsLuckyImport(false);
    resetFileInput();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    setShowErrorFileTooBig(false);
    setValidationErrors([]);
    setIsLuckyImport(false);

    const file = event.target.files?.[0];
    if (!file) return;

    const isLuckyFile = isLuckyImportFile(file);
    setIsLuckyImport(isLuckyFile);

    const maxSize = MAX_PAYLOAD_SIZE_MB * 1024 * 1024;

    if (file.size > maxSize) {
      setShowErrorFileTooBig(true);
      resetFileInput();
      return;
    }

    setIsImporting(true);

    const importStartedAt = Date.now();

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = (await importResponses(formData)) as ExcelImportResult;

      await waitForLuckyLoading(isLuckyFile, importStartedAt);

      if (isLuckyFile) {
        celebrateLuckyImport();
      }

      showSuccessNotification(
        isLuckyFile
          ? "הייבוא הצליח. זה מה זה אחלה יום 🎉"
          : `${res.successfulImports} תגובות נוצרו בהצלחה`,
      );

      setShowImportFromExcelPopup(false);
      setIsLuckyImport(false);
    } catch (err: unknown) {
      const responseData = (
        err as {
          response?: {
            data?: FormulaErrorResponse;
          };
        }
      ).response?.data;

      const importErrors = responseData?.meta?.errors;

      await waitForLuckyLoading(isLuckyFile, importStartedAt);

      showErrorNotification(
        isLuckyFile ? "וואלה היה מה זה גרוע, אבל אנחנו לא מוותרים 💪" : "יצירת התגובות נכשלה",
      );

      if (Array.isArray(importErrors)) {
        setValidationErrors(formatImportErrors(importErrors));
      } else if (responseData?.meta?.reason) {
        setValidationErrors([
          {
            message: responseData.meta.reason,
            isGeneral: true,
          },
        ]);
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
        isLuckyImport={isLuckyImport}
        mainButtonLabel={isLuckyImport ? "מה זה תנסה שוב" : undefined}
      />
    </>
  );
};
