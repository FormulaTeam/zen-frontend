import React, { forwardRef } from "react";
import BasePopup from "../../BasePopup/BasePopup";
import ExcelImportContent from "../ExcelImportContent";
import Loader from "./Loader";
import {
  ErrorItem,
  ErrorList,
  StatusTitle,
  StatusWrapper,
} from "./styled";
import styled from "styled-components";

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

interface ImportFromExcelPopupProps {
  form: any;
  setShouldRefreshPage: (value: boolean) => void;
  setShowImportFromExcelPopup: (value: boolean) => void;
  showErrorsFromExcelPopup: boolean;
  setShowErrorsFromExcelPopup: (value: boolean) => void;
  showErrorFileTooBig: boolean;
  excelErrorPopupLoading: boolean;
  setExcelErrorPopupLoading: (value: boolean) => void;
  errorFromExcel: string[];
  setErrorsFromExcel: (errors: string[]) => void;
  createExcelMold: (form: any) => void;
}

const ImportFromExcelPopup = forwardRef<HTMLInputElement, ImportFromExcelPopupProps>(
  (
    {
      setShowImportFromExcelPopup,
      showErrorsFromExcelPopup,
      setShowErrorsFromExcelPopup,
      showErrorFileTooBig,
      excelErrorPopupLoading,
      setExcelErrorPopupLoading,
      errorFromExcel,
      setErrorsFromExcel,
      createExcelMold,
      form,
    },
    uploadRef,
  ) => {
    const handleCloseImportPopup = () => {
      if (uploadRef && typeof uploadRef !== "function" && uploadRef.current) {
        uploadRef.current.value = "";
      }
      setErrorsFromExcel([]);
      setExcelErrorPopupLoading(false);
      setShowErrorsFromExcelPopup(false);
      setShowImportFromExcelPopup(false);
    };

    return (
      <BasePopup
        open
        onClose={handleCloseImportPopup}
        title="ייבוא נתונים מאקסל"
        minHeight="500px"
        minWidth="600px"
        maxWidth="600px"
        content={
          <PopupContentWrapper>
            {showErrorsFromExcelPopup ? (
              excelErrorPopupLoading ? (
                <Loader />
              ) : (
                <StatusWrapper style={{ width: "100%" }}>
                  <StatusTitle>סטטוס ייבוא נתונים</StatusTitle>
                  <ErrorList>
                    {errorFromExcel.map((e, index) => (
                      <ErrorItem key={"excel_error_" + index}>{e}</ErrorItem>
                    ))}
                  </ErrorList>
                </StatusWrapper>
              )
            ) : (
              <ExcelImportContent showErrorFileTooBig={showErrorFileTooBig} />
            )}
          </PopupContentWrapper>
        }
        mainButton={
          showErrorsFromExcelPopup || excelErrorPopupLoading
            ? {
                text: "ייבוא נתונים",
                onClick: () => {},
                disabled: true,
              }
            : {
                text: "ייבוא נתונים",
                onClick: () => {
                  if (
                    uploadRef &&
                    typeof uploadRef !== "function" &&
                    "current" in uploadRef &&
                    uploadRef.current
                  ) {
                    uploadRef.current.click();
                  }
                },
                disabled: !(form?.fields?.length > 0),
              }
        }
        cancelButton={
          showErrorsFromExcelPopup || excelErrorPopupLoading
            ? {
                text: "הורדת תבנית",
                onClick: () => {},
                disabled: true,
              }
            : {
                text: "הורדת תבנית",
                onClick: () => createExcelMold(form),
                disabled: !(form?.fields?.length > 0),
              }
        }
      />
    );
  },
);

export default ImportFromExcelPopup;
