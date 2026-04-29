import { memo, useCallback, useMemo, useState } from "react";

import BasePopup from "../../BasePopup/BasePopup";
import { createExcelMold } from "../../../utils/utils";
import ExcelImportContent from "../ExcelImportContent";
import { StoreForm } from "../../../pages/ResponsesPage/stores/form.store";
import Loader from "./Loader";
import {
  Chevron,
  EmptyValue,
  ErrorDetailRow,
  ErrorDetailsHeader,
  ErrorDetailsWrapper,
  ErrorGroup,
  ErrorGroupButton,
  ErrorGroupMainText,
  ErrorGroupSubText,
  ErrorGroupTitle,
  ErrorGroupsWrapper,
  ErrorMessageText,
  ErrorSummary,
  PopupContentWrapper,
  RowNumbersText,
  StatusDescription,
  StatusHeader,
  StatusWrapper,
} from "./styled";

export type ExcelImportPopupError = {
  rowNumber?: number;
  fieldName?: string;
  message: string;
};

type GroupedMessageErrors = {
  message: string;
  rowNumbers: number[];
  unknownRowsCount: number;
};

type GroupedFieldErrors = {
  fieldName?: string;
  errors: GroupedMessageErrors[];
  totalErrorsCount: number;
};

export interface ImportFromExcelPopupProps {
  /** The form definition — used to decide whether actions are enabled and to build a template */
  form: StoreForm;

  /** Controls whether the popup is visible. Parent owns open state. */
  isOpen: boolean;

  /** Called when the popup should be closed */
  onClose: () => void;

  /** Optional: ref to a hidden file input controlled by the parent */
  uploadRef?: React.RefObject<HTMLInputElement>;

  /** Called when user requests to import. If not provided, component will fallback to clicking uploadRef. */
  onImport?: () => void;

  /** Called when user requests to download a template. Defaults to createExcelMold(form) */
  onDownloadTemplate?: (form: StoreForm) => void;

  /** Whether the error/status view is currently loading */
  isLoading?: boolean;

  /** File-too-big state to show a specific inline error inside ExcelImportContent */
  showFileTooBig?: boolean;

  /** Validation errors to display after a failed import */
  errors?: ExcelImportPopupError[];

  /** Labels are configurable for i18n/testing */
  mainButtonLabel?: string;
  downloadButtonLabel?: string;
}

function hasFormFields(form?: StoreForm) {
  return Boolean(form?.sections?.some((section) => (section.fields?.length ?? 0) > 0));
}

const DEFAULT_MAIN_LABEL = "ייבוא נתונים";
const DEFAULT_DOWNLOAD_LABEL = "הורדת תבנית";

const getRowsLabel = (group: GroupedMessageErrors): string => {
  const rowNumbers = [...new Set(group.rowNumbers)].sort((a, b) => a - b);
  const rowNumbersText = rowNumbers.length > 0 ? rowNumbers.join(", ") : "";

  if (group.unknownRowsCount > 0 && rowNumbersText) {
    return `${rowNumbersText}, ללא שורה (${group.unknownRowsCount})`;
  }

  if (group.unknownRowsCount > 0) {
    return `ללא שורה (${group.unknownRowsCount})`;
  }

  return rowNumbersText;
};

const getFailedRowsLabel = (count: number): string => {
  if (count === 0) return "ללא שורות";
  if (count === 1) return "בשורה אחת";

  return `ב־${count} שורות`;
};

const groupErrorsByFieldAndMessage = (errors: ExcelImportPopupError[]): GroupedFieldErrors[] => {
  const groupedByField = new Map<
    string,
    {
      fieldName?: string;
      messages: Map<string, GroupedMessageErrors>;
      totalErrorsCount: number;
    }
  >();

  errors.forEach((error) => {
    const fieldKey = error.fieldName?.trim() || "unknown";
    const messageKey = error.message.trim() || "שגיאה לא ידועה";

    const fieldGroup = groupedByField.get(fieldKey) ?? {
      fieldName: error.fieldName,
      messages: new Map<string, GroupedMessageErrors>(),
      totalErrorsCount: 0,
    };

    const messageGroup = fieldGroup.messages.get(messageKey) ?? {
      message: messageKey,
      rowNumbers: [],
      unknownRowsCount: 0,
    };

    if (error.rowNumber === undefined) {
      messageGroup.unknownRowsCount += 1;
    } else {
      messageGroup.rowNumbers.push(error.rowNumber);
    }

    fieldGroup.messages.set(messageKey, messageGroup);
    fieldGroup.totalErrorsCount += 1;
    groupedByField.set(fieldKey, fieldGroup);
  });

  return Array.from(groupedByField.values())
    .map((group) => ({
      fieldName: group.fieldName,
      errors: Array.from(group.messages.values()).sort((a, b) =>
        a.message.localeCompare(b.message, "he"),
      ),
      totalErrorsCount: group.totalErrorsCount,
    }))
    .sort((a, b) => {
      const aName = a.fieldName ?? "";
      const bName = b.fieldName ?? "";

      return aName.localeCompare(bName, "he");
    });
};

