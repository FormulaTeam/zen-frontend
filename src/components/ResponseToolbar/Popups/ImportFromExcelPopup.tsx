import React, { memo, useCallback, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { createExcelMold } from "../../../utils/utils";
import ExcelImportContent from "../ExcelImportContent";
import { StoreForm } from "../../../pages/ResponsesPage/stores/form.store";
import Loader from "./Loader";
import {
  Chevron,
  EmptyValue,
  ErrorDetailRow,
  ErrorDetailsWrapper,
  ErrorGroup,
  ErrorGroupButton,
  ErrorGroupCount,
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
  StatusIcon,
  StatusTitle,
  StatusWrapper,
} from "./styled";
import Download from "@mui/icons-material/FileDownloadOutlined";

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    width: "920px",
    maxWidth: "calc(100vw - 48px)",
    maxHeight: "min(760px, calc(100vh - 48px))",
    borderRadius: "24px",
    backgroundColor: "#F1F5F9",
    boxShadow: "0 18px 45px rgba(15, 23, 42, 0.14)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    direction: "rtl",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(() => ({
  position: "relative",
  padding: "34px 36px 18px",
  textAlign: "center",
}));

const CloseButton = styled(IconButton)(() => ({
  position: "absolute",
  right: "24px",
  top: "24px",
  width: "36px",
  height: "36px",
  padding: 0,
  color: "#111827",
  backgroundColor: "transparent",
  borderRadius: 0,
  "&:hover": {
    backgroundColor: "transparent",
    color: "#475569",
  },
  "& svg": {
    fontSize: "34px",
  },
}));

const HeaderText = styled(Box)(() => ({
  paddingInlineEnd: 0,
}));

const TitleText = styled(Typography)(() => ({
  fontWeight: 800,
  fontSize: "44px",
  lineHeight: "54px",
  color: "#020617",
  letterSpacing: "-0.02em",

  "& span": {
    display: "inline-block",
  },
}));

const SubtitleText = styled(Typography)(() => ({
  marginTop: "12px",
  color: "#62748E",
  fontWeight: 400,
  fontSize: "17px",
  lineHeight: "28px",
}));

const Content = styled(DialogContent)(() => ({
  padding: "18px 36px 0",
  flex: 1,
  minHeight: 0,
  maxHeight: "min(560px, calc(100vh - 250px))",
  overflowY: "auto",
  overflowX: "hidden",
}));

const Actions = styled(DialogActions)(() => ({
  padding: "32px 36px 36px",
  gap: "12px",
  justifyContent: "flex-start",
  direction: "rtl",
}));

