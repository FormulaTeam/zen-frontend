// import React, { forwardRef } from "react";
// import BasePopup from "../../BasePopup/BasePopup";
// import ExcelImportContent from "../ExcelImportContent";
// import Loader from "./Loader";
// import { ErrorItem, ErrorList, StatusTitle, StatusWrapper } from "./styled";
// import styled from "styled-components";
// import { createExcelMold } from "../../../utils/utils";
// import { Form } from "../../../utils/interfaces";

// const PopupContentWrapper = styled.div`
//   min-height: 350px;
//   height: 350px;
//   width: 100%;
//   max-width: 100%;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   overflow-y: auto;
// `;

// interface ImportFromExcelPopupProps {
//   form: Form;
//   setShouldRefreshPage: (value: boolean) => void;
//   setShowImportFromExcelPopup: (value: boolean) => void;
//   showErrorsFromExcelPopup: boolean;
//   setShowErrorsFromExcelPopup: (value: boolean) => void;
//   showErrorFileTooBig: boolean;
//   excelErrorPopupLoading: boolean;
// }

// const ImportFromExcelPopup = forwardRef<HTMLInputElement, ImportFromExcelPopupProps>(
//   (
//     {
//       setShowImportFromExcelPopup,
//       showErrorsFromExcelPopup,
//       setShowErrorsFromExcelPopup,
//       showErrorFileTooBig,
//       excelErrorPopupLoading,
//       form,
//     },
//     uploadRef,
//   ) => {
//     const handleCloseImportPopup = () => {
//       if (uploadRef && typeof uploadRef !== "function" && uploadRef.current) {
//         uploadRef.current.value = "";
//       }
//       setShowErrorsFromExcelPopup(false);
//       setShowImportFromExcelPopup(false);
//     };

//     return (
//       <BasePopup
//         open
//         onClose={handleCloseImportPopup}
//         title="ייבוא נתונים מאקסל"
//         minHeight="500px"
//         minWidth="600px"
//         maxWidth="600px"
//         content={
//           <PopupContentWrapper>
//             {showErrorsFromExcelPopup ? (
//               excelErrorPopupLoading ? (
//                 <Loader />
//               ) : (
//                 <StatusWrapper style={{ width: "100%" }}>
//                   <StatusTitle>סטטוס ייבוא נתונים</StatusTitle>

//                 </StatusWrapper>
//               )
//             ) : (
//               <ExcelImportContent showErrorFileTooBig={showErrorFileTooBig} />
//             )}
//           </PopupContentWrapper>
//         }
//         mainButton={
//           showErrorsFromExcelPopup || excelErrorPopupLoading
//             ? {
//                 text: "ייבוא נתונים",
//                 onClick: () => {},
//                 disabled: true,
//               }
//             : {
//                 text: "ייבוא נתונים",
//                 onClick: () => {
//                   if (
//                     uploadRef &&
//                     typeof uploadRef !== "function" &&
//                     "current" in uploadRef &&
//                     uploadRef.current
//                   ) {
//                     uploadRef.current.click();
//                   }
//                 },
//                 disabled: !(form?.fields?.length > 0),
//               }
//         }
//         cancelButton={
//           showErrorsFromExcelPopup || excelErrorPopupLoading
//             ? {
//                 text: "הורדת תבנית",
//                 onClick: () => {},
//                 disabled: true,
//               }
//             : {
//                 text: "הורדת תבנית",
//                 onClick: () => createExcelMold(form),
//                 disabled: !(form?.fields?.length > 0),
//               }
//         }
//       />
//     );
//   },
// );

// export default ImportFromExcelPopup;
import { memo, useCallback } from "react";
import styled from "styled-components";
import { Form } from "../../../utils/interfaces";
import { createExcelMold } from "../../../utils/utils";
import BasePopup from "../../BasePopup/BasePopup";
import ExcelImportContent from "../ExcelImportContent";
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
  form: Form;

  /** Controls whether the popup is visible. Parent owns open state. */
  isOpen: boolean;

  /** Called when the popup should be closed */
  onClose: () => void;

  /** Optional: ref to a hidden file input controlled by the parent */
  uploadRef?: React.RefObject<HTMLInputElement>;

  /** Called when user requests to import. If not provided, component will fallback to clicking uploadRef. */
  onImport?: () => void;

  /** Called when user requests to download a template. Defaults to createExcelMold(form) */
  onDownloadTemplate?: (form: Form) => void;

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

function hasFormFields(form?: Form) {
  return Boolean(form?.fields && form.fields.length > 0);
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
    // Prefer parent-controlled cleanup, but try to help by clearing any file input value.
    resetUploadRefValue();
    onClose();
  }, [onClose, resetUploadRefValue]);

  const triggerUpload = useCallback(() => {
    // If parent provided an onImport callback, call it. Otherwise attempt to open the native file input.
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
    } else {
      createExcelMold(form);
    }
  }, [onDownloadTemplate, form]);

  // Decide what the base popup buttons should be — keep the same UX as the original but use props
  const hasErrors = errors.length > 0;
  const isPostImportState = isLoading || hasErrors;

  const mainButton = isPostImportState
    ? { text: mainButtonLabel, onClick: () => { }, disabled: true }
    : { text: mainButtonLabel, onClick: triggerUpload, disabled: !canPerformActions };

  const cancelButton = isPostImportState
    ? { text: downloadButtonLabel, onClick: () => { }, disabled: true }
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
      content={
        <PopupContentWrapper>
          {popupContent}
        </PopupContentWrapper>
      }
      mainButton={mainButton}
      cancelButton={cancelButton}
    />
  );
};

/**
 * Export a memoized component so parent re-renders are cheap.
 * The component is intentionally NOT a forwardRef — the parent should own the file input ref and pass it via `uploadRef`.
 */
const ImportFromExcelPopup = memo(ImportFromExcelPopupInner);

export default ImportFromExcelPopup;