const getUniqueFailedRowsCount = (errors: ExcelImportPopupError[]): number => {
  const rowNumbers = errors
    .map((error) => error.rowNumber)
    .filter((rowNumber): rowNumber is number => rowNumber !== undefined);

  return new Set(rowNumbers).size;
};

const ImportFromExcelPopupInner: React.FC<ImportFromExcelPopupProps> = ({
  form,
  isOpen,
  onClose,
  uploadRef,
  onImport,
  onDownloadTemplate,
  isLoading = false,
  showFileTooBig = false,
  errors = [],
  mainButtonLabel = DEFAULT_MAIN_LABEL,
  downloadButtonLabel = DEFAULT_DOWNLOAD_LABEL,
}) => {
  const canPerformActions = hasFormFields(form);
  const [openFields, setOpenFields] = useState<Set<string>>(new Set());

  const groupedErrors = useMemo(() => groupErrorsByFieldAndMessage(errors), [errors]);
  const failedRowsCount = useMemo(() => getUniqueFailedRowsCount(errors), [errors]);

  const hasErrors = errors.length > 0;

  const resetUploadRefValue = useCallback(() => {
    if (!uploadRef) return;

    const ref = uploadRef as React.RefObject<HTMLInputElement>;

    if (ref.current) ref.current.value = "";
  }, [uploadRef]);

  const handleClose = useCallback(() => {
    resetUploadRefValue();
    setOpenFields(new Set());
    onClose();
  }, [onClose, resetUploadRefValue]);

  const triggerUpload = useCallback(() => {
    if (onImport) {
      onImport();
      return;
    }

    if (uploadRef && "current" in uploadRef && uploadRef.current) {
      uploadRef.current.click();
    }
  }, [onImport, uploadRef]);

  const handleDownload = useCallback(() => {
    if (onDownloadTemplate) {
      onDownloadTemplate(form);
      return;
    }

    createExcelMold(form as Parameters<typeof createExcelMold>[0]);
  }, [onDownloadTemplate, form]);

  const toggleField = useCallback((key: string) => {
    setOpenFields((current) => {
      const next = new Set(current);

      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }

      return next;
    });
  }, []);

  const mainButton = {
    text: mainButtonLabel,
    onClick: triggerUpload,
    disabled: !canPerformActions,
  };

  const cancelButton = {
    text: downloadButtonLabel,
    onClick: handleDownload,
    disabled: !canPerformActions,
  };

  const popupContent = isLoading ? (
    <Loader />
  ) : hasErrors ? (
    <StatusWrapper>
      <StatusHeader>
        <StatusDescription>
          לא נוצרו תגובות. פתחו את השדות הרלוונטיים, תקנו את הערכים בקובץ ונסו לייבא שוב.
        </StatusDescription>
      </StatusHeader>

      <ErrorSummary>
        נמצאו {errors.length} שגיאות {getFailedRowsLabel(failedRowsCount)}. הייבוא נעצר כדי למנוע
        יצירת תגובות חלקיות.
      </ErrorSummary>

      <ErrorGroupsWrapper>
        {groupedErrors.map((group) => {
          const fieldKey = group.fieldName?.trim() || "unknown";
          const isOpenGroup = openFields.has(fieldKey);

          return (
            <ErrorGroup key={fieldKey}>
              <ErrorGroupButton type="button" onClick={() => toggleField(fieldKey)}>
                <Chevron $isOpen={isOpenGroup}>›</Chevron>

                <ErrorGroupTitle>
                  <ErrorGroupMainText>{group.fieldName || "שדה לא ידוע"}</ErrorGroupMainText>
                  <ErrorGroupSubText>
                    {group.totalErrorsCount} {group.totalErrorsCount === 1 ? "שגיאה" : "שגיאות"}
                  </ErrorGroupSubText>
                </ErrorGroupTitle>

                <span />
              </ErrorGroupButton>

              {isOpenGroup && (
                <ErrorDetailsWrapper>
                  <ErrorDetailsHeader>
                    <div>הודעת שגיאה</div>
                    <div>שורות</div>
                  </ErrorDetailsHeader>

                  {group.errors.map((errorGroup, index) => (
                    <ErrorDetailRow key={`${fieldKey}-${errorGroup.message}-${index}`}>
                      <ErrorMessageText>{errorGroup.message}</ErrorMessageText>

                      <RowNumbersText>
                        {getRowsLabel(errorGroup) || <EmptyValue>—</EmptyValue>}
                      </RowNumbersText>
                    </ErrorDetailRow>
                  ))}
                </ErrorDetailsWrapper>
              )}
            </ErrorGroup>
          );
        })}
      </ErrorGroupsWrapper>
    </StatusWrapper>
  ) : (
    <ExcelImportContent showErrorFileTooBig={showFileTooBig} />
  );

  return (
    <BasePopup
      open={isOpen}
      onClose={handleClose}
      title="ייבוא נתונים מאקסל"
      minHeight="500px"
      minWidth="700px"
      maxWidth="760px"
      content={<PopupContentWrapper>{popupContent}</PopupContentWrapper>}
      mainButton={mainButton}
      cancelButton={cancelButton}
    />
  );
};

const ImportFromExcelPopup = memo(ImportFromExcelPopupInner);

export default ImportFromExcelPopup;
