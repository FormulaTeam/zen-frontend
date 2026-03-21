import { memo, useCallback } from "react";
import styled from "styled-components";

import BasePopup from "../../BasePopup/BasePopup";
import { createExcelMold } from "../../../utils/utils";
import ExcelImportContent from "../ExcelImportContent";
import { StoreForm } from "../../../pages/ResponsesPage/stores/form.store";
import { ErrorItem, ErrorList, StatusTitle, StatusWrapper } from "./styled";
import Loader from "./Loader";

const PopupContentWrapper = styled.div`
  min-height: 350px;
  height: 350px;
  width: 100%;
  max-width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow-y: auto;
`;

/**
 * Props for the ImportFromExcelPopup component.
 *
 * Notes on design choices (extracted props):
 * - `isOpen` and `onClose` are handled by the parent — popup visibility should be controlled externally.
 * - `onImport` and `onDownloadTemplate` are callbacks extracted so the parent can decide how imports and template downloads are handled (e.g. analytics, validation, different templates).
 * - `uploadRef` is accepted as a RefObject so the parent can own the file input and control lifecycle / cleanup.
 * - `errors` is an array of error messages/objects passed by the parent so the popup only concerns itself with rendering.
 */
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

  /** Validation error messages to display after a failed import */
  errors?: string[];

  /** Labels are configurable for i18n/testing */
  mainButtonLabel?: string;
  downloadButtonLabel?: string;
}

function hasFormFields(form?: StoreForm) {
  return Boolean(form?.sections?.some((section) => (section.fields?.length ?? 0) > 0));
}

const DEFAULT_MAIN_LABEL = "ייבוא נתונים";
const DEFAULT_DOWNLOAD_LABEL = "הורדת תבנית";

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

  const resetUploadRefValue = useCallback(() => {
    if (!uploadRef) return;

    const ref = uploadRef as React.RefObject<HTMLInputElement>;

    if (ref.current) ref.current.value = "";
  }, [uploadRef]);

  const handleClose = useCallback(() => {
    resetUploadRefValue();
    onClose();
  }, [onClose, resetUploadRefValue]);

  const triggerUpload = useCallback(() => {
    if (onImport) {
      onImport();

      return;
    }

    if (uploadRef && "current" in uploadRef && uploadRef.current) uploadRef.current.click();
  }, [onImport, uploadRef]);

  const handleDownload = useCallback(() => {
    if (onDownloadTemplate) {
      onDownloadTemplate(form);

      return;
    }

    createExcelMold(form as Parameters<typeof createExcelMold>[0]);
  }, [onDownloadTemplate, form]);

  const hasErrors = errors.length > 0;
  const isPostImportState = isLoading || hasErrors;

  const mainButton = isPostImportState
    ? { text: mainButtonLabel, onClick: () => {}, disabled: true }
    : { text: mainButtonLabel, onClick: triggerUpload, disabled: !canPerformActions };

  const cancelButton = isPostImportState
    ? { text: downloadButtonLabel, onClick: () => {}, disabled: true }
    : { text: downloadButtonLabel, onClick: handleDownload, disabled: !canPerformActions };

  const popupContent = isLoading ? (
    <Loader />
  ) : hasErrors ? (
    <StatusWrapper style={{ width: "100%" }}>
      <StatusTitle>סטטוס ייבוא נתונים</StatusTitle>
      <ErrorList>
        {errors.map((errorMessage, index) => (
          <ErrorItem key={index}>{errorMessage}</ErrorItem>
        ))}
      </ErrorList>
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
      minWidth="600px"
      maxWidth="600px"
      content={<PopupContentWrapper>{popupContent}</PopupContentWrapper>}
      mainButton={mainButton}
      cancelButton={cancelButton}
    />
  );
};

const ImportFromExcelPopup = memo(ImportFromExcelPopupInner);

export default ImportFromExcelPopup;
