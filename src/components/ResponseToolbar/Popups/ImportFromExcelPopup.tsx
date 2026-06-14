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

const StyledDialog = styled(Dialog)(() => ({
  "& .MuiPaper-root": {
    borderRadius: "16px",
    maxWidth: "760px",
    width: "calc(100% - 40px)",
    maxHeight: "min(720px, calc(100vh - 80px))",
    backgroundColor: "#ffffff",
    boxShadow: "0 20px 55px rgba(15, 23, 42, 0.18), 0 8px 22px rgba(15, 23, 42, 0.08)",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },
}));

const StyledDialogTitle = styled(DialogTitle)(() => ({
  position: "relative",
  padding: "28px 32px 12px",
}));

const CloseButton = styled(IconButton)(() => ({
  position: "absolute",
  insetInlineEnd: "18px",
  top: "18px",
  color: "#64748b",
  padding: "6px",
  borderRadius: "10px",
  "&:hover": {
    backgroundColor: "rgba(100, 116, 139, 0.08)",
  },
  "& svg": {
    fontSize: "26px",
  },
}));

const HeaderText = styled(Box)(() => ({
  paddingInlineEnd: "42px",
}));

const TitleText = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: "1.28rem",
  lineHeight: 1.35,
  color: "#0f172a",
}));

const SubtitleText = styled(Typography)(() => ({
  marginTop: "8px",
  color: "#64748b",
  fontWeight: 400,
  fontSize: "0.96rem",
  lineHeight: 1.55,
}));

const Content = styled(DialogContent)(() => ({
  padding: "18px 32px 0",
  flex: 1,
  minHeight: 0,
  maxHeight: "min(560px, calc(100vh - 240px))",
  overflowY: "auto",
  overflowX: "hidden",
}));

const Actions = styled(DialogActions)(() => ({
  padding: "30px 32px 30px",
  gap: "10px",
  justifyContent: "center",
}));

const SecondaryButton = styled(Button)(() => ({
  minWidth: "112px",
  height: "40px",
  borderRadius: "9px",
  fontSize: "0.95rem",
  fontWeight: 700,
  textTransform: "none",
  color: "#0f172a",
  borderColor: "#d8e2ef",
  backgroundColor: "#ffffff",
  boxShadow: "none",
  "&:hover": {
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    boxShadow: "none",
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  minWidth: "112px",
  height: "40px",
  borderRadius: "9px",
  fontSize: "0.95rem",
  fontWeight: 700,
  textTransform: "none",
  backgroundColor: theme.palette.primary.main,
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
    <Loader />
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
    <ExcelImportContent showErrorFileTooBig={showFileTooBig} />
  );

  return (
    <StyledDialog open={isOpen} onClose={handleClose} scroll="paper">
      <StyledDialogTitle>
        <CloseButton aria-label="close" onClick={handleClose}>
          <CloseIcon />
        </CloseButton>

        <HeaderText>
          <TitleText>ייבוא נתונים מאקסל</TitleText>
          <SubtitleText>{popupSubtitle}</SubtitleText>
        </HeaderText>
      </StyledDialogTitle>

      <Content>
        <PopupContentWrapper>{popupContent}</PopupContentWrapper>
      </Content>

      <Actions>
        <SecondaryButton
          onClick={handleDownload}
          variant="outlined"
          disableElevation
          disabled={!canPerformActions}>
          {downloadButtonLabel}
        </SecondaryButton>

        <PrimaryButton
          onClick={triggerUpload}
          variant="contained"
          disableElevation
          disabled={!canPerformActions}>
          {mainButtonLabel}
        </PrimaryButton>
      </Actions>
    </StyledDialog>
  );
};

const ImportFromExcelPopup = memo(ImportFromExcelPopupInner);

export default ImportFromExcelPopup;
