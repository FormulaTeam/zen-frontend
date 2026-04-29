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
  ErrorMessageBlock,
  ErrorMessageDetail,
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
  detail?: string;
  isGeneral?: boolean;
};

type GroupedMessageErrors = {
  message: string;
  detail?: string;
  rowNumbers: number[];
  unknownRowsCount: number;
};

type GroupedFieldErrors = {
  fieldName?: string;
  errors: GroupedMessageErrors[];
  totalErrorsCount: number;
};

export interface ImportFromExcelPopupProps {
  form: StoreForm;
  isOpen: boolean;
  onClose: () => void;
  uploadRef?: React.RefObject<HTMLInputElement>;
  onImport?: () => void;
  onDownloadTemplate?: (form: StoreForm) => void;
  isLoading?: boolean;
  showFileTooBig?: boolean;
  errors?: ExcelImportPopupError[];
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
    const message = error.message.trim() || "שגיאה לא ידועה";
    const messageKey = `${message}-${error.detail ?? ""}`;

    const fieldGroup = groupedByField.get(fieldKey) ?? {
      fieldName: error.fieldName,
      messages: new Map<string, GroupedMessageErrors>(),
      totalErrorsCount: 0,
    };

    const messageGroup = fieldGroup.messages.get(messageKey) ?? {
      message,
      detail: error.detail,
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

  const generalErrors = useMemo(() => errors.filter((error) => error.isGeneral), [errors]);

  const fieldErrors = useMemo(() => errors.filter((error) => !error.isGeneral), [errors]);

  const groupedErrors = useMemo(() => groupErrorsByFieldAndMessage(fieldErrors), [fieldErrors]);

  const failedRowsCount = useMemo(() => getUniqueFailedRowsCount(fieldErrors), [fieldErrors]);

  const hasGeneralErrors = generalErrors.length > 0;
  const hasFieldErrors = fieldErrors.length > 0;
  const hasErrors = hasGeneralErrors || hasFieldErrors;

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
  ) : hasGeneralErrors ? (
    <StatusWrapper>
      <StatusHeader>
        {generalErrors.map((error, index) => (
          <StatusDescription key={index}>{error.message}</StatusDescription>
        ))}
      </StatusHeader>
    </StatusWrapper>
  ) : hasFieldErrors ? (
    <StatusWrapper>
      <StatusHeader>
        <StatusDescription>
          לא נוצרו תגובות. פתחו את השדות הרלוונטיים, תקנו את הערכים בקובץ ונסו לייבא שוב.
        </StatusDescription>
      </StatusHeader>

      <ErrorSummary>
        נמצאו {fieldErrors.length} שגיאות {getFailedRowsLabel(failedRowsCount)}. הייבוא נעצר כדי
        למנוע יצירת תגובות חלקיות.
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
                      <ErrorMessageBlock>
                        <ErrorMessageText>{errorGroup.message}</ErrorMessageText>
                        {errorGroup.detail && (
                          <ErrorMessageDetail>{errorGroup.detail}</ErrorMessageDetail>
                        )}
                      </ErrorMessageBlock>

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