const SecondaryButton = styled(Button)(() => ({
  minWidth: "150px",
  height: "40px",
  padding: "0 18px",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  color: "#020617",
  borderColor: "#d8e2ef",
  backgroundColor: "#ffffff",
  boxShadow: "0 2px 6px rgba(15, 23, 42, 0.08)",
  direction: "ltr",
  gap: "8px",

  "& .MuiButton-startIcon": {
    margin: 0,
  },

  "& .MuiButton-startIcon svg": {
    fontSize: "22px",
  },

  "&:hover": {
    borderColor: "#cbd5e1",
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 10px rgba(15, 23, 42, 0.1)",
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  minWidth: "132px",
  height: "40px",
  padding: "0 20px",
  borderRadius: "8px",
  fontSize: "16px",
  fontWeight: 600,
  textTransform: "none",
  backgroundColor: theme.palette.primary.main,
  color: "#ffffff",
  boxShadow: "none",
  "&:hover": {
    backgroundColor: theme.palette.primary.dark,
    boxShadow: "none",
  },
}));

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
  isLuckyImport?: boolean;
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
  isLuckyImport = false,
}) => {
  const canPerformActions = hasFormFields(form);
  const [openFields, setOpenFields] = useState<Set<string>>(new Set());

  const generalErrors = useMemo(() => errors.filter((error) => error.isGeneral), [errors]);
  const fieldErrors = useMemo(() => errors.filter((error) => !error.isGeneral), [errors]);
  const groupedErrors = useMemo(() => groupErrorsByFieldAndMessage(fieldErrors), [fieldErrors]);
  const failedRowsCount = useMemo(() => getUniqueFailedRowsCount(fieldErrors), [fieldErrors]);

  const hasGeneralErrors = generalErrors.length > 0;
  const hasFieldErrors = fieldErrors.length > 0;

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

  const popupSubtitle =
    hasGeneralErrors || hasFieldErrors
      ? "לא נוצרו תגובות. תקנו את הערכים בקובץ ונסו לייבא שוב."
      : "הורידו תבנית, מלאו את הנתונים בהתאם לעמודות, ולאחר מכן ייבאו את הקובץ.";

  const popupContent = isLoading ? (
    isLuckyImport ? (
      <StatusWrapper>
        <StatusHeader>
          <StatusIcon>
            <InfoOutlinedIcon />
          </StatusIcon>

          <Box>
            <StatusTitle>מסדרים שיהיה לנו מה זה אחלה יום...</StatusTitle>
            <StatusDescription>הקובץ התקבל עם אנרגיות טובות ✨</StatusDescription>
          </Box>
        </StatusHeader>

        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Loader />
        </Box>
      </StatusWrapper>
    ) : (
      <Loader />
    )
  ) : hasGeneralErrors ? (
    <StatusWrapper>
      <StatusHeader>
        <StatusIcon>
          <InfoOutlinedIcon />
        </StatusIcon>

        <Box>
          <StatusTitle>לא ניתן לייבא את הקובץ</StatusTitle>

          {generalErrors.map((error, index) => (
            <StatusDescription key={index}>{error.message}</StatusDescription>
          ))}
        </Box>
      </StatusHeader>
    </StatusWrapper>
  ) : hasFieldErrors ? (
    <StatusWrapper>
      <StatusHeader>
        <StatusIcon>
          <InfoOutlinedIcon />
        </StatusIcon>

        <Box>
          <StatusTitle>הייבוא נעצר</StatusTitle>
          <StatusDescription>
            נמצאו שגיאות בקובץ. הייבוא נעצר כדי למנוע יצירת תגובות חלקיות.
          </StatusDescription>
        </Box>
      </StatusHeader>

      <ErrorSummary>
        נמצאו {fieldErrors.length} שגיאות {getFailedRowsLabel(failedRowsCount)}.
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

                <ErrorGroupCount>{group.totalErrorsCount}</ErrorGroupCount>
              </ErrorGroupButton>

              {isOpenGroup && (
                <ErrorDetailsWrapper>
                  {group.errors.map((errorGroup, index) => (
                    <ErrorDetailRow key={`${fieldKey}-${errorGroup.message}-${index}`}>
                      <ErrorMessageBlock>
                        <ErrorMessageText>{errorGroup.message}</ErrorMessageText>
                        {errorGroup.detail && (
                          <ErrorMessageDetail>{errorGroup.detail}</ErrorMessageDetail>
                        )}
                      </ErrorMessageBlock>

                      <RowNumbersText>
                        <span>שורות</span>
                        <strong>{getRowsLabel(errorGroup) || <EmptyValue>—</EmptyValue>}</strong>
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
    <ExcelImportContent
      showErrorFileTooBig={showFileTooBig}
      onDownloadTemplate={handleDownload}
      isDownloadTemplateDisabled={!canPerformActions}
    />
  );

  return (
    <StyledDialog open={isOpen} onClose={handleClose} scroll="paper">
      <StyledDialogTitle>
        <CloseButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </CloseButton>

        <HeaderText>
          <TitleText>Excel-ייבוא נתונים מ</TitleText>
          <SubtitleText>{popupSubtitle}</SubtitleText>
        </HeaderText>
      </StyledDialogTitle>

      <Content>
        <PopupContentWrapper>{popupContent}</PopupContentWrapper>
      </Content>

      <Actions>
        <PrimaryButton
          onClick={triggerUpload}
          variant="contained"
          disableElevation
          disabled={!canPerformActions}>
          {mainButtonLabel}
        </PrimaryButton>

        <SecondaryButton
          onClick={handleDownload}
          variant="outlined"
          disableElevation
          disabled={!canPerformActions}
          startIcon={<Download />}>
          {downloadButtonLabel}
        </SecondaryButton>
      </Actions>
    </StyledDialog>
  );
};

const ImportFromExcelPopup = memo(ImportFromExcelPopupInner);

export default ImportFromExcelPopup;
